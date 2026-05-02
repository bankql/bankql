#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod/v3";
import { allDatasets, toLLMDescription } from "@bankql/schema";
import { openBankqlDuckDB, runQuery } from "./duckdb.js";

const server = new McpServer({
  name: "bankql",
  version: "0.1.0",
});

// The SDK's registerTool generic union (ZodRawShapeCompat | AnySchema)
// triggers a "type instantiation excessively deep" error in tsc — and OOMs
// the compiler when given enough schema variants. Cast through a simpler
// signature; runtime is unaffected.
type ToolConfig = {
  description?: string;
  inputSchema?: unknown;
  outputSchema?: unknown;
};
type ToolHandler = (args: unknown, extra: unknown) => unknown;
const registerTool = (
  server as unknown as {
    registerTool(name: string, config: ToolConfig, cb: ToolHandler): unknown;
  }
).registerTool.bind(server);

const db = await openBankqlDuckDB();

process.stderr.write(
  `[bankql-mcp] Registered: ${db.registered.join(", ") || "(none)"}\n`,
);
if (db.skipped.length > 0) {
  for (const s of db.skipped) {
    process.stderr.write(`[bankql-mcp] Skipped ${s.name} — ${s.reason}\n`);
  }
}

registerTool(
  "query_data",
  {
    description:
      "Execute a read-only DuckDB SQL query against the bankql FDIC/NIC datasets. " +
      "The query is wrapped in `SELECT * FROM (...) LIMIT 1001` to cap output. " +
      "Use `list_datasets` to see what tables are available and `describe_dataset` " +
      "to inspect columns before writing SQL.",
    inputSchema: z.object({
      sql: z.string().describe("DuckDB SQL query. Read-only. Should be a SELECT."),
    }),
    outputSchema: z.object({
      rows: z.array(z.record(z.string(), z.unknown())),
      rowCount: z.number(),
      truncated: z.boolean(),
    }),
  },
  async (args) => {
    const { sql } = args as { sql: string };
    const result = await runQuery(db.conn, sql);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
);

registerTool(
  "list_datasets",
  {
    description:
      "List the datasets available for querying, including the registration " +
      "status (registered datasets are queryable; skipped ones are not yet published).",
    inputSchema: z.object({}),
    outputSchema: z.object({
      datasets: z.array(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          registered: z.boolean(),
          skipReason: z.string().optional(),
        }),
      ),
    }),
  },
  async () => {
    const skippedMap = new Map(db.skipped.map((s) => [s.name, s.reason]));
    const datasets = allDatasets.map((d) => ({
      name: d.name,
      description: d.description,
      registered: !skippedMap.has(d.name),
      skipReason: skippedMap.get(d.name),
    }));
    const result = { datasets };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
);

registerTool(
  "describe_dataset",
  {
    description:
      "Return rich column metadata for a dataset: types, descriptions, units, " +
      "enum values, and foreign-key relations. Use before writing SQL.",
    inputSchema: z.object({
      name: z
        .string()
        .describe("Dataset name (e.g. 'institutions', 'sod', 'nic_attributes')."),
    }),
    outputSchema: z.object({
      name: z.string(),
      description: z.string().optional(),
      fields: z.array(z.record(z.string(), z.unknown())),
      relations: z.array(z.record(z.string(), z.unknown())),
    }),
  },
  async (args) => {
    const { name } = args as { name: string };
    const dataset = allDatasets.find((d) => d.name === name);
    if (!dataset) {
      const known = allDatasets.map((d) => d.name).join(", ");
      throw new Error(`Unknown dataset '${name}'. Known: ${known}`);
    }
    const desc = toLLMDescription(dataset);
    const result = {
      name: desc.name,
      description: desc.description,
      fields: desc.fields as unknown as Array<Record<string, unknown>>,
      relations: desc.relations as unknown as Array<Record<string, unknown>>,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);

const shutdown = async () => {
  await db.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
