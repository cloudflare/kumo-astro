#!/usr/bin/env tsx
import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import * as v from "valibot";
import { FlueResultSchema, type FlueResult } from "./result";

interface Context {
  readOnly: boolean;
  target?: { headSha: string };
}

const workspace = resolve(process.env.FLUE_WORKSPACE ?? process.cwd());
const contextPath = resolve(
  process.env.FLUE_CONTEXT_PATH ?? `${workspace}/.flue-runtime/context.json`,
);
const resultPath = resolve(
  process.env.FLUE_RESULT_PATH ?? `${workspace}/.flue-runtime/result.json`,
);
const inputResultPath = resolve(
  process.env.FLUE_INPUT_RESULT_PATH ?? resultPath,
);
const patchPath = resolve(
  process.env.FLUE_PATCH_PATH ?? `${workspace}/.flue-runtime/agent.patch`,
);
const context = JSON.parse(readFileSync(contextPath, "utf8")) as Context;
const baseSha = process.env.FLUE_BASE_SHA ?? context.target?.headSha;
if (!context.readOnly && !baseSha) {
  throw new Error("A patch base SHA is required for writable runs");
}

mkdirSync(dirname(resultPath), { recursive: true });

let result: FlueResult;
if (!existsSync(inputResultPath)) {
  result = {
    schemaVersion: 1,
    outcome: "blocked",
    action: "comment",
    summaryMarkdown: "Flue did not submit a structured result.",
    inlineComments: [],
    tests: [],
  };
} else {
  const parsed = (() => {
    try {
      const metadata = lstatSync(inputResultPath);
      if (!metadata.isFile() || metadata.size > 1_000_000) return null;
      return v.safeParse(
        FlueResultSchema,
        JSON.parse(readFileSync(inputResultPath, "utf8")),
      );
    } catch {
      return null;
    }
  })();
  result = parsed?.success
    ? parsed.output
    : {
        schemaVersion: 1,
        outcome: "blocked",
        action: "comment",
        summaryMarkdown: "Flue submitted an invalid structured result.",
        inlineComments: [],
        tests: [],
      };
}

let patch = "";
if (!context.readOnly) {
  const untracked = execFileSync(
    "git",
    ["ls-files", "--others", "--exclude-standard", "-z"],
    { cwd: workspace },
  )
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
  if (untracked.length > 0) {
    execFileSync("git", ["add", "--intent-to-add", "--", ...untracked], {
      cwd: workspace,
    });
  }
  patch = execFileSync(
    "git",
    [
      "diff",
      "--binary",
      "--no-ext-diff",
      baseSha!,
      "--",
      ".",
      ":(exclude).flue-runtime",
    ],
    { cwd: workspace, encoding: "utf8", maxBuffer: 3_000_000 },
  );
}

if (Buffer.byteLength(patch) > 2_000_000) {
  result = {
    schemaVersion: 1,
    outcome: "blocked",
    action: "comment",
    summaryMarkdown: "The proposed patch exceeded the 2 MB publication limit.",
    inlineComments: [],
    tests: result.tests,
  };
  patch = "";
}

if (context.readOnly && result.action === "change") {
  result = {
    ...result,
    outcome: "blocked",
    action: "comment",
    summaryMarkdown: `${result.summaryMarkdown}\n\nChanges cannot be published for a read-only fork or review run.`,
  };
}

if (patch && result.action !== "change") {
  result = {
    ...result,
    outcome: "blocked",
    action: "comment",
    summaryMarkdown: `${result.summaryMarkdown}\n\nThe agent changed files without declaring a change result.`,
  };
}

if (result.action === "change" && !patch) {
  result = { ...result, action: "comment" };
}

writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
writeFileSync(patchPath, patch, "utf8");
