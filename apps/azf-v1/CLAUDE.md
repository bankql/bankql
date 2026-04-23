# @bankql/azf-v1

Azure Functions (v4 programming model, Node 24, ESM) app that hosts server-side APIs for the BankQL stack. Currently serves the AI chat proxy; more endpoints can be added here.

## Why this app exists

`apps/web` is **SPA-only** — no server code runs out of it. Anything that needs a server (LLM proxy for keeping API keys off the client, scheduled jobs, webhook receivers, etc.) lives here.

In production, Azure Front Door routes `/api/*` on the web origin to this Function App, so the browser talks to same-origin `/api/chat` and never sees the Function host URL. In dev, `apps/web` hits `http://localhost:7072/api/chat` via `VITE_CHAT_URL`.

## Dev Commands

```bash
npm run build      # tsc (emits to dist/)
npm run watch      # tsc --watch
npm run typecheck  # tsc --noEmit
npm run dev        # build once, start azurite + func host on port 7072
```

`func start` requires the Azure Functions Core Tools v4 (`func --version`).

## File Layout

```
src/
  index.ts                     # entry — imports each function file so app.http() registers it
  functions/
    hello.ts                   # GET /api/hello — smoke test
    chat.ts                    # POST /api/chat — SSE stream of @tanstack/ai chat()
  lib/
    anthropicAzureFoundry.ts   # adapter — wraps createAnthropicChat for Azure AI Foundry routing
    systemPrompt.ts            # buildSystemPrompt() — operator prompt + toLLMSystemPrompt(datasets)
host.json                      # Functions runtime config
local.settings.json            # local env vars — gitignored (see local.settings.example.json)
```

## Registering a function

The Functions v4 programming model registers handlers at module load via `app.http(...)`. To wire up a new handler:

1. Create `src/functions/<name>.ts`, call `app.http("<name>", { route, methods, authLevel, handler })` at the bottom.
2. Add `import "./functions/<name>.js"` to `src/index.ts` so the registration fires.

## Chat endpoint contract

`POST /api/chat` with `{ messages: ChatMessages }` returns a `text/event-stream`.

- **Adapter**: `anthropicAzureFoundry()` reads `AZURE_FOUNDRY_ENDPOINT`, `AZURE_FOUNDRY_API_KEY`, `AZURE_FOUNDRY_MODEL` from env and returns a `createAnthropicChat(...)` adapter with the Foundry `baseURL` + `api-key` header.
- **Tools**: `toolDefinition(queryDataToolSpec)` — the spec is imported from `@bankql/schema` so the browser-side `queryDataClient` in `apps/web` uses the same schema.
- **System prompt**: `buildSystemPrompt()` composes operator instructions with `toLLMSystemPrompt(datasets)` from `@bankql/schema`.
- **Streaming**: `toServerSentEventsStream(stream)` from `@tanstack/ai` produces an SSE `ReadableStream`, which Azure Functions v4 accepts as the response `body`.
- **CORS**: wildcard in dev (`Host.CORS` in `local.settings.json` + response headers); in prod, same-origin via Front Door so CORS is a no-op.

The LLM never executes SQL server-side. It emits `query_data` tool calls, which stream back to the browser; the browser runs them against DuckDB-WASM and posts results back into the agent loop.

## Environment

Required in `local.settings.json` `Values`:

- `AZURE_FOUNDRY_ENDPOINT` — Foundry resource URL with the `/anthropic` path suffix, e.g. `https://<resource>.openai.azure.com/anthropic`. The `@anthropic-ai/sdk` appends `/v1/messages` to this.
- `AZURE_FOUNDRY_API_KEY` — Foundry API key
- `AZURE_FOUNDRY_MODEL` — Azure **deployment** name (e.g. `claude-sonnet-4-6-1`), not the Anthropic model ID. Foundry routes by deployment, not by canonical model name. `@tanstack/ai-anthropic` types will reject this; cast to `AnthropicChatModel` at the boundary.
- `AZURE_FOUNDRY_API_VERSION` — required query param on every Foundry call (current value `2023-06-01`). Injected via the Anthropic SDK's `defaultQuery`. Bump if Foundry ships a new version.

See `local.settings.example.json` for the shape. Missing vars cause `chatHandler` to throw on first request (500).

## Boundaries

- Depends on `@bankql/schema` (`packages/schema`) for dataset defs, `toLLMSystemPrompt()`, and shared tool specs. That package emits JS to `dist/` — this app is compiled to `dist/` as well and imports from the built schema output, not source.
- Does NOT import from `apps/web`. The only contract between the two apps is the HTTP endpoint and the shared tool specs in `@bankql/schema`.

## Key Dependencies

| Package | Purpose |
|---|---|
| `@azure/functions` | v4 programming model host bindings |
| `@tanstack/ai` | Chat orchestration + tool calling + SSE serialization |
| `@tanstack/ai-anthropic` | Anthropic adapter (pointed at Azure Foundry via `baseURL`) |
| `@bankql/schema` | Dataset defs, LLM prompt builders, shared tool specs |
