import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { createProvider } from "@earendil-works/pi-ai";
import { openAICompletionsApi } from "@earendil-works/pi-ai/api/openai-completions.lazy";
import { moonshotaiProvider } from "@earendil-works/pi-ai/providers/moonshotai";
import { setProvider } from "@flue/runtime";

export const FLUE_PROVIDER_ID = "cloudflare-rest";
export const FLUE_MODEL = `${FLUE_PROVIDER_ID}/moonshotai/kimi-k3`;

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!accountId) {
  throw new Error("CLOUDFLARE_ACCOUNT_ID is required");
}

const gatewayId = process.env.CLOUDFLARE_GATEWAY_ID;
if (!gatewayId) {
  throw new Error("CLOUDFLARE_GATEWAY_ID is required");
}

const tokenFile = process.env.CF_AI_TOKEN_FILE;
const apiToken =
  process.env.CLOUDFLARE_API_TOKEN?.trim() ||
  (tokenFile && existsSync(tokenFile)
    ? readFileSync(tokenFile, "utf8").trim()
    : "");
if (tokenFile && existsSync(tokenFile)) unlinkSync(tokenFile);
if (!apiToken) throw new Error("A Cloudflare API token is required");

const catalogModel = moonshotaiProvider()
  .getModels()
  .find((model) => model.id === "kimi-k3");

if (!catalogModel) {
  throw new Error("moonshotai/kimi-k3 is missing from Pi's model catalog");
}

const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1`;

setProvider(
  createProvider({
    id: FLUE_PROVIDER_ID,
    name: "Cloudflare AI REST",
    baseUrl,
    headers: { "cf-aig-gateway-id": gatewayId },
    auth: {
      apiKey: {
        name: "Cloudflare API token",
        async check() {
          return { type: "api_key", source: "one-time runtime secret" };
        },
        async resolve() {
          return {
            auth: { apiKey: apiToken },
            source: "one-time runtime secret",
          };
        },
      },
    },
    models: [
      {
        ...catalogModel,
        id: "moonshotai/kimi-k3",
        provider: FLUE_PROVIDER_ID,
        baseUrl,
      },
    ],
    api: openAICompletionsApi(),
  }),
);
