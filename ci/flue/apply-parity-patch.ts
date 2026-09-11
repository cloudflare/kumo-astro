#!/usr/bin/env tsx
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { applyParityPatch, readFlueResult } from "./parity-patch";

const workspace = resolve(process.env.FLUE_WORKSPACE ?? process.cwd());
const patchPath = resolve(
  process.env.FLUE_PATCH_PATH ?? ".flue-runtime/agent.patch",
);
const resultPath = resolve(
  process.env.FLUE_RESULT_PATH ?? ".flue-runtime/result.json",
);
const result = readFlueResult(resultPath);
if (result.outcome !== "completed") throw new Error(result.summaryMarkdown);
if (!existsSync(patchPath))
  throw new Error("The agent patch artifact is missing");
const paths = applyParityPatch(workspace, patchPath);
if (paths.length > 0 && result.action !== "change") {
  throw new Error("The agent changed files without declaring a change result");
}
console.log(`Validated ${paths.length} parity patch path(s).`);
