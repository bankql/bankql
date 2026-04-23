import { createFileRoute } from "@tanstack/react-router";
import { chat, toServerSentEventsStream } from "@tanstack/ai";
import { anthropicAzureFoundry } from "~/lib/anthropicAzureFoundry";
import { queryDataDef } from "~/domains/agent/api/queryDataTool";
import { buildSystemPrompt } from "~/domains/agent/api/systemPrompt";

type ChatAdapter = ReturnType<typeof anthropicAzureFoundry>;
type ChatMessages = NonNullable<
  Parameters<typeof chat<ChatAdapter>>[0]["messages"]
>;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages: ChatMessages };

        const stream = chat({
          adapter: anthropicAzureFoundry(),
          messages: body.messages,
          tools: [queryDataDef],
          systemPrompts: [buildSystemPrompt()],
        });

        return new Response(toServerSentEventsStream(stream), {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
