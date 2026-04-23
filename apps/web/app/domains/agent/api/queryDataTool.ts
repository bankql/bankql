import { toolDefinition } from "@tanstack/ai";
import { queryDataToolSpec } from "@bankql/schema";
import { runQuery } from "~/lib/duckdb";
import { dataReady } from "~/lib/datasets";

export const queryDataClient = toolDefinition(queryDataToolSpec).client(
  async ({ sql }) => {
    await dataReady;
    return runQuery(sql);
  },
);
