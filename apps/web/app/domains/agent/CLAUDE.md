# Agent Domain

Owns the browser-side AI chat agent that answers questions about FDIC/NIC banking data by writing SQL and executing it against DuckDB-WASM.

## Architecture

This is a **client-only** domain. `apps/web` is SPA-only — no server code lives here.

- **Server** (separate app, `apps/azf-v1`): receives `{ messages }`, calls `chat()` with the Anthropic-over-Azure-Foundry adapter, `buildSystemPrompt()`, and the `query_data` tool definition. Streams SSE back.
- **Client** (this domain): `useAgent()` wraps `useChat` with an SSE connection to `VITE_CHAT_URL` (defaulting to `http://localhost:7072/api/chat` in dev, same-origin `/api/chat` in prod via Azure Front Door) and registers `queryDataClient` as a client-side executor. `runQuery()` in `~/lib/duckdb` does the DuckDB work. `ChatPanel` renders messages.

The shared tool **spec** (name, description, input/output zod schemas) lives in `@bankql/schema` (`src/agent/queryDataTool.ts`) so both the server and client wrap the same definition.

The LLM never touches the data. It writes SQL; the browser runs it; the result streams back into the agent loop.

## Key Exports

- `api/queryDataTool.ts` — `queryDataClient`: calls `toolDefinition(queryDataToolSpec).client(...)` to bind the shared spec to `runQuery()`.
- `hooks/useAgent.tsx` — `useAgent()` returns the `useChat` result, wired to `VITE_CHAT_URL`.
- `ui/ChatPanel.tsx` — right-side panel component, consumed by `domains/layout/ui/Layout.tsx`.

## Boundaries

- Imports from `~/lib/duckdb`, `@bankql/schema`, `@tanstack/ai*`. Does NOT import from other domains.
- Does NOT import from `apps/azf-v1`. The only contract between the two apps is the HTTP endpoint and the shared tool spec in `@bankql/schema`.
