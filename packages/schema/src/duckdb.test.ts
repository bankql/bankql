import { describe, expect, it } from "vitest";
import { toDuckDBCreateTable } from "./duckdb.js";
import type { DatasetDef, PerspectiveType } from "./types.js";

const makeDataset = (
  overrides: Partial<DatasetDef> = {},
): DatasetDef => ({
  name: "tbl",
  fields: { id: { type: "integer" } },
  ...overrides,
});

describe("toDuckDBCreateTable", () => {
  it.each<[PerspectiveType, string]>([
    ["integer", "INTEGER"],
    ["float", "DOUBLE"],
    ["string", "VARCHAR"],
    ["date", "DATE"],
    ["datetime", "TIMESTAMP"],
    ["boolean", "BOOLEAN"],
  ])("maps %s -> %s", (perspective, duckdb) => {
    const ddl = toDuckDBCreateTable({
      name: "tbl",
      fields: { col: { type: perspective } },
    });
    expect(ddl).toContain(`col ${duckdb}`);
  });

  it("wraps the table name in double quotes", () => {
    expect(toDuckDBCreateTable(makeDataset())).toMatch(/CREATE TABLE "tbl"/);
  });

  it("appends PRIMARY KEY when index is set", () => {
    const ddl = toDuckDBCreateTable(makeDataset({ index: "id" }));
    expect(ddl).toContain("PRIMARY KEY (id)");
  });

  it("omits PRIMARY KEY when index is absent", () => {
    expect(toDuckDBCreateTable(makeDataset())).not.toContain("PRIMARY KEY");
  });

  it("inserts IF NOT EXISTS when ifNotExists is true", () => {
    expect(
      toDuckDBCreateTable(makeDataset(), { ifNotExists: true }),
    ).toMatch(/CREATE TABLE IF NOT EXISTS "tbl"/);
  });

  it("omits IF NOT EXISTS when ifNotExists is false", () => {
    expect(
      toDuckDBCreateTable(makeDataset(), { ifNotExists: false }),
    ).not.toContain("IF NOT EXISTS");
  });

  it("omits IF NOT EXISTS when options is undefined", () => {
    expect(toDuckDBCreateTable(makeDataset())).not.toContain("IF NOT EXISTS");
  });
});
