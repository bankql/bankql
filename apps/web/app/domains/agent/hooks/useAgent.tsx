import { useChat } from "@tanstack/ai-react";
import { clientTools, fetchServerSentEvents } from "@tanstack/ai-client";
import { queryDataClient } from "~/domains/agent/api/queryDataTool";

const tools = clientTools(queryDataClient);

const CHAT_URL =
  import.meta.env.VITE_CHAT_URL ?? "http://localhost:7072/api/chat";

export function useAgent() {
  return useChat({
    connection: fetchServerSentEvents(CHAT_URL),
    tools,
  });
}
