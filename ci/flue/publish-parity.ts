#!/usr/bin/env tsx
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Octokit } from "@octokit/rest";
import { applyParityPatch, readFlueResult } from "./parity-patch";

interface ParityContext {
  productionCommit: string;
  previousUpstreamCommit: string;
  components: string[];
  fullRegression: boolean;
  findingsPath: string;
}

interface VisualReport {
  summary?: { blockingFindings?: number; captureErrors?: number };
  findings?: Array<{ blocking?: boolean; name?: string; message?: string }>;
}

const workspace = resolve(process.env.FLUE_WORKSPACE ?? process.cwd());
const contextPath = resolve(
  process.env.FLUE_CONTEXT_PATH ?? ".flue-runtime/context.json",
);
const resultPath = resolve(
  process.env.FLUE_RESULT_PATH ?? ".flue-runtime/result.json",
);
const patchPath = process.env.FLUE_PATCH_PATH
  ? resolve(process.env.FLUE_PATCH_PATH)
  : null;
const token = process.env.GH_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const branch = process.env.FLUE_BRANCH;
const baseBranch = process.env.FLUE_BASE_BRANCH ?? "main";
const agentBaseSha = process.env.FLUE_AGENT_BASE_SHA;
const forkBaseSha = process.env.FLUE_FORK_BASE_SHA;
const mergeOutcome = process.env.FLUE_MERGE_OUTCOME;
const agentOutcome = process.env.FLUE_AGENT_OUTCOME;
const verificationOutcome = process.env.FLUE_VERIFICATION_OUTCOME;

if (!token || !repository || !branch) {
  throw new Error("GH_TOKEN, GITHUB_REPOSITORY, and FLUE_BRANCH are required");
}
const githubToken = token;
const parityBranch = branch;

const [owner, repo] = repository.split("/");
if (!owner || !repo) throw new Error(`Invalid repository: ${repository}`);
const context = JSON.parse(readFileSync(contextPath, "utf8")) as ParityContext;
const result = readFlueResult(resultPath);
const reportPath = resolve(
  process.env.VISUAL_REGRESSION_JSON_REPORT ?? context.findingsPath,
);
const report = (() => {
  if (!existsSync(reportPath)) return null;
  try {
    return JSON.parse(readFileSync(reportPath, "utf8")) as VisualReport;
  } catch {
    return null;
  }
})();
const octokit = new Octokit({ auth: token });
const shortCommit = context.productionCommit.slice(0, 12);
const runUrl = `${process.env.GITHUB_SERVER_URL}/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`;

function git(args: string[]): string {
  return execFileSync("git", args, {
    cwd: workspace,
    encoding: "utf8",
    maxBuffer: 3_000_000,
  }).trim();
}

function changedPaths(): string[] {
  if (!agentBaseSha) return [];
  const tracked = git(["diff", "--name-only", agentBaseSha, "--", "."])
    .split("\n")
    .filter(Boolean);
  const untracked = git(["ls-files", "--others", "--exclude-standard"])
    .split("\n")
    .filter(Boolean);
  return Array.from(new Set([...tracked, ...untracked]));
}

function isAllowedAgentPath(path: string): boolean {
  return (
    path.startsWith("packages/kumo-astro/") ||
    path.startsWith("packages/kumo-docs-astro/") ||
    path.startsWith(".changeset/")
  );
}

function issueBody(reasons: string[], forbiddenPaths: string[]): string {
  const blocking = (report?.findings ?? [])
    .filter((finding) => finding.blocking)
    .slice(0, 20)
    .map(
      (finding) =>
        `- ${finding.name ?? "Visual finding"}: ${finding.message ?? "No detail"}`,
    );
  return [
    `<!-- flue-astro-parity:${context.productionCommit} -->`,
    `Astro parity could not be repaired automatically for production commit \`${context.productionCommit}\`.`,
    "",
    "**Failure reasons**",
    ...reasons.map((reason) => `- ${reason}`),
    ...(forbiddenPaths.length > 0
      ? ["- Agent edited forbidden paths: " + forbiddenPaths.join(", ")]
      : []),
    "",
    `Blocking findings: ${report?.summary?.blockingFindings ?? "unavailable"}`,
    `Capture errors: ${report?.summary?.captureErrors ?? "unavailable"}`,
    ...(blocking.length > 0 ? ["", "**Evidence**", ...blocking] : []),
    "",
    `Workflow run: ${runUrl}`,
    "",
    result.summaryMarkdown.slice(0, 20_000),
  ].join("\n");
}

async function upsertFailureIssue(body: string): Promise<void> {
  const marker = `<!-- flue-astro-parity:${context.productionCommit} -->`;
  const issues = await octokit.paginate(octokit.issues.listForRepo, {
    owner,
    repo,
    state: "open",
    per_page: 100,
  });
  const existing = issues.find(
    (issue) => !issue.pull_request && issue.body?.includes(marker),
  );
  if (existing) {
    await octokit.issues.update({
      owner,
      repo,
      issue_number: existing.number,
      body,
    });
    return;
  }
  await octokit.issues.create({
    owner,
    repo,
    title: `Astro parity failed for ${shortCommit}`,
    body,
  });
}

async function publish(): Promise<void> {
  if (mergeOutcome === "success" && patchPath && existsSync(patchPath)) {
    applyParityPatch(workspace, patchPath);
  }
  const paths = mergeOutcome === "success" ? changedPaths() : [];
  const forbiddenPaths = paths.filter((path) => !isAllowedAgentPath(path));
  const reasons: string[] = [];
  if (mergeOutcome !== "success") reasons.push("The upstream merge failed.");
  if (agentOutcome !== "success") reasons.push("The Flue agent failed.");
  if (result.outcome !== "completed")
    reasons.push("The Flue result was blocked.");
  if (verificationOutcome !== "success") {
    reasons.push("Deterministic type or visual verification failed.");
  }
  if (forbiddenPaths.length > 0) {
    reasons.push("The proposed repair exceeded its allowed path boundary.");
  }
  if (paths.length > 0 && result.action !== "change") {
    reasons.push("The agent changed files without declaring a change result.");
  }
  if (agentBaseSha && git(["rev-parse", "HEAD"]) !== agentBaseSha) {
    reasons.push(
      "The agent created commits instead of leaving a reviewable patch.",
    );
  }
  if (
    paths.some((path) => path.startsWith("packages/kumo-astro/")) &&
    !paths.some((path) => path.startsWith(".changeset/"))
  ) {
    reasons.push("Published Astro package changes are missing a changeset.");
  }
  if (git(["ls-files", "--unmerged"])) {
    reasons.push("The worktree still contains merge conflicts.");
  }

  if (reasons.length > 0) {
    await upsertFailureIssue(issueBody(reasons, forbiddenPaths));
    process.exitCode = 1;
    return;
  }
  if (paths.length === 0 && agentBaseSha === forkBaseSha) {
    console.log("The requested production commit is already synchronized.");
    return;
  }

  git(["config", "user.name", "flue[bot]"]);
  git(["config", "user.email", "flue[bot]@users.noreply.github.com"]);
  if (paths.length > 0) git(["add", "--", ...paths]);
  if (git(["diff", "--cached", "--name-only"])) {
    git(["commit", "-m", `fix(astro): restore parity with ${shortCommit}`]);
  }

  const authenticatedRemote = `https://x-access-token:${encodeURIComponent(githubToken)}@github.com/${repository}.git`;
  const remoteBranch = `refs/heads/${parityBranch}`;
  git(["remote", "set-url", "origin", authenticatedRemote]);
  try {
    const remoteSha = git([
      "ls-remote",
      "--heads",
      "origin",
      remoteBranch,
    ]).split("\t")[0];
    git([
      "push",
      ...(remoteSha ? [`--force-with-lease=${remoteBranch}:${remoteSha}`] : []),
      "origin",
      `HEAD:${remoteBranch}`,
    ]);
  } finally {
    git([
      "remote",
      "set-url",
      "origin",
      `https://github.com/${repository}.git`,
    ]);
  }

  const tests = result.tests
    .map((test) => `- \`${test.command}\`: ${test.outcome}`)
    .join("\n");
  const body = [
    `Synchronizes upstream production commit \`${context.productionCommit}\` and repairs Astro visual parity.`,
    "",
    result.summaryMarkdown.slice(0, 20_000),
    "",
    `Scope: ${context.fullRegression ? "full visual regression" : context.components.join(", ") || "upstream sync only"}`,
    tests ? `\n**Agent checks**\n${tests}` : "",
    `\nWorkflow evidence: ${runUrl}`,
    "",
    "- Reviews",
    "- [x] automated review not possible because: generated by the scheduled Flue parity workflow",
    "- Tests",
    "- [x] Additional testing not necessary because: automated Astro type and visual parity checks passed",
  ].join("\n");
  const existing = await octokit.pulls.list({
    owner,
    repo,
    state: "open",
    head: `${owner}:${parityBranch}`,
    per_page: 1,
  });
  if (existing.data[0]) {
    await octokit.pulls.update({
      owner,
      repo,
      pull_number: existing.data[0].number,
      body,
    });
  } else {
    await octokit.pulls.create({
      owner,
      repo,
      head: parityBranch,
      base: baseBranch,
      title: `fix(astro): restore parity with ${shortCommit}`,
      body,
      draft: true,
    });
  }
}

publish().catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  try {
    await upsertFailureIssue(issueBody([`Publisher failed: ${message}`], []));
  } catch (issueError) {
    console.error(
      issueError instanceof Error ? issueError.message : issueError,
    );
  }
  process.exit(1);
});
