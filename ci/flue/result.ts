import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineTool } from "@flue/runtime";
import * as v from "valibot";

export const InlineCommentSchema = v.object({
  path: v.string(),
  line: v.number(),
  side: v.picklist(["LEFT", "RIGHT"]),
  body: v.string(),
});

export const TestResultSchema = v.object({
  command: v.string(),
  outcome: v.string(),
});

export const FlueResultSchema = v.object({
  schemaVersion: v.literal(1),
  outcome: v.picklist(["completed", "blocked"]),
  action: v.picklist(["comment", "review", "change"]),
  summaryMarkdown: v.string(),
  inlineComments: v.array(InlineCommentSchema),
  tests: v.array(TestResultSchema),
});

export type FlueResult = v.InferOutput<typeof FlueResultSchema>;

function resultPath(): string {
  return resolve(process.env.FLUE_RESULT_PATH ?? ".flue-runtime/result.json");
}

export const submitResult = defineTool({
  name: "submit_result",
  description:
    "Submit the final structured result after all requested work and verification is complete. This must be called exactly once.",
  input: FlueResultSchema,
  async run({ data }) {
    const path = resultPath();
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    return {
      output: "Result recorded. End the response without doing more work.",
      terminate: true,
    };
  },
});
