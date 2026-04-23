import { useChat } from "@tanstack/ai-react";
import { clientTools, fetchServerSentEvents } from "@tanstack/ai-client";
import { queryDataClient } from "~/domains/agent/api/queryDataTool";

const tools = clientTools(queryDataClient);

export function useAgent() {
  return useChat({
    connection: fetchServerSentEvents("/api/chat"),
    tools,
  });
}
