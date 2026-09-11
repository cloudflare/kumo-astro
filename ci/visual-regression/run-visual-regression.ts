#!/usr/bin/env tsx
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import {
  CANARY_COMPONENTS,
  COMPONENT_ACTIONS,
  classifyChangedFiles,
  discoverComponents,
  getAffectedComponents,
  getComponentFromFile,
  type DiscoveredComponent,
} from "./page-config";

// CI always uses the pinned deployed Worker. Local runs may point at Wrangler
// without allowing a pull request to redirect secret-bearing CI requests.
const DEPLOYED_WORKER_URL =
  "https://kumo-screenshot-worker.design-engineering.workers.dev";
const WORKER_URL = process.env.CI
  ? DEPLOYED_WORKER_URL
  : (process.env.SCREENSHOT_WORKER_URL ?? DEPLOYED_WORKER_URL);
const SCREENSHOTS_DIR =
  process.env.VISUAL_REGRESSION_OUTPUT_DIR ??
  "ci/visual-regression/screenshots";
const HTML_REPORT_PATH = process.env.VISUAL_REGRESSION_HTML_REPORT;
const JSON_REPORT_PATH = process.env.VISUAL_REGRESSION_JSON_REPORT;
const API_KEY = process.env.SCREENSHOT_API_KEY ?? "";
const MAX_BATCH_PAGES = 50;
const SECTION_CAPTURE_WIDTH = 720;
const JSON_REPORT_SCHEMA_VERSION = 1;

/**
 * Screenshot result returned by the worker.
 *
 * For section-based screenshots (when `captureSections` was true and
 * `[data-vr-demo]` elements were found), each element produces one result with:
 * - `sectionId`: from `data-vr-section` attribute (e.g., "primary-variant")
 * - `sectionTitle`: from `data-vr-title` attribute (e.g., "Primary Variant")
 *
 * These identifiers are used to create stable screenshot filenames that
 * persist across runs, enabling accurate before/after comparisons.
 */
interface ScreenshotResult {
  url: string;
  /** Base64-encoded PNG image */
  image?: string;
  /** Worker-served URL for the stored PNG */
  imageUrl?: string;
  error?: string;
  /** Unique identifier for this demo section, from data-vr-section attribute */
  sectionId?: string;
  /** Human-readable title for reports, from data-vr-title attribute */
  sectionTitle?: string;
}

interface WorkerResponse {
  results: ScreenshotResult[];
}

interface CapturedScreenshot {
  id: string;
  name: string;
  path: string;
  url: string | null;
}

type CapturePhase = "before" | "after";

interface CaptureError {
  id: string;
  name: string;
  phase: CapturePhase;
  url: string;
  message: string;
}

interface CaptureResult {
  screenshots: CapturedScreenshot[];
  errors: CaptureError[];
}

interface ComparisonResult {
  id: string;
  name: string;
  beforeUrl: string | null;
  afterUrl: string | null;
  diffUrl: string | null;
  beforePath: string | null;
  afterPath: string | null;
  diffPath: string | null;
  issue?: string;
  issueType?: "missing-screenshot" | "new-screenshot";
  changed: boolean;
  diffPixels: number;
  diffPercent: number;
  exactDiffPercent: number;
}

interface VisualRegressionFinding {
  type:
    | "pixel-diff"
    | "missing-screenshot"
    | "new-screenshot"
    | "capture-error";
  id: string;
  name: string;
  message: string;
  blocking: boolean;
  phase?: CapturePhase;
  url?: string;
  diffPixels?: number;
  diffPercent?: number;
  beforeUrl?: string | null;
  afterUrl?: string | null;
  diffUrl?: string | null;
  beforePath?: string | null;
  afterPath?: string | null;
  diffPath?: string | null;
}

interface VisualRegressionJsonReport {
  schemaVersion: typeof JSON_REPORT_SCHEMA_VERSION;
  generatedAt: string;
  thresholdPercent: number;
  enforcementEnabled: boolean;
  beforeUrl: string;
  afterUrl: string;
  skipped: boolean;
  skipReason: string | null;
  summary: {
    comparisons: number;
    changed: number;
    unchanged: number;
    captureErrors: number;
    findings: number;
    blockingFindings: number;
  };
  findings: VisualRegressionFinding[];
  comparisons: Array<
    Omit<ComparisonResult, "exactDiffPercent"> & {
      diffPercent: number;
      blocking: boolean;
    }
  >;
}

function getChangedFiles(): string[] | null {
  try {
    const base = process.env.GITHUB_BASE_REF || "main";
    // Use PR_HEAD_SHA when provided. CI checks out main for security (to avoid
    // running untrusted PR code with secrets), so HEAD points to main. The PR's
    // head commit is fetched separately and passed via PR_HEAD_SHA.
    const head = process.env.PR_HEAD_SHA || "HEAD";
    // Use two-dot diff (A..B) instead of three-dot (A...B) because shallow
    // clones don't have enough history to compute merge-base.
    const output = execSync(`git diff --name-only origin/${base}..${head}`, {
      encoding: "utf-8",
    });
    return output.trim().split("\n").filter(Boolean);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`git diff failed, falling back to full regression: ${msg}`);
    return null;
  }
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function getThresholdPercent(): number {
  const value = process.env.VISUAL_REGRESSION_THRESHOLD_PERCENT ?? "1";
  const threshold = Number(value);
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 100) {
    throw new Error(
      `VISUAL_REGRESSION_THRESHOLD_PERCENT must be a number from 0 to 100; received ${JSON.stringify(value)}.`,
    );
  }
  return threshold;
}

function isThresholdEnforced(): boolean {
  return process.env.VISUAL_REGRESSION_ENFORCE_THRESHOLD === "true";
}

function sanitizeKeyPart(value: string): string {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "visual-regression";
}

function encodeScreenshotKey(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}

function getRunStoragePrefix(): string {
  const prNumber =
    process.env.GITHUB_PR_NUMBER ?? process.env.PR_NUMBER ?? "local";
  const runId = process.env.GITHUB_RUN_ID ?? Date.now().toString();
  const headSha =
    process.env.PR_HEAD_SHA ?? process.env.GITHUB_SHA ?? "unknown";

  return [
    "runs",
    `pr-${sanitizeKeyPart(prNumber)}`,
    `run-${sanitizeKeyPart(runId)}`,
    sanitizeKeyPart(headSha.substring(0, 12)),
  ].join("/");
}

async function uploadScreenshotToWorker(
  imageBuffer: Buffer,
  key: string,
): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "image/png",
  };
  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  const response = await fetch(
    `${WORKER_URL}/screenshots/${encodeScreenshotKey(key)}`,
    {
      method: "PUT",
      headers,
      body: imageBuffer,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Worker upload failed: ${response.status} - ${await response.text()}`,
    );
  }

  return `${WORKER_URL}/screenshots/${encodeScreenshotKey(key)}`;
}

/**
 * Request sent to the screenshot worker for each page.
 *
 * When `captureSections` is true, the worker should:
 * 1. Query `document.querySelectorAll('[data-vr-demo]')` to find all demo sections
 * 2. For each demo element:
 *    - Scroll it into view (with margin for context)
 *    - Take an element-level screenshot (not full page)
 *    - Return a ScreenshotResult with:
 *      - `sectionId` from `data-vr-section` attribute
 *      - `sectionTitle` from `data-vr-title` attribute
 * 3. If no `[data-vr-demo]` elements exist, fall back to full-page screenshot
 *
 * This ensures stable, per-component screenshots that don't shift based on
 * scroll position or page layout changes.
 */
interface PageRequest {
  url: string;
  captureSections: boolean;
  hideSidebar: boolean;
  actions?: Array<{
    type: "click" | "hover" | "css";
    selector?: string;
    css?: string;
    waitAfter?: number;
  }>;
}

function getScreenshotIdentity(
  result: ScreenshotResult,
  requests: PageRequest[],
): { id: string; name: string } {
  const urlPath = new URL(result.url).pathname.replace(/\/$/, "");
  const componentSlug = urlPath.split("/").pop() || "unknown";
  const isOpenState = requests.some(
    (request) =>
      request.url === urlPath &&
      request.actions?.some(
        (action) => action.type === "click" || action.type === "hover",
      ),
  );

  if (result.sectionId) {
    return {
      id: `${componentSlug}-${result.sectionId}`,
      name: `${formatName(componentSlug)} / ${result.sectionTitle || result.sectionId}`,
    };
  }
  if (isOpenState) {
    return {
      id: `${componentSlug}-open`,
      name: `${formatName(componentSlug)} (Open)`,
    };
  }
  return { id: componentSlug, name: formatName(componentSlug) };
}

async function captureScreenshots(
  baseUrl: string,
  components: DiscoveredComponent[],
  outputDir: string,
  prefix: string,
  storagePrefix: string,
  phase: CapturePhase,
): Promise<CaptureResult> {
  ensureDir(outputDir);
  const screenshots: CapturedScreenshot[] = [];
  const errors: CaptureError[] = [];

  const requests: PageRequest[] = [];

  for (const component of components) {
    requests.push({
      url: component.url,
      captureSections: true,
      hideSidebar: true,
      actions: [
        {
          type: "css",
          css: `[data-vr-demo] { box-sizing: border-box !important; width: ${SECTION_CAPTURE_WIDTH}px !important; min-width: ${SECTION_CAPTURE_WIDTH}px !important; max-width: ${SECTION_CAPTURE_WIDTH}px !important; }`,
        },
      ],
    });

    const action = COMPONENT_ACTIONS[component.id];
    if (action) {
      requests.push({
        url: component.url,
        captureSections: false,
        hideSidebar: true,
        actions: [action],
      });
    }
  }

  console.log(`Capturing screenshots from ${baseUrl}...`);
  console.log(`  ${components.length} components, ${requests.length} requests`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  const results: ScreenshotResult[] = [];
  for (let offset = 0; offset < requests.length; offset += MAX_BATCH_PAGES) {
    const pages = requests.slice(offset, offset + MAX_BATCH_PAGES);
    const batchNumber = Math.floor(offset / MAX_BATCH_PAGES) + 1;
    const batchCount = Math.ceil(requests.length / MAX_BATCH_PAGES);
    if (batchCount > 1) {
      console.log(
        `  Batch ${batchNumber}/${batchCount} (${pages.length} requests)`,
      );
    }

    const response = await fetch(`${WORKER_URL}/batch`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        baseUrl,
        pages,
        viewport: { width: 1440, height: 900 },
        hideSidebar: true,
        storage: {
          prefix: storagePrefix,
          includeImage: true,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Worker request failed: ${response.status} - ${text}`);
    }

    const data = (await response.json()) as WorkerResponse;
    results.push(...data.results);
  }

  for (const result of results) {
    const identity = getScreenshotIdentity(result, requests);
    if (result.error) {
      console.warn(`  Error: ${result.url}: ${result.error}`);
      errors.push({
        ...identity,
        phase,
        url: result.url,
        message: result.error,
      });
      continue;
    }

    if (!result.image) {
      console.warn(`  Empty: ${result.url}`);
      errors.push({
        ...identity,
        phase,
        url: result.url,
        message: "Screenshot worker returned no image data.",
      });
      continue;
    }

    const { id: screenshotId, name: screenshotName } = identity;

    const filename = `${prefix}-${screenshotId}.png`;
    const filepath = join(outputDir, filename);

    const imageBuffer = Buffer.from(result.image, "base64");
    writeFileSync(filepath, imageBuffer);

    const imageUrl = result.imageUrl ?? null;
    console.log(
      imageUrl
        ? `  OK: ${screenshotName} -> ${imageUrl}`
        : `  OK: ${screenshotName} (local only, no worker URL)`,
    );

    screenshots.push({
      id: screenshotId,
      name: screenshotName,
      path: filepath,
      url: imageUrl,
    });
  }

  return { screenshots, errors };
}

function formatName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface DiffResult {
  changed: boolean;
  diffPixels: number;
  diffPercent: number;
  exactDiffPercent: number;
  /** Raw PNG buffer of the diff image, null if images are identical or missing */
  diffImage: Buffer | null;
}

function compareImages(beforePath: string, afterPath: string): DiffResult {
  if (!existsSync(beforePath) || !existsSync(afterPath)) {
    return {
      changed: true,
      diffPixels: 0,
      diffPercent: 100,
      exactDiffPercent: 100,
      diffImage: null,
    };
  }

  const beforeBuf = readFileSync(beforePath);
  const afterBuf = readFileSync(afterPath);

  // Fast path: byte-identical images need no pixel comparison
  if (beforeBuf.equals(afterBuf)) {
    return {
      changed: false,
      diffPixels: 0,
      diffPercent: 0,
      exactDiffPercent: 0,
      diffImage: null,
    };
  }

  const beforePng = PNG.sync.read(beforeBuf);
  const afterPng = PNG.sync.read(afterBuf);

  // Handle size mismatches by padding the smaller image
  const width = Math.max(beforePng.width, afterPng.width);
  const height = Math.max(beforePng.height, afterPng.height);

  const padToSize = (png: PNG, w: number, h: number): Uint8Array => {
    if (png.width === w && png.height === h) {
      return new Uint8Array(
        png.data.buffer,
        png.data.byteOffset,
        png.data.byteLength,
      );
    }
    const padded = new Uint8Array(w * h * 4);
    for (let y = 0; y < png.height; y++) {
      const srcOffset = y * png.width * 4;
      const dstOffset = y * w * 4;
      padded.set(
        png.data.subarray(srcOffset, srcOffset + png.width * 4),
        dstOffset,
      );
    }
    return padded;
  };

  const beforeData = padToSize(beforePng, width, height);
  const afterData = padToSize(afterPng, width, height);
  const diffData = new Uint8Array(width * height * 4);

  const diffPixels = pixelmatch(
    beforeData,
    afterData,
    diffData,
    width,
    height,
    {
      threshold: 0.1,
      diffColor: [255, 0, 0],
      alpha: 0.3,
    },
  );

  const totalPixels = width * height;
  const diffPercent = totalPixels > 0 ? (diffPixels / totalPixels) * 100 : 0;

  const diffPng = new PNG({ width, height });
  diffPng.data = Buffer.from(diffData);
  const changed = diffPixels > 0;

  return {
    changed,
    diffPixels,
    diffPercent: Math.round(diffPercent * 100) / 100,
    exactDiffPercent: diffPercent,
    diffImage: changed ? PNG.sync.write(diffPng) : null,
  };
}

function generateMarkdownReport(comparisons: ComparisonResult[]): string {
  const changed = comparisons.filter((c) => c.changed);
  const unchanged = comparisons.filter((c) => !c.changed);

  const lines: string[] = [
    "<!-- kumo-visual-regression -->",
    "<details>",
    `<summary><b>Visual Regression Report</b> — ${changed.length} changed, ${unchanged.length} unchanged</summary>`,
    "",
  ];

  if (changed.length === 0) {
    lines.push("No visual changes detected.");
    lines.push("</details>");
    return lines.join("\n");
  }

  lines.push(`**${changed.length} screenshot(s) with visual changes:**`);
  lines.push("");

  for (const comp of changed) {
    const diffLabel = comp.issue
      ? comp.issue
      : `${comp.diffPixels.toLocaleString()} px (${comp.diffPercent}%) changed`;
    lines.push(`### ${comp.name}`);
    lines.push(diffLabel);
    lines.push("");
    lines.push("| Before | After | Diff |");
    lines.push("|--------|-------|------|");
    const diffCell = comp.diffUrl ? `![Diff](${comp.diffUrl})` : "*no diff*";
    const beforeCell = comp.beforeUrl
      ? `![Before](${comp.beforeUrl})`
      : "*missing*";
    const afterCell = comp.afterUrl
      ? `![After](${comp.afterUrl})`
      : "*missing*";
    lines.push(`| ${beforeCell} | ${afterCell} | ${diffCell} |`);
    lines.push("");
  }

  if (unchanged.length > 0) {
    lines.push("<details>");
    lines.push(
      `<summary>${unchanged.length} screenshot(s) unchanged</summary>`,
    );
    lines.push("");
    unchanged.forEach((c) => lines.push(`- ${c.name}`));
    lines.push("</details>");
  }

  lines.push("");
  lines.push("---");
  lines.push("*Generated by Kumo Visual Regression*");
  lines.push("</details>");

  return lines.join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getReportImageSrc(reportPath: string, imagePath: string): string {
  return relative(dirname(resolve(reportPath)), resolve(imagePath))
    .split(/[\\/]/)
    .map(encodeURIComponent)
    .join("/");
}

function generateHtmlReport(
  comparisons: ComparisonResult[],
  reportPath: string,
  beforeUrl: string,
  afterUrl: string,
  thresholdPercent: number,
): string {
  const changed = comparisons.filter((comparison) => comparison.changed);
  const unchanged = comparisons.filter((comparison) => !comparison.changed);
  const aboveThreshold = comparisons.filter(
    (comparison) =>
      !comparison.issue && comparison.exactDiffPercent > thresholdPercent,
  );
  const ordered = [...changed, ...unchanged];

  const renderFigure = (
    label: string,
    path: string | null,
    alt: string,
  ): string => {
    if (!path) {
      return `<figure><figcaption>${label}</figcaption><div class="empty">Missing screenshot</div></figure>`;
    }
    const src = getReportImageSrc(reportPath, path);
    return `<figure><figcaption>${label}</figcaption><a href="${src}"><img src="${src}" alt="${escapeHtml(alt)}" loading="lazy"></a></figure>`;
  };

  const cards = ordered
    .map((comparison) => {
      const diff = comparison.issue
        ? '<figure><figcaption>Diff</figcaption><div class="empty">Comparison unavailable</div></figure>'
        : comparison.diffPath
          ? renderFigure(
              "Diff",
              comparison.diffPath,
              `Diff for ${comparison.name}`,
            )
          : '<figure><figcaption>Diff</figcaption><div class="empty">No changed pixels</div></figure>';
      const status = comparison.changed ? "changed" : "unchanged";
      const finding =
        comparison.issue ??
        (comparison.changed
          ? `${comparison.diffPixels.toLocaleString()} px (${comparison.diffPercent}%) changed`
          : "No visual changes");

      return `<details class="result ${status}" data-above-threshold="${!comparison.issue && comparison.exactDiffPercent > thresholdPercent}" ${comparison.changed ? "open" : ""}>
        <summary><span>${escapeHtml(comparison.name)}</span><strong>${escapeHtml(finding)}</strong></summary>
        <div class="images">
          ${renderFigure("Production", comparison.beforePath, `Production rendering of ${comparison.name}`)}
          ${renderFigure("Local", comparison.afterPath, `Local rendering of ${comparison.name}`)}
          ${diff}
        </div>
      </details>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kumo Local Visual Review</title>
  <style>
    :root { color-scheme: light dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #111; color: #f5f5f5; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #111; color: #f5f5f5; }
    header { position: sticky; top: 0; z-index: 2; padding: 24px clamp(20px, 4vw, 64px); background: rgb(17 17 17 / 94%); border-bottom: 1px solid #333; backdrop-filter: blur(12px); }
    h1 { margin: 0 0 8px; font-size: clamp(24px, 4vw, 40px); letter-spacing: -0.03em; }
    header p { margin: 4px 0; color: #aaa; overflow-wrap: anywhere; }
    .stats { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 18px; }
    .stat { padding: 8px 12px; border: 1px solid #3a3a3a; border-radius: 999px; background: #1d1d1d; font-size: 14px; }
    .stat.changed { border-color: #7f312d; color: #ff9f98; }
    button.stat { color: inherit; cursor: pointer; font: inherit; }
    button.stat[aria-pressed="true"] { border-color: #b79042; color: #ffd783; }
    button.stat:disabled { cursor: default; opacity: .55; }
    [hidden] { display: none !important; }
    main { display: grid; gap: 14px; padding: 24px clamp(20px, 4vw, 64px) 64px; }
    details { border: 1px solid #333; border-radius: 12px; overflow: clip; background: #181818; }
    details.changed { border-color: #71312e; }
    summary { display: flex; justify-content: space-between; gap: 20px; padding: 16px 18px; cursor: pointer; font-size: 15px; }
    summary strong { color: #9bd49b; font-size: 13px; font-weight: 600; }
    .changed summary strong { color: #ff9f98; }
    .images { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; border-top: 1px solid #333; background: #333; }
    figure { min-width: 0; margin: 0; padding: 14px; background: #151515; }
    figcaption { margin-bottom: 10px; color: #aaa; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    img { display: block; width: 100%; height: auto; min-height: 100px; border-radius: 7px; background: white; object-fit: contain; }
    .empty { display: grid; min-height: 180px; place-items: center; border: 1px dashed #444; border-radius: 7px; color: #777; }
    @media (max-width: 900px) { .images { grid-template-columns: 1fr; } summary { align-items: flex-start; flex-direction: column; gap: 6px; } }
  </style>
</head>
<body>
  <header>
    <h1>Kumo Local Visual Review</h1>
    <p>Production: ${escapeHtml(beforeUrl)}</p>
    <p>Local: ${escapeHtml(afterUrl)}</p>
    <p>Generated ${escapeHtml(new Date().toLocaleString())}</p>
    <div class="stats">
      <span class="stat changed">${changed.length} changed</span>
      <span class="stat">${unchanged.length} unchanged</span>
      <span class="stat">${comparisons.length} compared</span>
      <button class="stat" id="threshold-filter" type="button" aria-pressed="false" ${aboveThreshold.length === 0 ? "disabled" : ""}>${aboveThreshold.length} above ${thresholdPercent}% change</button>
    </div>
  </header>
  <main>${cards || '<div class="empty">No matching screenshots were available to compare.</div>'}</main>
  <script>
    const thresholdFilter = document.querySelector("#threshold-filter");
    thresholdFilter?.addEventListener("click", () => {
      const active = thresholdFilter.getAttribute("aria-pressed") !== "true";
      thresholdFilter.setAttribute("aria-pressed", String(active));
      document.querySelectorAll(".result").forEach((result) => {
        result.hidden = active && result.getAttribute("data-above-threshold") !== "true";
      });
    });
  </script>
</body>
</html>`;
}

function createJsonReport(
  comparisons: ComparisonResult[],
  captureErrors: CaptureError[],
  thresholdPercent: number,
  enforcementEnabled: boolean,
  beforeUrl: string,
  afterUrl: string,
  skipReason: string | null = null,
): VisualRegressionJsonReport {
  const findings: VisualRegressionFinding[] = [];

  for (const comparison of comparisons) {
    if (!comparison.changed) continue;

    const type = comparison.issueType ?? "pixel-diff";
    const blocking =
      type !== "pixel-diff" || comparison.exactDiffPercent > thresholdPercent;
    findings.push({
      type,
      id: comparison.id,
      name: comparison.name,
      message:
        comparison.issue ??
        `${comparison.diffPixels.toLocaleString()} px (${comparison.diffPercent}%) changed`,
      blocking,
      diffPixels: comparison.diffPixels,
      diffPercent: comparison.exactDiffPercent,
      beforeUrl: comparison.beforeUrl,
      afterUrl: comparison.afterUrl,
      diffUrl: comparison.diffUrl,
      beforePath: comparison.beforePath,
      afterPath: comparison.afterPath,
      diffPath: comparison.diffPath,
    });
  }

  for (const error of captureErrors) {
    findings.push({
      type: "capture-error",
      id: error.id,
      name: error.name,
      message: error.message,
      blocking: true,
      phase: error.phase,
      url: error.url,
    });
  }

  const changed = comparisons.filter((comparison) => comparison.changed).length;
  const blockingFindings = findings.filter(
    (finding) => finding.blocking,
  ).length;
  const jsonComparisons = comparisons.map(
    ({ exactDiffPercent, ...comparison }) => ({
      ...comparison,
      diffPercent: exactDiffPercent,
      blocking:
        comparison.issueType !== undefined ||
        exactDiffPercent > thresholdPercent,
    }),
  );

  return {
    schemaVersion: JSON_REPORT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    thresholdPercent,
    enforcementEnabled,
    beforeUrl,
    afterUrl,
    skipped: skipReason !== null,
    skipReason,
    summary: {
      comparisons: comparisons.length,
      changed,
      unchanged: comparisons.length - changed,
      captureErrors: captureErrors.length,
      findings: findings.length,
      blockingFindings,
    },
    findings,
    comparisons: jsonComparisons,
  };
}

function writeJsonReport(report: VisualRegressionJsonReport): void {
  if (!JSON_REPORT_PATH) return;
  ensureDir(dirname(JSON_REPORT_PATH));
  writeFileSync(JSON_REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`JSON report: ${resolve(JSON_REPORT_PATH)}`);
}

async function postPRComment(body: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const prNumber = process.env.GITHUB_PR_NUMBER ?? process.env.PR_NUMBER;
  const repo = process.env.GITHUB_REPOSITORY ?? "cloudflare/kumo";

  if (!token || !prNumber) {
    console.log("Missing GITHUB_TOKEN or PR_NUMBER, skipping PR comment");
    console.log("\n--- Report ---\n");
    console.log(body);
    return;
  }

  const [owner, repoName] = repo.split("/");
  const marker = "<!-- kumo-visual-regression -->";

  const commentsResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/issues/${prNumber}/comments`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );

  const comments = (await commentsResponse.json()) as Array<{
    id: number;
    body?: string;
  }>;
  const existingComment = comments.find((c) => c.body?.startsWith(marker));

  const url = existingComment
    ? `https://api.github.com/repos/${owner}/${repoName}/issues/comments/${existingComment.id}`
    : `https://api.github.com/repos/${owner}/${repoName}/issues/${prNumber}/comments`;

  const method = existingComment ? "PATCH" : "POST";

  await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body }),
  });

  console.log(`PR comment ${existingComment ? "updated" : "created"}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const fullRegression = args.includes("--full");
  const thresholdPercent = getThresholdPercent();
  const enforcementEnabled = isThresholdEnforced();

  const beforeUrl = process.env.BEFORE_URL ?? "https://kumo-ui.com";
  const afterUrl =
    process.env.AFTER_URL ?? process.env.PREVIEW_URL ?? beforeUrl;
  const captureErrors: CaptureError[] = [];

  const writeCurrentJsonReport = (
    comparisons: ComparisonResult[],
    skipReason: string | null = null,
  ): VisualRegressionJsonReport => {
    const jsonReport = createJsonReport(
      comparisons,
      captureErrors,
      thresholdPercent,
      enforcementEnabled,
      beforeUrl,
      afterUrl,
      skipReason,
    );
    writeJsonReport(jsonReport);
    return jsonReport;
  };

  console.log("Discovering components from docs site...");
  const allComponents = await discoverComponents(beforeUrl);
  console.log(`Found ${allComponents.length} components\n`);

  let components: DiscoveredComponent[];
  const requestedComponents = (process.env.VISUAL_REGRESSION_COMPONENTS ?? "")
    .split(",")
    .map((component) => component.trim())
    .filter(Boolean);

  if (requestedComponents.length > 0) {
    const requested = new Set(requestedComponents);
    components = allComponents.filter((component) =>
      requested.has(component.id),
    );
    const missing = requestedComponents.filter(
      (component) =>
        !components.some((candidate) => candidate.id === component),
    );
    if (missing.length > 0) {
      throw new Error(`Unknown component(s): ${missing.join(", ")}`);
    }
    console.log(
      `Running visual regression for: ${components.map((component) => component.id).join(", ")}\n`,
    );
  } else if (fullRegression) {
    components = allComponents;
    console.log(
      `Running full visual regression (${components.length} components)...\n`,
    );
  } else {
    const changedFiles = getChangedFiles();

    // If git diff failed, we don't know what changed — run full regression to be safe
    if (changedFiles === null) {
      components = allComponents;
      console.log(
        `Running full visual regression (${components.length} components, git diff unavailable)...\n`,
      );
    } else {
      const classification = classifyChangedFiles(changedFiles);

      if (classification.allSkippable) {
        const reason = "No visually relevant file changes detected.";
        console.log(`${reason} Skipping visual regression.`);
        writeCurrentJsonReport([], reason);
        return;
      }

      if (classification.requiresFullRegression) {
        components = allComponents.filter((c) =>
          CANARY_COMPONENTS.includes(c.id),
        );
        const broadFiles = changedFiles.filter((f) => !getComponentFromFile(f));
        console.log("Broad-impact files changed (running canary regression):");
        broadFiles.slice(0, 10).forEach((f) => console.log(`  - ${f}`));
        if (broadFiles.length > 10) {
          console.log(`  ... and ${broadFiles.length - 10} more`);
        }
        console.log(
          `\nRunning canary regression on ${components.length} representative component(s):\n`,
        );
        components.forEach((c) => console.log(`  - ${c.name} (${c.url})`));
      } else {
        components = getAffectedComponents(changedFiles, allComponents);

        if (components.length === 0) {
          const reason =
            "Changed components were not found in the documentation site.";
          console.log(`${reason} Skipping visual regression.`);
          writeCurrentJsonReport([], reason);
          return;
        }

        console.log(`Found ${components.length} affected component(s):`);
        components.forEach((c) => console.log(`  - ${c.name} (${c.url})`));
        console.log("");
      }
    }
  }

  const beforeDir = join(SCREENSHOTS_DIR, "before");
  const afterDir = join(SCREENSHOTS_DIR, "after");
  const storagePrefix = getRunStoragePrefix();

  console.log("=== Capturing BEFORE screenshots ===");
  let beforeCapture: CaptureResult;
  try {
    beforeCapture = await captureScreenshots(
      beforeUrl,
      components,
      beforeDir,
      "before",
      `${storagePrefix}/before`,
      "before",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    captureErrors.push({
      id: "before-capture",
      name: "Before capture",
      phase: "before",
      url: beforeUrl,
      message,
    });
    writeCurrentJsonReport([]);
    throw error;
  }
  captureErrors.push(...beforeCapture.errors);

  console.log("\n=== Capturing AFTER screenshots ===");
  let afterCapture: CaptureResult;
  try {
    afterCapture = await captureScreenshots(
      afterUrl,
      components,
      afterDir,
      "after",
      `${storagePrefix}/after`,
      "after",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    captureErrors.push({
      id: "after-capture",
      name: "After capture",
      phase: "after",
      url: afterUrl,
      message,
    });
    writeCurrentJsonReport([]);
    throw error;
  }
  captureErrors.push(...afterCapture.errors);

  console.log("\n=== Comparing screenshots ===");
  const comparisons: ComparisonResult[] = [];

  const beforeMap = new Map(
    beforeCapture.screenshots.map((screenshot) => [screenshot.id, screenshot]),
  );
  const afterMap = new Map(
    afterCapture.screenshots.map((screenshot) => [screenshot.id, screenshot]),
  );

  const allIds = Array.from(
    new Set([...Array.from(beforeMap.keys()), ...Array.from(afterMap.keys())]),
  );

  for (const id of allIds) {
    const before = beforeMap.get(id);
    const after = afterMap.get(id);

    if (!before || !after) {
      const available = before ?? after;
      comparisons.push({
        id,
        name: available?.name ?? id,
        beforeUrl: before?.url ?? null,
        afterUrl: after?.url ?? null,
        diffUrl: null,
        beforePath: before?.path ?? null,
        afterPath: after?.path ?? null,
        diffPath: null,
        issue: before
          ? "Missing from local documentation"
          : "New in local documentation",
        issueType: before ? "missing-screenshot" : "new-screenshot",
        changed: true,
        diffPixels: 0,
        diffPercent: 100,
        exactDiffPercent: 100,
      });
      console.log(
        `  ${available?.name ?? id}: ${before ? "MISSING LOCALLY" : "NEW LOCALLY"}`,
      );
      continue;
    }
    const diff = compareImages(before.path, after.path);

    let diffUrl: string | null = null;
    let diffPath: string | null = null;
    if (diff.changed && diff.diffImage) {
      const diffFilename = `diff-${id}.png`;
      diffPath = join(SCREENSHOTS_DIR, "diff", diffFilename);
      ensureDir(join(SCREENSHOTS_DIR, "diff"));
      writeFileSync(diffPath, diff.diffImage);

      try {
        diffUrl = await uploadScreenshotToWorker(
          diff.diffImage,
          `${storagePrefix}/diff/${diffFilename}`,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  Diff upload failed for ${before.name}: ${msg}`);
      }
    }

    comparisons.push({
      id,
      name: before.name,
      beforeUrl: before.url,
      afterUrl: after.url,
      diffUrl,
      beforePath: before.path,
      afterPath: after.path,
      diffPath,
      changed: diff.changed,
      diffPixels: diff.diffPixels,
      diffPercent: diff.diffPercent,
      exactDiffPercent: diff.exactDiffPercent,
    });

    if (diff.changed) {
      console.log(
        `  ${before.name}: CHANGED (${diff.diffPixels} px, ${diff.diffPercent}%)`,
      );
    } else {
      console.log(`  ${before.name}: unchanged`);
    }
  }

  console.log("\n=== Generating report ===");
  const report = generateMarkdownReport(comparisons);
  if (HTML_REPORT_PATH) {
    ensureDir(dirname(HTML_REPORT_PATH));
    writeFileSync(
      HTML_REPORT_PATH,
      generateHtmlReport(
        comparisons,
        HTML_REPORT_PATH,
        beforeUrl,
        afterUrl,
        thresholdPercent,
      ),
    );
    console.log(`HTML report: ${resolve(HTML_REPORT_PATH)}`);
  } else {
    await postPRComment(report);
  }

  const jsonReport = writeCurrentJsonReport(comparisons);
  if (enforcementEnabled && jsonReport.summary.blockingFindings > 0) {
    throw new Error(
      `Visual regression found ${jsonReport.summary.blockingFindings} blocking finding(s) at a ${thresholdPercent}% threshold.`,
    );
  }
}

main().catch((error) => {
  console.error("Visual regression failed:", error);
  process.exit(1);
});
