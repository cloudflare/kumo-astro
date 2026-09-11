import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { applyParityPatch, validateParityPatch } from "./parity-patch";

test("accepts Astro documentation paths", () => {
  const patch =
    "diff --git a/packages/kumo-docs-astro/src/example.astro b/packages/kumo-docs-astro/src/example.astro\n";

  assert.deepEqual(validateParityPatch(patch), [
    "packages/kumo-docs-astro/src/example.astro",
  ]);
});

test("rejects a patch when any diff header has a quoted path", () => {
  const patch = [
    "diff --git a/packages/kumo-docs-astro/src/example.astro b/packages/kumo-docs-astro/src/example.astro",
    'diff --git "a/.github/forbidden file" "b/.github/forbidden file"',
  ].join("\n");

  assert.throws(() => validateParityPatch(patch), /unsupported or quoted path/);
});

test("rejects deleted symlinks and submodules", () => {
  const patch = [
    "diff --git a/packages/kumo-docs-astro/link b/packages/kumo-docs-astro/link",
    "deleted file mode 120000",
  ].join("\n");

  assert.throws(
    () => validateParityPatch(patch),
    /Symlink and submodule changes/,
  );
});

test("rejects an existing symlink target change", (context) => {
  const workspace = mkdtempSync(join(tmpdir(), "flue-parity-patch-"));
  context.after(() => rmSync(workspace, { recursive: true, force: true }));

  const git = (args: string[]) =>
    execFileSync("git", args, { cwd: workspace, encoding: "utf8" });
  const directory = join(workspace, "packages/kumo-docs-astro");
  const link = join(directory, "link");
  const patchPath = join(workspace, "agent.patch");

  git(["init", "--quiet"]);
  git(["config", "user.name", "Flue Test"]);
  git(["config", "user.email", "flue-test@example.com"]);
  mkdirSync(directory, { recursive: true });
  symlinkSync("target-a", link);
  git(["add", "."]);
  git(["commit", "--quiet", "-m", "fixture"]);

  unlinkSync(link);
  symlinkSync("target-b", link);
  const patch = git(["diff", "--binary", "--", "."]);
  git(["checkout", "--", "."]);
  writeFileSync(patchPath, patch, "utf8");

  assert.throws(
    () => applyParityPatch(workspace, patchPath),
    /Symlink and submodule changes/,
  );
});
