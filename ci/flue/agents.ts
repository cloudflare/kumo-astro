import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { useModel, useSandbox, useTool } from "@flue/runtime";
import { local } from "@flue/runtime/node";
import "./provider";
import { FLUE_MODEL } from "./provider";
import { submitResult } from "./result";

interface AgentContext {
  command?: "bonk" | "bigbonk" | "review" | "astro-parity";
  readOnly?: boolean;
}

function readContext(): { raw: string; parsed: AgentContext } {
  const path = resolve(
    process.env.FLUE_CONTEXT_PATH ?? ".flue-runtime/context.json",
  );
  const raw = readFileSync(path, "utf8");
  return { raw, parsed: JSON.parse(raw) as AgentContext };
}

function useKumoModel(level: "high" | "max"): void {
  useModel(FLUE_MODEL, {
    thinkingLevel: level,
    compaction: { keepRecentTokens: 16_000 },
  });
}

export function RepositoryAgent() {
  const context = readContext();
  useKumoModel(context.parsed.command === "bigbonk" ? "max" : "high");
  useTool(submitResult);

  if (!context.parsed.readOnly) {
    useSandbox(
      local({
        cwd: process.env.FLUE_WORKSPACE ?? process.cwd(),
        env: {
          GH_TOKEN: undefined,
          GITHUB_TOKEN: undefined,
          ACTIONS_ID_TOKEN_REQUEST_TOKEN: undefined,
          ACTIONS_RUNTIME_TOKEN: undefined,
          ACTIONS_RUNTIME_URL: undefined,
          ACTIONS_RESULTS_URL: undefined,
          CLOUDFLARE_API_TOKEN: undefined,
          CLOUDFLARE_ACCOUNT_ID: undefined,
          CLOUDFLARE_GATEWAY_ID: undefined,
        },
      }),
    );
  }

  return context.parsed.readOnly
    ? `Review the following fork pull request context without using tools, running code, or proposing repository mutations. Provide actionable analysis, then call submit_result with action "comment" and no inline comments.\n\n${context.raw}`
    : `Read the event context at ${process.env.FLUE_CONTEXT_PATH ?? ".flue-runtime/context.json"} and complete the authorized repository request. Follow every applicable AGENTS.md. Do not use GitHub APIs, gh, commit, push, or expose credentials. Make the smallest correct changes, run relevant tests, and call submit_result exactly once. Use action "change" only when the worktree changed.`;
}

export function ReviewAgent() {
  const context = readContext();
  useKumoModel("high");
  useTool(submitResult);

  return `Review this pull request from the supplied immutable context. Focus on correctness, security, regressions, and repository conventions. Return only real findings on changed lines. Do not use tools or execute code. Call submit_result with action "review", an empty tests array, and inline comments containing valid diff paths and lines. If there are no findings, use summaryMarkdown "LGTM!".\n\n${context.raw}`;
}

export function AstroParityAgent() {
  useKumoModel("high");
  useTool(submitResult);
  useSandbox(
    local({
      cwd: process.env.FLUE_WORKSPACE ?? process.cwd(),
      env: {
        GH_TOKEN: undefined,
        GITHUB_TOKEN: undefined,
        ACTIONS_ID_TOKEN_REQUEST_TOKEN: undefined,
        ACTIONS_RUNTIME_TOKEN: undefined,
        ACTIONS_RUNTIME_URL: undefined,
        ACTIONS_RESULTS_URL: undefined,
        CLOUDFLARE_API_TOKEN: undefined,
        CLOUDFLARE_ACCOUNT_ID: undefined,
        CLOUDFLARE_GATEWAY_ID: undefined,
      },
    }),
  );

  return `Read ${process.env.FLUE_CONTEXT_PATH ?? ".flue-runtime/context.json"} and the visual findings it references. Synchronize the Astro implementation with the exact upstream production commit already merged into this worktree. Repair packages/kumo-astro and its Astro documentation fixtures until every scoped visual finding is at or below 1%, with missing/new demos resolved. Follow AGENTS.md, use semantic Kumo tokens, add a changeset for published package changes, run relevant checks, and call submit_result exactly once. Do not commit, push, use GitHub APIs, or expose credentials.`;
}
