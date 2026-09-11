#!/usr/bin/env tsx
import { spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  type WriteStream,
} from "node:fs";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT_DIR = join(ROOT, "ci/visual-regression/local-report");
const REPORT_PATH = join(OUTPUT_DIR, "index.html");
const DEV_VARS_PATH = join(ROOT, "packages/kumo-screenshot-worker/.dev.vars");

interface ManagedProcess {
  name: string;
  child: ChildProcess;
  recentOutput: string;
}

function hasExited(child: ChildProcess): boolean {
  return child.exitCode !== null || child.signalCode !== null;
}

function getArgumentValue(name: string): string | undefined {
  const args = process.argv.slice(2);
  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function readLocalApiKey(): string {
  if (process.env.SCREENSHOT_API_KEY) return process.env.SCREENSHOT_API_KEY;
  if (existsSync(DEV_VARS_PATH)) {
    const line = readFileSync(DEV_VARS_PATH, "utf8")
      .split(/\r?\n/)
      .find((candidate) => /^\s*API_KEY\s*=/.test(candidate));
    const value = line?.replace(/^\s*API_KEY\s*=\s*/, "").trim();
    const key = value?.replace(/^(['"])(.*)\1$/, "$2");
    if (key) return key;
  }
  return `kumo-local-visual-review-${randomUUID()}`;
}

async function getFreePort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not allocate a local port."));
        return;
      }
      const { port } = address;
      server.close((error) => (error ? reject(error) : resolvePort(port)));
    });
  });
}

function startProcess(
  name: string,
  args: string[],
  log: WriteStream,
): ManagedProcess {
  const child = spawn("pnpm", args, {
    cwd: ROOT,
    env: process.env,
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const managed: ManagedProcess = { name, child, recentOutput: "" };

  const capture = (chunk: Buffer) => {
    const text = chunk.toString();
    log.write(`[${name}] ${text}`);
    managed.recentOutput = (managed.recentOutput + text).slice(-8_000);
  };
  child.stdout?.on("data", capture);
  child.stderr?.on("data", capture);
  return managed;
}

async function waitForService(
  processEntry: ManagedProcess,
  url: string,
  timeoutMs = 90_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (hasExited(processEntry.child)) {
      throw new Error(
        `${processEntry.name} exited before becoming ready.\n${processEntry.recentOutput}`,
      );
    }
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch {
      // The service is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }
  throw new Error(
    `${processEntry.name} did not become ready within ${timeoutMs / 1_000} seconds.\n${processEntry.recentOutput}`,
  );
}

async function stopProcess(processEntry: ManagedProcess): Promise<void> {
  if (hasExited(processEntry.child)) return;
  const signal = (name: NodeJS.Signals) => {
    if (process.platform !== "win32" && processEntry.child.pid) {
      try {
        process.kill(-processEntry.child.pid, name);
        return;
      } catch {
        // Fall back to signaling the direct child.
      }
    }
    processEntry.child.kill(name);
  };
  signal("SIGTERM");
  await Promise.race([
    new Promise<void>((resolveExit) =>
      processEntry.child.once("exit", () => resolveExit()),
    ),
    new Promise<void>((resolveWait) => setTimeout(resolveWait, 5_000)),
  ]);
  if (!hasExited(processEntry.child)) signal("SIGKILL");
}

async function runVisualReview(env: NodeJS.ProcessEnv): Promise<void> {
  await runCommand(
    ["tsx", "ci/visual-regression/run-visual-regression.ts", "--full"],
    env,
  );
}

async function runCommand(
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  const child = spawn("pnpm", args, { cwd: ROOT, env, stdio: "inherit" });
  const code = await new Promise<number | null>((resolveExit, reject) => {
    child.once("error", reject);
    child.once("exit", resolveExit);
  });
  if (code !== 0) {
    throw new Error(`Command failed with code ${code}: pnpm ${args.join(" ")}`);
  }
}

function openReport(): void {
  if (process.argv.includes("--no-open")) return;
  const command =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "cmd"
        : "xdg-open";
  const args =
    process.platform === "win32" ? ["/c", "start", REPORT_PATH] : [REPORT_PATH];
  spawn(command, args, { detached: true, stdio: "ignore" }).unref();
}

async function main(): Promise<void> {
  const apiKey = readLocalApiKey();
  const component = getArgumentValue("--component");
  const jsonArgument = getArgumentValue("--json");
  const hasJsonArgument = process.argv
    .slice(2)
    .some(
      (argument) => argument === "--json" || argument.startsWith("--json="),
    );
  if (hasJsonArgument && (!jsonArgument || jsonArgument.startsWith("--"))) {
    throw new Error("--json requires a report path.");
  }
  const jsonReportPath = jsonArgument ? resolve(jsonArgument) : undefined;
  const enforceThreshold = process.argv.includes("--enforce");
  const beforeUrl = process.env.BEFORE_URL ?? "https://kumo-ui.com";
  const [docsPort, workerPort] = await Promise.all([
    getFreePort(),
    getFreePort(),
  ]);
  const docsUrl = `http://127.0.0.1:${docsPort}`;
  const workerUrl = `http://127.0.0.1:${workerPort}`;

  if (!process.argv.includes("--skip-build")) {
    console.log("Building Kumo and the documentation production bundle...");
    await runCommand(["--filter", "@cloudflare/kumo", "build"]);
    await runCommand(["--filter", "@cloudflare/kumo-docs-astro", "build"]);
  }

  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const log = createWriteStream(join(OUTPUT_DIR, "services.log"));

  console.log("Starting local documentation and screenshot services...");
  const docs = startProcess(
    "docs",
    [
      "--filter",
      "@cloudflare/kumo-docs-astro",
      "exec",
      "astro",
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      String(docsPort),
    ],
    log,
  );
  const worker = startProcess(
    "worker",
    [
      "--filter",
      "@cloudflare/kumo-screenshot-worker",
      "exec",
      "wrangler",
      "dev",
      "--port",
      String(workerPort),
      "--var",
      `API_KEY:${apiKey}`,
    ],
    log,
  );
  const services = [docs, worker];

  const handleSignal = (signal: NodeJS.Signals) => {
    void Promise.all(services.map(stopProcess)).then(() => {
      process.exit(signal === "SIGINT" ? 130 : 143);
    });
  };
  process.once("SIGINT", handleSignal);
  process.once("SIGTERM", handleSignal);

  let visualReviewError: unknown;
  try {
    await Promise.all([
      waitForService(docs, docsUrl),
      waitForService(worker, workerUrl),
    ]);
    console.log(`Docs ready: ${docsUrl}`);
    console.log(`Screenshot service ready: ${workerUrl}`);
    console.log(
      component
        ? `Comparing component: ${component}`
        : "Comparing every documented component. This can take several minutes.",
    );

    try {
      await runVisualReview({
        ...process.env,
        BEFORE_URL: beforeUrl,
        AFTER_URL: docsUrl,
        SCREENSHOT_API_KEY: apiKey,
        SCREENSHOT_WORKER_URL: workerUrl,
        VISUAL_REGRESSION_OUTPUT_DIR: OUTPUT_DIR,
        VISUAL_REGRESSION_HTML_REPORT: REPORT_PATH,
        VISUAL_REGRESSION_JSON_REPORT:
          jsonReportPath ?? process.env.VISUAL_REGRESSION_JSON_REPORT,
        VISUAL_REGRESSION_ENFORCE_THRESHOLD: enforceThreshold
          ? "true"
          : process.env.VISUAL_REGRESSION_ENFORCE_THRESHOLD,
        VISUAL_REGRESSION_COMPONENTS:
          component ?? process.env.VISUAL_REGRESSION_COMPONENTS ?? "",
        GITHUB_TOKEN: "",
        GITHUB_PR_NUMBER: "",
        PR_NUMBER: "",
      });
    } catch (error) {
      visualReviewError = error;
    }
  } finally {
    await Promise.all(services.map(stopProcess));
    log.end();
    process.removeListener("SIGINT", handleSignal);
    process.removeListener("SIGTERM", handleSignal);
  }

  if (existsSync(REPORT_PATH)) {
    console.log(`\nVisual review complete: ${REPORT_PATH}`);
    openReport();
  }
  if (visualReviewError) throw visualReviewError;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
