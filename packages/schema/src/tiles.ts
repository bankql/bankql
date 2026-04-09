import { z } from "zod";

export const StatConfigSchema = z.object({
  type: z.literal("stat"),
  title: z.string(),
  sql: z.string(),
  format: z.enum(["number", "currency", "percent"]).optional(),
});

export const ChartConfigSchema = z.object({
  type: z.literal("chart"),
  title: z.string(),
  sql: z.string(),
  chartType: z.enum(["bar", "line", "area", "dot"]),
  xAxis: z.string(),
  yAxis: z.string(),
  color: z.string().optional(),
});

export const TableConfigSchema = z.object({
  type: z.literal("table"),
  title: z.string(),
  sql: z.string(),
  columns: z.array(z.string()).optional(),
});

export const TileConfigSchema = z.discriminatedUnion("type", [
  StatConfigSchema,
  ChartConfigSchema,
  TableConfigSchema,
]);

export type TileConfig = z.infer<typeof TileConfigSchema>;
export type StatConfig = z.infer<typeof StatConfigSchema>;
export type ChartConfig = z.infer<typeof ChartConfigSchema>;
export type TableConfig = z.infer<typeof TableConfigSchema>;

/**
 * DB read boundary: parse a JSON string from NVARCHAR(MAX) into a validated TileConfig.
 * Throws ZodError if the stored JSON is malformed or doesn't match the schema.
 */
export function parseTileConfig(raw: string): TileConfig {
  return TileConfigSchema.parse(JSON.parse(raw));
}

/**
 * DB write boundary: validate a TileConfig and serialize to a JSON string for NVARCHAR(MAX).
 * Throws ZodError if the input doesn't match the schema — prevents bad data from reaching the DB.
 */
export function serializeTileConfig(config: unknown): string {
  return JSON.stringify(TileConfigSchema.parse(config));
}
