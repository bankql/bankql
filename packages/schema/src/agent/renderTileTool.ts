import { z } from "zod";
import { TileConfigSchema } from "../tiles.js";

export const renderTileInputSchema = z.object({
  config: TileConfigSchema.describe(
    "A TileConfig describing the tile to render. " +
      "Must include a `type` (stat | chart | table), `title`, `sql`, and " +
      "type-specific fields (e.g. chartType + xAxis + yAxis for charts).",
  ),
});

export const renderTileOutputSchema = z.object({
  config: TileConfigSchema,
  rows: z.array(z.record(z.string(), z.unknown())),
  rowCount: z.number(),
  truncated: z.boolean(),
});

export const renderTileToolSpec = {
  name: "render_tile",
  description:
    "Render a visualization tile (chart, stat, or table) inline in the chat. " +
    "Pass a TileConfig with the SQL to run; the browser executes the SQL " +
    "against DuckDB and renders the result. Use this instead of `query_data` " +
    "when the user wants a chart or visualization. For chart tiles, choose " +
    "`xAxis` and `yAxis` column names that the SQL actually returns.",
  inputSchema: renderTileInputSchema,
  outputSchema: renderTileOutputSchema,
} as const;

export type RenderTileInput = z.infer<typeof renderTileInputSchema>;
export type RenderTileOutput = z.infer<typeof renderTileOutputSchema>;
