import { toolDefinition } from "@tanstack/ai";
import { queryDataToolSpec } from "@bankql/schema";
import { runQuery } from "~/lib/duckdb";

export const queryDataClient = toolDefinition(queryDataToolSpec).client(
  async ({ sql }) => runQuery(sql),
);
