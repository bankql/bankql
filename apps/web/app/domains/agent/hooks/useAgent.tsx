import { useChat } from "@tanstack/ai-react";
import { clientTools, fetchServerSentEvents } from "@tanstack/ai-client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { queryDataClient } from "~/domains/agent/api/queryDataTool";
import { renderTileClient } from "~/domains/agent/api/renderTileTool";
import { getVisitorId } from "~/lib/visitor";

const tools = clientTools(queryDataClient, renderTileClient);

const CHAT_URL =
  import.meta.env.VITE_CHAT_URL ??
  (import.meta.env.DEV ? "http://localhost:7072/api/chat" : "/api/chat");

const HISTORY_VERSION = "v1";
const historyKey = (visitorId: string) =>
  `bankql:chat:${HISTORY_VERSION}:${visitorId}`;

const connection = fetchServerSentEvents(CHAT_URL, async () => {
  try {
    return { headers: { "x-visitor-id": await getVisitorId() } };
  } catch {
    return {};
  }
});

type AgentState = ReturnType<typeof useChat<typeof tools>>;

const AgentContext = createContext<AgentState | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const chat = useChat({ connection, tools });
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    getVisitorId()
      .then(setVisitorId)
      .catch(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!visitorId || hydrated) return;
    try {
      const raw = localStorage.getItem(historyKey(visitorId));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          chat.setMessages(parsed);
        }
      }
    } catch {
      // corrupt history — discard
    }
    setHydrated(true);
  }, [visitorId, hydrated, chat]);

  useEffect(() => {
    if (!visitorId || !hydrated) return;
    try {
      localStorage.setItem(
        historyKey(visitorId),
        JSON.stringify(chat.messages),
      );
    } catch {
      // quota exceeded — ignore
    }
  }, [visitorId, hydrated, chat.messages]);

  return (
    <AgentContext.Provider value={chat}>{children}</AgentContext.Provider>
  );
}

export function useAgent(): AgentState {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgent must be used within AgentProvider");
  return ctx;
}
