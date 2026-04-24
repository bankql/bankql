import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import {
  StatConfigSchema,
  ChartConfigSchema,
  TableConfigSchema,
  TileConfigSchema,
  parseTileConfig,
  serializeTileConfig,
  type TileConfig,
} from "./tiles.js";

describe("StatConfigSchema", () => {
  it("parses a valid stat tile with optional format", () => {
    const input = {
      type: "stat",
      title: "Total",
      sql: "SELECT COUNT(*) FROM x",
      format: "number",
    };
    expect(StatConfigSchema.parse(input)).toEqual(input);
  });

  it("parses a valid stat tile without optional format", () => {
    const input = { type: "stat", title: "Total", sql: "SELECT 1" };
    expect(StatConfigSchema.parse(input)).toEqual(input);
  });

  it.each(["number", "currency", "percent"] as const)(
    "accepts format '%s'",
    (format) => {
      expect(
        StatConfigSchema.parse({ type: "stat", title: "t", sql: "s", format }),
      ).toMatchObject({ format });
    },
  );

  it("rejects an unknown format", () => {
    expect(() =>
      StatConfigSchema.parse({
        type: "stat",
        title: "t",
        sql: "s",
        format: "nope",
      }),
    ).toThrow(ZodError);
  });

  it("rejects a wrong type literal", () => {
    expect(() =>
      StatConfigSchema.parse({ type: "chart", title: "t", sql: "s" }),
    ).toThrow(ZodError);
  });
});

describe("ChartConfigSchema", () => {
  it.each(["bar", "line", "area", "dot"] as const)(
    "accepts chartType '%s'",
    (chartType) => {
      const input = {
        type: "chart",
        title: "t",
        sql: "s",
        chartType,
        xAxis: "x",
        yAxis: "y",
      };
      expect(ChartConfigSchema.parse(input)).toEqual(input);
    },
  );

  it("accepts optional color", () => {
    const parsed = ChartConfigSchema.parse({
      type: "chart",
      title: "t",
      sql: "s",
      chartType: "bar",
      xAxis: "x",
      yAxis: "y",
      color: "red",
    });
    expect(parsed.color).toBe("red");
  });

  it("rejects an unknown chartType", () => {
    expect(() =>
      ChartConfigSchema.parse({
        type: "chart",
        title: "t",
        sql: "s",
        chartType: "pie",
        xAxis: "x",
        yAxis: "y",
      }),
    ).toThrow(ZodError);
  });
});

describe("TableConfigSchema", () => {
  it("parses with optional columns present", () => {
    const input = {
      type: "table",
      title: "t",
      sql: "s",
      columns: ["a", "b"],
    };
    expect(TableConfigSchema.parse(input)).toEqual(input);
  });

  it("parses without optional columns", () => {
    const input = { type: "table", title: "t", sql: "s" };
    expect(TableConfigSchema.parse(input)).toEqual(input);
  });
});

describe("TileConfigSchema", () => {
  it("discriminates stat", () => {
    const parsed = TileConfigSchema.parse({
      type: "stat",
      title: "t",
      sql: "s",
    });
    expect(parsed.type).toBe("stat");
  });

  it("discriminates chart", () => {
    const parsed = TileConfigSchema.parse({
      type: "chart",
      title: "t",
      sql: "s",
      chartType: "line",
      xAxis: "x",
      yAxis: "y",
    });
    expect(parsed.type).toBe("chart");
  });

  it("discriminates table", () => {
    const parsed = TileConfigSchema.parse({
      type: "table",
      title: "t",
      sql: "s",
    });
    expect(parsed.type).toBe("table");
  });

  it("rejects an unknown type discriminator", () => {
    expect(() =>
      TileConfigSchema.parse({ type: "map", title: "t", sql: "s" }),
    ).toThrow(ZodError);
  });
});

describe("parseTileConfig", () => {
  it("parses a valid JSON string", () => {
    const json = JSON.stringify({ type: "stat", title: "t", sql: "s" });
    expect(parseTileConfig(json)).toMatchObject({ type: "stat" });
  });

  it("throws SyntaxError on malformed JSON", () => {
    expect(() => parseTileConfig("{not json")).toThrow(SyntaxError);
  });

  it("throws ZodError on schema-invalid JSON", () => {
    expect(() => parseTileConfig(JSON.stringify({ type: "stat" }))).toThrow(
      ZodError,
    );
  });
});

describe("serializeTileConfig", () => {
  it("returns a JSON string for a valid config", () => {
    const config: TileConfig = { type: "stat", title: "t", sql: "s" };
    expect(JSON.parse(serializeTileConfig(config))).toEqual(config);
  });

  it("throws ZodError on invalid input", () => {
    expect(() => serializeTileConfig({ type: "stat" })).toThrow(ZodError);
  });

  it("round-trips through parseTileConfig", () => {
    const config: TileConfig = {
      type: "chart",
      title: "t",
      sql: "s",
      chartType: "area",
      xAxis: "x",
      yAxis: "y",
    };
    expect(parseTileConfig(serializeTileConfig(config))).toEqual(config);
  });
});
