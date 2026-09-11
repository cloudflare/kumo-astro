#!/usr/bin/env tsx
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Octokit } from "@octokit/rest";
import * as v from "valibot";
import { FlueResultSchema, type FlueResult } from "./result";

interface Context {
  command: "bonk" | "bigbonk" | "review" | "astro-parity";
  readOnly: boolean;
  repository: string;
  trigger: {
    id: number;
    eventName: string;
    inline: { inReplyToId: number | null } | null;
  };
  target: {
    type: "issue" | "pull_request";
    number: number;
    title: string;
    baseRef: string;
    baseSha: string;
    headRef: string;
    headSha: string;
    headRepository: string;
    isFork: boolean;
  };
  changedFiles: Array<{ path: string; patch: string | null }>;
}

const workspace = resolve(process.env.FLUE_PUBLISH_WORKSPACE ?? process.cwd());
const contextPath = resolve(
  process.env.FLUE_CONTEXT_PATH ?? ".flue-runtime/context.json",
);
const resultPath = resolve(
  process.env.FLUE_RESULT_PATH ?? ".flue-runtime/result.json",
);
const patchPath = resolve(
  process.env.FLUE_PATCH_PATH ?? ".flue-runtime/agent.patch",
);
const token = process.env.GH_TOKEN;
if (!token)
  throw new Error("GH_TOKEN is required for deterministic publishing");

const context = JSON.parse(readFileSync(contextPath, "utf8")) as Context;
const parsedResult = (() => {
  try {
    return v.safeParse(
      FlueResultSchema,
      JSON.parse(readFileSync(resultPath, "utf8")),
    );
  } catch {
    return null;
  }
})();
const result: FlueResult =
  parsedResult?.success === true
    ? parsedResult.output
    : {
        schemaVersion: 1,
        outcome: "blocked",
        action: "comment",
        summaryMarkdown: "Flue submitted malformed structured output.",
        inlineComments: [],
        tests: [],
      };
const [owner, repo] = context.repository.split("/");
if (!owner || !repo)
  throw new Error(`Invalid repository: ${context.repository}`);
const octokit = new Octokit({ auth: token });
const marker = `<!-- flue-result:${context.trigger.id} -->`;

function git(args: string[]): string {
  return execFileSync("git", args, {
    cwd: workspace,
    encoding: "utf8",
    maxBuffer: 3_000_000,
  }).trim();
}

function push(refspec: string): void {
  const authenticatedRemote = `https://x-access-token:${encodeURIComponent(token!)}@github.com/${context.repository}.git`;
  git(["remote", "set-url", "origin", authenticatedRemote]);
  try {
    git(["push", "origin", refspec]);
  } finally {
    git([
      "remote",
      "set-url",
      "origin",
      `https://github.com/${context.repository}.git`,
    ]);
  }
}

function validatePatch(patch: string): void {
  if (Buffer.byteLength(patch) > 2_000_000) {
    throw new Error("Patch exceeds the 2 MB publication limit");
  }
  if (
    /^(new file mode|deleted file mode|old mode|new mode) (120000|160000)$/m.test(
      patch,
    )
  ) {
    throw new Error("Symlink and submodule changes are not permitted");
  }
  if (/^(rename|copy) (from|to) /m.test(patch)) {
    throw new Error("Rename and copy patches are not permitted");
  }

  const diffCount = Array.from(patch.matchAll(/^diff --git /gm)).length;
  const pathPairs = Array.from(
    patch.matchAll(/^diff --git a\/(.+) b\/(.+)$/gm),
    (match) => [match[1], match[2]],
  );
  if (pathPairs.length !== diffCount) {
    throw new Error("Patch contains an unsupported or quoted path");
  }
  const paths = pathPairs.flat();
  if (patch && paths.length === 0)
    throw new Error("Patch has no valid file paths");

  const protectedPrefixes = [".git/", ".github/", "ci/flue/", ".flue-runtime/"];
  const protectedPaths = new Set([
    ".dockerignore",
    ".gitattributes",
    ".gitmodules",
    ".npmrc",
    "lefthook.yml",
    "package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
  ]);
  for (const path of paths) {
    if (
      path.startsWith("/") ||
      path.split("/").includes("..") ||
      path === "package.json" ||
      path.endsWith("/package.json") ||
      path === ".npmrc" ||
      path.endsWith("/.npmrc") ||
      protectedPaths.has(path) ||
      protectedPrefixes.some((prefix) => path.startsWith(prefix))
    ) {
      throw new Error(`Agent patch contains protected path: ${path}`);
    }
  }
}

function changedLineSet(
  patch: string | null,
  side: "LEFT" | "RIGHT",
): Set<number> {
  const lines = new Set<number>();
  if (!patch) return lines;
  let oldLine = 0;
  let newLine = 0;
  for (const line of patch.split("\n")) {
    const hunk = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      oldLine = Number(hunk[1]);
      newLine = Number(hunk[2]);
      continue;
    }
    if (line.startsWith("-") && !line.startsWith("---")) {
      if (side === "LEFT") lines.add(oldLine);
      oldLine += 1;
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      if (side === "RIGHT") lines.add(newLine);
      newLine += 1;
    } else if (!line.startsWith("\\")) {
      oldLine += 1;
      newLine += 1;
    }
  }
  return lines;
}

async function upsertComment(body: string): Promise<void> {
  const comments = await octokit.paginate(octokit.issues.listComments, {
    owner,
    repo,
    issue_number: context.target.number,
    per_page: 100,
  });
  const existing = comments.find((comment) => comment.body?.startsWith(marker));
  const markedBody = `${marker}\n${body}`;
  if (existing) {
    await octokit.issues.updateComment({
      owner,
      repo,
      comment_id: existing.id,
      body: markedBody,
    });
  } else {
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: context.target.number,
      body: markedBody,
    });
  }
}

async function publishReview(reviewResult: FlueResult): Promise<void> {
  const byPath = new Map(
    context.changedFiles.map((file) => [file.path, file.patch]),
  );
  const comments = reviewResult.inlineComments.slice(0, 50).map((comment) => {
    if (!byPath.has(comment.path)) {
      throw new Error(`Inline review path is not in the PR: ${comment.path}`);
    }
    if (
      !changedLineSet(byPath.get(comment.path) ?? null, comment.side).has(
        comment.line,
      )
    ) {
      throw new Error(
        `Inline review line is not changed: ${comment.path}:${comment.line}`,
      );
    }
    return {
      path: comment.path,
      line: comment.line,
      side: comment.side,
      body: comment.body.slice(0, 10_000),
    };
  });

  if (comments.length > 0) {
    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: context.target.number,
      commit_id: context.target.headSha,
      event: "COMMENT",
      body: "",
      comments,
    });
  } else {
    await upsertComment(reviewResult.summaryMarkdown || "LGTM!");
  }
}

async function createCheck(
  conclusion: "success" | "failure",
  headSha: string,
  summary: string,
): Promise<void> {
  if (
    context.target.type !== "pull_request" ||
    !["bonk", "bigbonk"].includes(context.command)
  ) {
    return;
  }
  await octokit.checks.create({
    owner,
    repo,
    name: "Flue Review",
    head_sha: headSha,
    status: "completed",
    conclusion,
    output: {
      title: conclusion === "success" ? "Flue completed" : "Flue failed",
      summary: summary.slice(0, 65_000),
    },
  });
}

async function publish(): Promise<void> {
  let publishedSha = context.target.headSha;
  const patch = existsSync(patchPath) ? readFileSync(patchPath, "utf8") : "";
  validatePatch(patch);

  if (result.outcome === "completed" && result.action === "change" && patch) {
    if (context.readOnly)
      throw new Error("Read-only runs cannot publish changes");
    const checkoutSha = git(["rev-parse", "HEAD"]);
    if (checkoutSha !== context.target.headSha) {
      throw new Error(
        "Publisher checkout does not match the captured head SHA",
      );
    }
    git(["apply", "--check", "--whitespace=nowarn", patchPath]);
    git(["apply", "--index", "--whitespace=nowarn", patchPath]);
    const stagedModes = git(["diff", "--cached", "--raw"]);
    if (/^:(120000|160000) | (120000|160000) /m.test(stagedModes)) {
      throw new Error("Symlink and submodule changes are not permitted");
    }
    git(["config", "user.name", "flue[bot]"]);
    git(["config", "user.email", "flue[bot]@users.noreply.github.com"]);
    git(["commit", "-m", `fix: apply ${context.command} result`]);
    publishedSha = git(["rev-parse", "HEAD"]);

    if (context.target.type === "pull_request") {
      push(`HEAD:refs/heads/${context.target.headRef}`);
    } else {
      const branch = `flue/issue-${context.target.number}-${context.trigger.id}`;
      push(`HEAD:refs/heads/${branch}`);
      const pull = await octokit.pulls.create({
        owner,
        repo,
        head: branch,
        base: context.target.baseRef,
        title: `Flue: ${context.target.title}`,
        body: `${result.summaryMarkdown}\n\n- Reviews\n- [x] automated review not possible because: generated by an authorized Flue workflow\n- Tests\n- [x] Tests included/updated`,
        draft: true,
      });
      result.summaryMarkdown = `${result.summaryMarkdown}\n\nDraft PR: ${pull.data.html_url}`;
    }
  }

  if (context.command === "review") {
    await publishReview(result);
  } else if (
    context.trigger.eventName === "pull_request_review_comment" &&
    context.trigger.inline
  ) {
    await octokit.request(
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies",
      {
        owner,
        repo,
        pull_number: context.target.number,
        comment_id: context.trigger.inline.inReplyToId ?? context.trigger.id,
        body: result.summaryMarkdown,
      },
    );
  } else {
    await upsertComment(result.summaryMarkdown);
  }

  const success = result.outcome === "completed";
  await createCheck(
    success ? "success" : "failure",
    publishedSha,
    result.summaryMarkdown,
  );
  if (!success) process.exitCode = 1;
}

publish().catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  try {
    await createCheck("failure", context.target.headSha, message);
    await upsertComment(`Flue publication failed: ${message}`);
  } catch (reportError) {
    console.error("Failed to publish the failure status", reportError);
  }
  process.exit(1);
});
