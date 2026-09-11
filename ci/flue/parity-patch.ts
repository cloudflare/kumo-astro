import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as v from "valibot";
import { FlueResultSchema, type FlueResult } from "./result";

export function readFlueResult(path: string): FlueResult {
  try {
    const parsed = v.safeParse(
      FlueResultSchema,
      JSON.parse(readFileSync(path, "utf8")),
    );
    if (parsed.success) return parsed.output;
  } catch {
    // Converted to a deterministic blocked result below.
  }
  return {
    schemaVersion: 1,
    outcome: "blocked",
    action: "comment",
    summaryMarkdown: "Flue did not submit valid structured output.",
    inlineComments: [],
    tests: [],
  };
}

export function validateParityPatch(patch: string): string[] {
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
  const paths = Array.from(new Set(pathPairs.flat()));
  if (patch && paths.length === 0) throw new Error("Patch has no valid paths");
  for (const path of paths) {
    const allowed =
      path.startsWith("packages/kumo-astro/") ||
      path.startsWith("packages/kumo-docs-astro/") ||
      path.startsWith(".changeset/");
    if (
      !allowed ||
      path.startsWith("/") ||
      path.split("/").includes("..") ||
      path.endsWith("/package.json")
    ) {
      throw new Error(`Parity patch contains a forbidden path: ${path}`);
    }
  }
  if (
    paths.some((path) => path.startsWith("packages/kumo-astro/")) &&
    !paths.some((path) => path.startsWith(".changeset/"))
  ) {
    throw new Error("Published Astro package changes are missing a changeset");
  }
  return paths;
}

export function applyParityPatch(
  workspace: string,
  patchPath: string,
): string[] {
  const resolvedPatch = resolve(patchPath);
  const patch = readFileSync(resolvedPatch, "utf8");
  const paths = validateParityPatch(patch);
  if (patch) {
    execFileSync("git", ["apply", "--check", resolvedPatch], {
      cwd: workspace,
    });
    execFileSync("git", ["apply", "--index", resolvedPatch], {
      cwd: workspace,
    });
    const stagedModes = execFileSync(
      "git",
      ["diff", "--cached", "--raw", "--", ...paths],
      { cwd: workspace, encoding: "utf8" },
    );
    if (/^:(120000|160000) | (120000|160000) /m.test(stagedModes)) {
      throw new Error("Symlink and submodule changes are not permitted");
    }
  }
  return paths;
}
