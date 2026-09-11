#!/usr/bin/env tsx
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const baseCommit = process.env.BASE_COMMIT;
const productionCommit = process.env.PRODUCTION_COMMIT;
const mergeCommit = process.env.MERGE_COMMIT;
const bundlePath = resolve(
  process.env.PRODUCTION_BUNDLE_PATH ?? ".flue-runtime/production-merge.bundle",
);
for (const [name, value] of Object.entries({
  BASE_COMMIT: baseCommit,
  PRODUCTION_COMMIT: productionCommit,
  MERGE_COMMIT: mergeCommit,
})) {
  if (!value || !/^[0-9a-f]{40}$/i.test(value)) {
    throw new Error(`${name} must be a full commit SHA`);
  }
}

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

git(["bundle", "verify", bundlePath]);
git(["fetch", bundlePath, "HEAD"]);
const fetchedCommit = git(["rev-parse", "FETCH_HEAD"]);
if (fetchedCommit !== mergeCommit) {
  throw new Error(
    `Bundle commit mismatch: expected ${mergeCommit}, received ${fetchedCommit}`,
  );
}
const parents = git(["show", "-s", "--format=%P", mergeCommit]).split(" ");
if (parents[0] !== baseCommit || parents[1] !== productionCommit) {
  throw new Error(
    `Merge parents must be the fork base and exact production commit`,
  );
}
git(["checkout", "--detach", mergeCommit]);
console.log(`Restored trusted production merge ${mergeCommit.slice(0, 12)}.`);
