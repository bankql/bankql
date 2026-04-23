import { z } from "zod";

export const queryDataInputSchema = z.object({
  sql: z
    .string()
    .describe("The DuckDB SQL query to execute. Must be a SELECT."),
});

export const queryDataOutputSchema = z.object({
  rows: z.array(z.record(z.string(), z.unknown())),
  rowCount: z.number(),
  truncated: z.boolean(),
});

export const queryDataToolSpec = {
  name: "query_data",
  description:
    "Execute a read-only SQL query against the in-browser DuckDB instance " +
    "containing FDIC/NIC banking datasets. Returns up to 1000 rows as JSON. " +
    "Use the schema in the system prompt to write correct DuckDB SQL.",
  inputSchema: queryDataInputSchema,
  outputSchema: queryDataOutputSchema,
} as const;

export type QueryDataInput = z.infer<typeof queryDataInputSchema>;
export type QueryDataOutput = z.infer<typeof queryDataOutputSchema>;
