#!/usr/bin/env tsx
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  classifyChangedFiles,
  getComponentFromFile,
} from "../visual-regression/page-config";

const productionCommit = process.env.PRODUCTION_COMMIT;
const previousCommit = process.env.PREVIOUS_UPSTREAM_COMMIT;
const requestedComponents = process.env.REQUESTED_COMPONENTS ?? "";
const forceFull = process.env.FORCE_FULL === "true";
const contextPath = resolve(
  process.env.FLUE_CONTEXT_PATH ?? ".flue-runtime/context.json",
);
const findingsPath =
  process.env.VISUAL_REGRESSION_JSON_REPORT ??
  ".flue-runtime/visual-findings.json";

if (!productionCommit || !previousCommit) {
  throw new Error(
    "PRODUCTION_COMMIT and PREVIOUS_UPSTREAM_COMMIT are required",
  );
}

const changedFiles = execFileSync(
  "git",
  ["diff", "--name-only", previousCommit, productionCommit],
  { encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter(Boolean);
const classification = classifyChangedFiles(changedFiles);
const componentSet = new Set(
  requestedComponents
    .split(",")
    .map((component) => component.trim())
    .filter(Boolean),
);

if (componentSet.size === 0 && !forceFull) {
  for (const file of changedFiles) {
    const component = getComponentFromFile(file);
    if (component) componentSet.add(component);
  }
}

const fullRegression =
  forceFull ||
  (componentSet.size === 0 && classification.requiresFullRegression);
const context = {
  schemaVersion: 1,
  command: "astro-parity",
  readOnly: false,
  productionCommit,
  previousUpstreamCommit: previousCommit,
  changedFiles,
  components: Array.from(componentSet).sort(),
  fullRegression,
  findingsPath,
  verificationCommand: fullRegression
    ? `CI= pnpm visual-review:local -- --no-open --json ${findingsPath} --enforce`
    : `CI= VISUAL_REGRESSION_COMPONENTS=${Array.from(componentSet).sort().join(",")} pnpm visual-review:local -- --no-open --json ${findingsPath} --enforce`,
};

mkdirSync(dirname(contextPath), { recursive: true });
writeFileSync(contextPath, `${JSON.stringify(context, null, 2)}\n`, "utf8");
if (!fullRegression && componentSet.size === 0) {
  writeFileSync(
    resolve(findingsPath),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        thresholdPercent: 1,
        enforcementEnabled: true,
        beforeUrl: "https://kumo-ui.com",
        afterUrl: "",
        skipped: true,
        skipReason: "No visually relevant upstream changes detected.",
        summary: {
          comparisons: 0,
          changed: 0,
          unchanged: 0,
          captureErrors: 0,
          findings: 0,
          blockingFindings: 0,
        },
        findings: [],
        comparisons: [],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

const output = process.env.GITHUB_OUTPUT;
if (output) {
  writeFileSync(
    output,
    `components=${fullRegression ? "" : context.components.join(",")}\n`,
    {
      flag: "a",
    },
  );
  writeFileSync(output, `full=${String(fullRegression)}\n`, { flag: "a" });
  writeFileSync(
    output,
    `visual_relevant=${String(fullRegression || componentSet.size > 0)}\n`,
    { flag: "a" },
  );
}
