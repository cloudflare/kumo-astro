#!/usr/bin/env tsx
import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const VERSION_URL = "https://kumo-ui.com/api/version";
const requestedCommit = process.env.REQUESTED_PRODUCTION_COMMIT?.trim();
const manual = process.env.GITHUB_EVENT_NAME === "workflow_dispatch";

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

async function deployedCommit(): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(VERSION_URL, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = (await response.json()) as { commit?: unknown };
      if (typeof payload.commit !== "string") {
        throw new Error("version response has no commit");
      }
      return payload.commit;
    } catch (error) {
      lastError = error;
      if (attempt < 5) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2_000));
      }
    }
  }
  throw new Error(`Could not read ${VERSION_URL}: ${String(lastError)}`);
}

const candidate = requestedCommit || (await deployedCommit());
if (!/^[0-9a-f]{7,40}$/i.test(candidate)) {
  throw new Error(`Invalid production commit: ${JSON.stringify(candidate)}`);
}

const productionCommit = git([
  "rev-parse",
  "--verify",
  `${candidate}^{commit}`,
]);
if (
  spawnSync("git", [
    "merge-base",
    "--is-ancestor",
    productionCommit,
    "upstream/main",
  ]).status !== 0
) {
  throw new Error(
    `Production commit ${productionCommit} is not reachable from upstream/main`,
  );
}
const previousCommit = git(["merge-base", "HEAD", productionCommit]);
const baseCommit = git(["rev-parse", "HEAD"]);
const shortCommit = productionCommit.slice(0, 12);
const runId = process.env.GITHUB_RUN_ID ?? "manual";
const branch = manual
  ? `flue/astro-parity-${shortCommit}-${runId}-${process.env.GITHUB_RUN_ATTEMPT ?? "1"}`
  : `flue/astro-parity-${shortCommit}`;
const isAncestor =
  spawnSync("git", ["merge-base", "--is-ancestor", productionCommit, "HEAD"])
    .status === 0;
const shouldRun = manual || !isAncestor;

const output = process.env.GITHUB_OUTPUT;
if (output) {
  for (const [name, value] of Object.entries({
    production_commit: productionCommit,
    base_commit: baseCommit,
    previous_commit: previousCommit,
    short_commit: shortCommit,
    branch,
    should_run: String(shouldRun),
  })) {
    appendFileSync(output, `${name}=${value}\n`, "utf8");
  }
}

console.log(
  shouldRun
    ? `Production ${shortCommit} requires an Astro parity run.`
    : `Production ${shortCommit} is already synchronized or in progress.`,
);
