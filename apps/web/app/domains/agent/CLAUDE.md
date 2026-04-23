# Agent Domain

Owns the browser-side AI chat agent that answers questions about FDIC/NIC banking data by writing SQL and executing it against DuckDB-WASM.

## Architecture

Split between client (this domain) and server (`app/routes/api/chat.ts`):

- **Server**: receives `messages`, calls `chat()` with the Anthropic/Azure Foundry adapter, system prompt from `toLLMSystemPrompt()`, and `query_data` tool definition. Streams SSE back.
- **Client**: `useAgent()` wraps `useChat` with an SSE connection to `/api/chat` and registers `queryDataClient` as a client-side executor. `runQuery()` in `~/lib/duckdb` does the DuckDB work. `ChatPanel` renders messages.

The LLM never touches the data. It writes SQL; the browser runs it; the result streams back into the agent loop.

## Key Exports

- `api/queryDataTool.ts` — `queryDataDef` (shared tool definition) and `queryDataClient` (client executor wired to `runQuery`).
- `api/systemPrompt.ts` — `buildSystemPrompt()` composes operator instructions with `toLLMSystemPrompt(datasets)` from `@bankql/schema`.
- `hooks/useAgent.tsx` — `useAgent()` returns `{ messages, sendMessage, isLoading, stop }`.
- `ui/ChatPanel.tsx` — right-side panel component, consumed by `domains/layout/ui/Layout.tsx`.

## Boundaries

- Imports from `~/lib/duckdb`, `@bankql/schema`, `@tanstack/ai*`. Does NOT import from other domains.
- The server route (`app/routes/api/chat.ts`) imports `queryDataDef` and `buildSystemPrompt` from this domain — those exports are the public server-facing surface.
