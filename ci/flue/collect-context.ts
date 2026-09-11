#!/usr/bin/env tsx
import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { Octokit } from "@octokit/rest";

type Command = "bonk" | "bigbonk" | "review";

interface GitHubEvent {
  sender?: { login?: string; type?: string };
  repository?: {
    default_branch?: string;
    full_name?: string;
  };
  issue?: {
    number?: number;
    pull_request?: unknown;
  };
  pull_request?: {
    number?: number;
  };
  comment?: {
    id?: number;
    body?: string;
    html_url?: string;
    path?: string;
    line?: number | null;
    side?: string | null;
    commit_id?: string;
    in_reply_to_id?: number;
  };
  review?: {
    id?: number;
    body?: string;
    html_url?: string;
  };
}

const token = process.env.GH_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const eventName = process.env.GITHUB_EVENT_NAME;
const eventPath = process.env.GITHUB_EVENT_PATH;
const outputPath = resolve(
  process.env.FLUE_CONTEXT_PATH ?? ".flue-runtime/context.json",
);

if (!token || !repository || !eventName || !eventPath) {
  throw new Error("Missing required GitHub Actions context");
}
const repositoryName = repository;

const [owner, repo] = repositoryName.split("/");
if (!owner || !repo) {
  throw new Error(`Invalid GITHUB_REPOSITORY: ${repositoryName}`);
}

const event = JSON.parse(readFileSync(eventPath, "utf8")) as GitHubEvent;
const octokit = new Octokit({ auth: token });

function setOutput(name: string, value: string | number | boolean): void {
  const output = process.env.GITHUB_OUTPUT;
  if (output) appendFileSync(output, `${name}=${String(value)}\n`);
}

function commandFromBody(body: string): Command | null {
  if (/(^|\s)\/bigbonk(?=\s|$)/.test(body)) return "bigbonk";
  if (/(^|\s)\/review(?=\s|$)/.test(body)) return "review";
  if (/(^|\s)\/bonk(?=\s|$)/.test(body)) return "bonk";
  return null;
}

function eventBody(): string {
  return eventName === "pull_request_review"
    ? (event.review?.body ?? "")
    : (event.comment?.body ?? "");
}

function eventId(): number {
  return eventName === "pull_request_review"
    ? (event.review?.id ?? 0)
    : (event.comment?.id ?? 0);
}

async function readFileAtRef(
  fullName: string,
  path: string,
  ref: string,
): Promise<string | null> {
  const [fileOwner, fileRepo] = fullName.split("/");
  if (!fileOwner || !fileRepo) return null;

  try {
    const response = await octokit.repos.getContent({
      owner: fileOwner,
      repo: fileRepo,
      path,
      ref,
    });
    if (Array.isArray(response.data) || response.data.type !== "file")
      return null;
    if (!("content" in response.data) || !response.data.content) return null;
    return Buffer.from(response.data.content, "base64").toString("utf8");
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  setOutput("should_run", false);

  const body = eventBody();
  const command = commandFromBody(body);
  const actor = event.sender?.login;
  if (!command || !actor || event.sender?.type === "Bot") return;
  if (command === "review" && eventName !== "pull_request_review_comment") {
    return;
  }

  const permission = await octokit.repos.getCollaboratorPermissionLevel({
    owner,
    repo,
    username: actor,
  });
  if (
    !new Set(["admin", "maintain", "write"]).has(permission.data.permission)
  ) {
    return;
  }

  const isPullRequest =
    Boolean(event.issue?.pull_request) ||
    eventName === "pull_request_review" ||
    eventName === "pull_request_review_comment";
  const targetNumber = isPullRequest
    ? (event.pull_request?.number ?? event.issue?.number)
    : event.issue?.number;
  if (!targetNumber) throw new Error("Could not resolve issue or PR number");

  const issue = await octokit.issues.get({
    owner,
    repo,
    issue_number: targetNumber,
  });
  const issueComments = await octokit.paginate(octokit.issues.listComments, {
    owner,
    repo,
    issue_number: targetNumber,
    per_page: 100,
  });

  const defaultBranch = event.repository?.default_branch ?? "main";
  const defaultRef = await octokit.repos.getBranch({
    owner,
    repo,
    branch: defaultBranch,
  });

  let target = {
    type: "issue" as "issue" | "pull_request",
    number: targetNumber,
    title: issue.data.title,
    body: issue.data.body ?? "",
    baseRef: defaultBranch,
    baseSha: defaultRef.data.commit.sha,
    headRef: defaultBranch,
    headSha: defaultRef.data.commit.sha,
    headRepository: repositoryName,
    isFork: false,
  };
  let changedFiles: Array<{
    path: string;
    status: string;
    patch: string | null;
    content: string | null;
    contentTruncated: boolean;
  }> = [];

  if (isPullRequest) {
    const pull = await octokit.pulls.get({
      owner,
      repo,
      pull_number: targetNumber,
    });
    target = {
      type: "pull_request",
      number: targetNumber,
      title: pull.data.title,
      body: pull.data.body ?? "",
      baseRef: pull.data.base.ref,
      baseSha: pull.data.base.sha,
      headRef: pull.data.head.ref,
      headSha: pull.data.head.sha,
      headRepository: pull.data.head.repo?.full_name ?? repositoryName,
      isFork: pull.data.head.repo?.full_name !== pull.data.base.repo.full_name,
    };

    const files = await octokit.paginate(octokit.pulls.listFiles, {
      owner,
      repo,
      pull_number: targetNumber,
      per_page: 100,
    });
    let remainingContentBytes = 750_000;
    changedFiles = await Promise.all(
      files.map(async (file) => {
        const source =
          file.status === "removed" || remainingContentBytes <= 0
            ? null
            : await readFileAtRef(
                target.headRepository,
                file.filename,
                target.headSha,
              );
        const content =
          source?.slice(0, Math.min(100_000, remainingContentBytes)) ?? null;
        remainingContentBytes -= content?.length ?? 0;
        return {
          path: file.filename,
          status: file.status,
          patch: file.patch ?? null,
          content,
          contentTruncated:
            source !== null && content?.length !== source.length,
        };
      }),
    );
  }

  const context = {
    schemaVersion: 1,
    command,
    readOnly: command === "review" || target.isFork,
    repository: repositoryName,
    actor,
    permission: permission.data.permission,
    trigger: {
      eventName,
      id: eventId(),
      body,
      url: event.comment?.html_url ?? event.review?.html_url ?? null,
      inline:
        eventName === "pull_request_review_comment"
          ? {
              path: event.comment?.path ?? null,
              line: event.comment?.line ?? null,
              side: event.comment?.side ?? null,
              commitId: event.comment?.commit_id ?? null,
              inReplyToId: event.comment?.in_reply_to_id ?? null,
            }
          : null,
    },
    target,
    comments: issueComments.slice(-100).map((comment) => ({
      author: comment.user?.login ?? "unknown",
      body: comment.body ?? "",
      createdAt: comment.created_at,
      url: comment.html_url,
    })),
    changedFiles,
  };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(context, null, 2)}\n`, "utf8");

  setOutput("should_run", true);
  setOutput("command", command);
  setOutput("target_type", target.type);
  setOutput("target_number", target.number);
  setOutput("target_repository", target.headRepository);
  setOutput("target_sha", target.headSha);
  setOutput("publish_sha", target.isFork ? target.baseSha : target.headSha);
  setOutput("head_ref", target.headRef);
  setOutput("is_fork", target.isFork);
  setOutput("event_id", eventId());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
