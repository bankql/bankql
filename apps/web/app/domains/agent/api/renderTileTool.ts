import { toolDefinition } from "@tanstack/ai";
import { renderTileToolSpec } from "@bankql/schema";
import { runQuery } from "~/lib/duckdb";
import { dataReady } from "~/lib/datasets";

export const renderTileClient = toolDefinition(renderTileToolSpec).client(
  async ({ config }) => {
    await dataReady;
    const result = await runQuery(config.sql);
    return { config, ...result };
  },
);
