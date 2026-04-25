import { useChat } from "@tanstack/ai-react";
import { clientTools, fetchServerSentEvents } from "@tanstack/ai-client";
import { createContext, useContext, type ReactNode } from "react";
import { queryDataClient } from "~/domains/agent/api/queryDataTool";

const tools = clientTools(queryDataClient);

const CHAT_URL =
  import.meta.env.VITE_CHAT_URL ?? "http://localhost:7072/api/chat";

type AgentState = ReturnType<typeof useChat<typeof tools>>;

const AgentContext = createContext<AgentState | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const chat = useChat({
    connection: fetchServerSentEvents(CHAT_URL),
    tools,
  });
  return (
    <AgentContext.Provider value={chat}>{children}</AgentContext.Provider>
  );
}

export function useAgent(): AgentState {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgent must be used within AgentProvider");
  return ctx;
}
