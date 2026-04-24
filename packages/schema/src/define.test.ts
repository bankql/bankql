import { describe, expect, it } from "vitest";
import { defineField, defineDataset } from "./define.js";
import type { DatasetDef, FieldDef } from "./types.js";

describe("defineField", () => {
  it("returns the input reference unchanged", () => {
    const field: FieldDef<"integer"> = { type: "integer" };
    expect(defineField(field)).toBe(field);
  });
});

describe("defineDataset", () => {
  it("returns the input reference unchanged", () => {
    const dataset: DatasetDef = {
      name: "example",
      fields: { id: { type: "integer" } },
    };
    expect(defineDataset(dataset)).toBe(dataset);
  });
});
