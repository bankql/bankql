import {
  createAnthropicChat,
  type AnthropicChatModel,
} from "@tanstack/ai-anthropic";

export function anthropicAzureFoundry() {
  const endpoint = process.env.AZURE_FOUNDRY_ENDPOINT;
  const apiKey = process.env.AZURE_FOUNDRY_API_KEY;
  const model = process.env.AZURE_FOUNDRY_MODEL as
    | AnthropicChatModel
    | undefined;

  if (!endpoint) {
    throw new Error("AZURE_FOUNDRY_ENDPOINT is not set");
  }
  if (!apiKey) {
    throw new Error("AZURE_FOUNDRY_API_KEY is not set");
  }
  if (!model) {
    throw new Error("AZURE_FOUNDRY_MODEL is not set");
  }

  return createAnthropicChat(model, apiKey, {
    baseURL: endpoint,
    defaultHeaders: { "api-key": apiKey },
  });
}
