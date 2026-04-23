import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import { runQuery } from "~/lib/duckdb";

export const queryDataDef = toolDefinition({
  name: "query_data",
  description:
    "Execute a read-only SQL query against the in-browser DuckDB instance " +
    "containing FDIC/NIC banking datasets. Returns up to 1000 rows as JSON. " +
    "Use the schema in the system prompt to write correct DuckDB SQL.",
  inputSchema: z.object({
    sql: z
      .string()
      .describe("The DuckDB SQL query to execute. Must be a SELECT."),
  }),
  outputSchema: z.object({
    rows: z.array(z.record(z.string(), z.unknown())),
    rowCount: z.number(),
    truncated: z.boolean(),
  }),
});

export const queryDataClient = queryDataDef.client(async ({ sql }) => {
  return runQuery(sql);
});
