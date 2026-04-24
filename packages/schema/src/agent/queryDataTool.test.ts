import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import {
  queryDataInputSchema,
  queryDataOutputSchema,
  queryDataToolSpec,
} from "./queryDataTool.js";

describe("queryDataInputSchema", () => {
  it("accepts a string sql", () => {
    expect(queryDataInputSchema.parse({ sql: "SELECT 1" })).toEqual({
      sql: "SELECT 1",
    });
  });

  it("rejects a non-string sql", () => {
    expect(() => queryDataInputSchema.parse({ sql: 42 })).toThrow(ZodError);
  });

  it("rejects missing sql", () => {
    expect(() => queryDataInputSchema.parse({})).toThrow(ZodError);
  });
});

describe("queryDataOutputSchema", () => {
  it("accepts a valid output shape", () => {
    const output = {
      rows: [{ id: 1, name: "a" }],
      rowCount: 1,
      truncated: false,
    };
    expect(queryDataOutputSchema.parse(output)).toEqual(output);
  });

  it("rejects a non-array rows field", () => {
    expect(() =>
      queryDataOutputSchema.parse({
        rows: "nope",
        rowCount: 0,
        truncated: false,
      }),
    ).toThrow(ZodError);
  });

  it("rejects a non-number rowCount", () => {
    expect(() =>
      queryDataOutputSchema.parse({
        rows: [],
        rowCount: "0",
        truncated: false,
      }),
    ).toThrow(ZodError);
  });

  it("rejects a non-boolean truncated", () => {
    expect(() =>
      queryDataOutputSchema.parse({
        rows: [],
        rowCount: 0,
        truncated: "yes",
      }),
    ).toThrow(ZodError);
  });
});

describe("queryDataToolSpec", () => {
  it("has the expected name and description", () => {
    expect(queryDataToolSpec.name).toBe("query_data");
    expect(queryDataToolSpec.description).toMatch(/DuckDB/);
  });

  it("wires the exported schemas by reference", () => {
    expect(queryDataToolSpec.inputSchema).toBe(queryDataInputSchema);
    expect(queryDataToolSpec.outputSchema).toBe(queryDataOutputSchema);
  });
});
