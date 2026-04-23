import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import {
  chat,
  toolDefinition,
  toServerSentEventsStream,
} from "@tanstack/ai";
import { queryDataToolSpec } from "@bankql/schema";
import { anthropicAzureFoundry } from "../lib/anthropicAzureFoundry.js";
import { buildSystemPrompt } from "../lib/systemPrompt.js";

const queryDataDef = toolDefinition(queryDataToolSpec);

type ChatAdapter = ReturnType<typeof anthropicAzureFoundry>;
type ChatMessages = NonNullable<
  Parameters<typeof chat<ChatAdapter>>[0]["messages"]
>;

export async function chatHandler(
  request: HttpRequest,
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") {
    return { status: 204, headers: corsHeaders() };
  }

  const body = (await request.json()) as { messages: ChatMessages };

  const stream = chat({
    adapter: anthropicAzureFoundry(),
    messages: body.messages,
    tools: [queryDataDef],
    systemPrompts: [buildSystemPrompt()],
  });

  return {
    status: 200,
    headers: {
      ...corsHeaders(),
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
    body: toServerSentEventsStream(stream),
  };
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}

app.http("chat", {
  route: "chat",
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  handler: chatHandler,
});
