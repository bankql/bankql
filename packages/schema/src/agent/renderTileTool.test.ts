import { describe, expect, it } from "vitest";
import {
  renderTileInputSchema,
  renderTileOutputSchema,
  renderTileToolSpec,
} from "./renderTileTool.js";

describe("renderTileInputSchema", () => {
  it("accepts a chart tile config", () => {
    const result = renderTileInputSchema.safeParse({
      config: {
        type: "chart",
        title: "Banks by State",
        sql: "SELECT stalp, COUNT(*) AS n FROM institutions GROUP BY 1",
        chartType: "bar",
        xAxis: "stalp",
        yAxis: "n",
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a stat tile config", () => {
    const result = renderTileInputSchema.safeParse({
      config: {
        type: "stat",
        title: "Total banks",
        sql: "SELECT COUNT(*) AS n FROM institutions",
        format: "number",
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a table tile config", () => {
    const result = renderTileInputSchema.safeParse({
      config: {
        type: "table",
        title: "Top banks",
        sql: "SELECT * FROM institutions LIMIT 10",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing config", () => {
    expect(renderTileInputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects an invalid tile type", () => {
    const result = renderTileInputSchema.safeParse({
      config: { type: "bogus", title: "x", sql: "SELECT 1" },
    });
    expect(result.success).toBe(false);
  });
});

describe("renderTileOutputSchema", () => {
  it("accepts a valid output shape", () => {
    const result = renderTileOutputSchema.safeParse({
      config: {
        type: "chart",
        title: "x",
        sql: "SELECT 1 AS a, 2 AS b",
        chartType: "line",
        xAxis: "a",
        yAxis: "b",
      },
      rows: [{ a: 1, b: 2 }],
      rowCount: 1,
      truncated: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects rows that are not records", () => {
    const result = renderTileOutputSchema.safeParse({
      config: {
        type: "stat",
        title: "x",
        sql: "SELECT 1",
      },
      rows: ["not an object"],
      rowCount: 1,
      truncated: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing rowCount", () => {
    const result = renderTileOutputSchema.safeParse({
      config: { type: "stat", title: "x", sql: "SELECT 1" },
      rows: [],
      truncated: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("renderTileToolSpec", () => {
  it("has the expected name", () => {
    expect(renderTileToolSpec.name).toBe("render_tile");
  });

  it("references chart/visualization in the description", () => {
    expect(renderTileToolSpec.description.toLowerCase()).toContain("chart");
  });

  it("exposes the input and output schemas by reference", () => {
    expect(renderTileToolSpec.inputSchema).toBe(renderTileInputSchema);
    expect(renderTileToolSpec.outputSchema).toBe(renderTileOutputSchema);
  });
});
