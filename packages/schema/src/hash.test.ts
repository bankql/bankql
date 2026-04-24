import { describe, expect, it } from "vitest";
import {
  assertDatasetHash,
  hashDataset,
  hashDatasets,
} from "./hash.js";
import type { DatasetDef } from "./types.js";

const base: DatasetDef = {
  name: "example",
  fields: {
    id: { type: "integer" },
    amount: {
      type: "float",
      measure: "quantitative",
      format: "currency-cents",
      enumValues: ["a", "b"],
      relation: { dataset: "users", field: "id", cardinality: "many:1" },
    },
  },
};

describe("hashDataset", () => {
  it("returns a 64-char hex hash and an 8-char short hash", () => {
    const { hash, short } = hashDataset(base);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(short).toBe(hash.slice(0, 8));
  });

  it("is deterministic for the same input", () => {
    expect(hashDataset(base).hash).toBe(hashDataset(base).hash);
  });

  it("is independent of field insertion order", () => {
    const reordered: DatasetDef = {
      name: base.name,
      fields: {
        amount: base.fields.amount!,
        id: base.fields.id!,
      },
    };
    expect(hashDataset(reordered).hash).toBe(hashDataset(base).hash);
  });

  it("is independent of enumValues ordering", () => {
    const flipped: DatasetDef = {
      ...base,
      fields: {
        ...base.fields,
        amount: { ...base.fields.amount!, enumValues: ["b", "a"] },
      },
    };
    expect(hashDataset(flipped).hash).toBe(hashDataset(base).hash);
  });

  it("changes when dataset name changes", () => {
    expect(hashDataset({ ...base, name: "other" }).hash).not.toBe(
      hashDataset(base).hash,
    );
  });

  it("changes when dataset index is set vs absent", () => {
    expect(hashDataset({ ...base, index: "id" }).hash).not.toBe(
      hashDataset(base).hash,
    );
  });

  it("changes when a field's type changes", () => {
    const mutated: DatasetDef = {
      ...base,
      fields: { ...base.fields, id: { type: "string" } },
    };
    expect(hashDataset(mutated).hash).not.toBe(hashDataset(base).hash);
  });

  it("changes when a field's measure changes", () => {
    const mutated: DatasetDef = {
      ...base,
      fields: {
        ...base.fields,
        amount: { ...base.fields.amount!, measure: "nominal" },
      },
    };
    expect(hashDataset(mutated).hash).not.toBe(hashDataset(base).hash);
  });

  it("changes when a field's format changes", () => {
    const mutated: DatasetDef = {
      ...base,
      fields: {
        ...base.fields,
        amount: { ...base.fields.amount!, format: "currency-dollars" },
      },
    };
    expect(hashDataset(mutated).hash).not.toBe(hashDataset(base).hash);
  });

  it("changes when a field's enumValues content changes", () => {
    const mutated: DatasetDef = {
      ...base,
      fields: {
        ...base.fields,
        amount: { ...base.fields.amount!, enumValues: ["a", "c"] },
      },
    };
    expect(hashDataset(mutated).hash).not.toBe(hashDataset(base).hash);
  });

  it("changes when a field's relation changes", () => {
    const mutated: DatasetDef = {
      ...base,
      fields: {
        ...base.fields,
        amount: {
          ...base.fields.amount!,
          relation: { dataset: "other", field: "id", cardinality: "many:1" },
        },
      },
    };
    expect(hashDataset(mutated).hash).not.toBe(hashDataset(base).hash);
  });

  it("does not change when description changes", () => {
    const mutated: DatasetDef = {
      ...base,
      description: "new",
      fields: {
        ...base.fields,
        id: { ...base.fields.id!, description: "ignored" },
      },
    };
    expect(hashDataset(mutated).hash).toBe(hashDataset(base).hash);
  });

  it("does not change when unit, activityType, blobPath, or sourceKey change", () => {
    const mutated: DatasetDef = {
      ...base,
      blobPath: "/tmp/x",
      fields: {
        ...base.fields,
        id: {
          ...base.fields.id!,
          unit: "rows",
          activityType: "Example.Created",
          sourceKey: "ID",
        },
      },
    };
    expect(hashDataset(mutated).hash).toBe(hashDataset(base).hash);
  });

  it("produces distinct hashes for a field without optional fingerprint keys vs with them", () => {
    const bare: DatasetDef = {
      name: base.name,
      fields: { id: { type: "integer" } },
    };
    expect(hashDataset(bare).hash).not.toBe(hashDataset(base).hash);
  });
});

describe("hashDatasets", () => {
  it("returns a record keyed by dataset name", () => {
    const other: DatasetDef = {
      name: "other",
      fields: { id: { type: "integer" } },
    };
    const result = hashDatasets([base, other]);
    expect(Object.keys(result)).toEqual(["example", "other"]);
    expect(result.example!.hash).toBe(hashDataset(base).hash);
  });

  it("returns an empty object for an empty input", () => {
    expect(hashDatasets([])).toEqual({});
  });
});

describe("assertDatasetHash", () => {
  it("passes when the short hash matches", () => {
    const { short } = hashDataset(base);
    expect(() => assertDatasetHash(base, short)).not.toThrow();
  });

  it("throws a descriptive Error when the short hash mismatches", () => {
    expect(() => assertDatasetHash(base, "00000000")).toThrow(
      /Schema drift detected for dataset "example"/,
    );
  });
});
