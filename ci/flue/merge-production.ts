#!/usr/bin/env tsx
import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { parse, stringify } from "yaml";

const productionCommit = process.env.PRODUCTION_COMMIT;
if (!productionCommit || !/^[0-9a-f]{40}$/i.test(productionCommit)) {
  throw new Error("PRODUCTION_COMMIT must be a full commit SHA");
}
const forkHead = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
const mergeBase = execFileSync(
  "git",
  ["merge-base", forkHead, productionCommit],
  { encoding: "utf8" },
).trim();
const forkChanged = new Set(
  execFileSync("git", ["diff", "--name-only", "-z", mergeBase, forkHead])
    .toString("utf8")
    .split("\0")
    .filter(Boolean),
);
const overlappingPaths = execFileSync("git", [
  "diff",
  "--name-only",
  "-z",
  mergeBase,
  productionCommit,
])
  .toString("utf8")
  .split("\0")
  .filter((path) => path && forkChanged.has(path));
const forkPackage = JSON.parse(
  execFileSync("git", ["show", "HEAD:package.json"], { encoding: "utf8" }),
) as { scripts?: Record<string, string> };
const forkWorkspace = parse(
  execFileSync("git", ["show", "HEAD:pnpm-workspace.yaml"], {
    encoding: "utf8",
  }),
) as Record<string, unknown> & { catalog?: Record<string, string> };

function git(args: string[], env?: NodeJS.ProcessEnv): string {
  return execFileSync("git", args, {
    encoding: "utf8",
    env: { ...process.env, ...env },
  }).trim();
}

git(["rev-parse", "--verify", `${productionCommit}^{commit}`]);
const alreadyMerged =
  spawnSync("git", ["merge-base", "--is-ancestor", productionCommit, "HEAD"])
    .status === 0;
const commitDate = git(["show", "-s", "--format=%cI", productionCommit]);
git(["config", "user.name", "flue[bot]"]);
git(["config", "user.email", "flue[bot]@users.noreply.github.com"]);
const commitEnv = {
  GIT_AUTHOR_DATE: commitDate,
  GIT_COMMITTER_DATE: commitDate,
};
if (alreadyMerged) {
  const tree = git(["rev-parse", "HEAD^{tree}"]);
  const mergeCommit = git(
    [
      "commit-tree",
      tree,
      "-p",
      forkHead,
      "-p",
      productionCommit,
      "-m",
      `chore: record upstream production ${productionCommit.slice(0, 12)}`,
    ],
    commitEnv,
  );
  git(["checkout", "--detach", mergeCommit]);
} else {
  const merge = spawnSync(
    "git",
    ["merge", "--no-ff", "--no-commit", "-X", "theirs", productionCommit],
    { encoding: "utf8" },
  );
  const unmerged = git(["diff", "--name-only", "--diff-filter=U", "-z"])
    .split("\0")
    .filter(Boolean);
  if (merge.status !== 0 && unmerged.length === 0) {
    throw new Error(merge.stderr || merge.stdout || "Production merge failed");
  }
  for (const path of unmerged) {
    const preferFork =
      path.startsWith(".github/") ||
      path.startsWith(".opencode/") ||
      path === "AGENTS.md" ||
      path === "lefthook.yml";
    const stage = preferFork ? 2 : 3;
    const hasPreferredVersion =
      spawnSync("git", ["show", `:${stage}:${path}`], { stdio: "ignore" })
        .status === 0;
    if (hasPreferredVersion) {
      git(["checkout", preferFork ? "--ours" : "--theirs", "--", path]);
      git(["add", "--", path]);
    } else {
      git(["rm", "--ignore-unmatch", "--", path]);
    }
  }
  for (const path of overlappingPaths) {
    const preferFork =
      path.startsWith(".github/") ||
      path.startsWith(".opencode/") ||
      path === "AGENTS.md" ||
      path === "lefthook.yml";
    const preferredCommit = preferFork ? forkHead : productionCommit;
    const hasPreferredVersion =
      spawnSync("git", ["cat-file", "-e", `${preferredCommit}:${path}`], {
        stdio: "ignore",
      }).status === 0;
    if (hasPreferredVersion) {
      git(["checkout", preferredCommit, "--", path]);
    } else {
      git(["rm", "--ignore-unmatch", "--", path]);
    }
  }
  if (git(["diff", "--name-only", "--diff-filter=U"])) {
    throw new Error("Production merge still contains unresolved paths");
  }
  const mergedPackage = JSON.parse(readFileSync("package.json", "utf8")) as {
    scripts?: Record<string, string>;
  };
  const protectedScripts = [
    "publish:beta",
    "release",
    "release:beta",
    "release:production",
  ];
  mergedPackage.scripts ??= {};
  for (const name of protectedScripts) {
    if (forkPackage.scripts?.[name]) {
      mergedPackage.scripts[name] = forkPackage.scripts[name];
    }
  }
  writeFileSync("package.json", `${JSON.stringify(mergedPackage, null, 2)}\n`);
  git(["add", "package.json"]);
  const mergedWorkspace = parse(
    readFileSync("pnpm-workspace.yaml", "utf8"),
  ) as Record<string, unknown> & { catalog?: Record<string, string> };
  mergedWorkspace.catalog = {
    ...forkWorkspace.catalog,
    ...mergedWorkspace.catalog,
  };
  writeFileSync("pnpm-workspace.yaml", stringify(mergedWorkspace));
  git(["add", "pnpm-workspace.yaml"]);
  execFileSync("pnpm", ["install", "--lockfile-only", "--ignore-scripts"], {
    stdio: "inherit",
  });
  git(["add", "pnpm-lock.yaml"]);
  git(
    [
      "-c",
      "commit.gpgSign=false",
      "commit",
      "-m",
      `chore: merge upstream production ${productionCommit.slice(0, 12)}`,
    ],
    commitEnv,
  );
}

const mergeSha = git(["rev-parse", "HEAD"]);
const expected = process.env.EXPECTED_MERGE_SHA;
if (expected && mergeSha !== expected) {
  throw new Error(
    `Merge SHA mismatch: expected ${expected}, received ${mergeSha}`,
  );
}
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `merge_sha=${mergeSha}\n`, "utf8");
}
console.log(
  alreadyMerged
    ? `Production ${productionCommit.slice(0, 12)} was already merged.`
    : `Created deterministic production merge ${mergeSha.slice(0, 12)}.`,
);
