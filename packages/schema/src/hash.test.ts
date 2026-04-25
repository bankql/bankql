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
  it("returns a 64-char hex hash and an 8-char short hash", async () => {
    const { hash, short } = await hashDataset(base);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(short).toBe(hash.slice(0, 8));
  });

  it("is deterministic for the same input", async () => {
    expect((await hashDataset(base)).hash).toBe((await hashDataset(base)).hash);
  });

  it("is independent of field insertion order", async () => {
    const reordered: DatasetDef = {
      name: base.name,
      fields: {
        amount: base.fields.amount!,
        id: base.fields.id!,
      },
    };
    expect((await hashDataset(reordered)).hash).toBe(
      (await hashDataset(base)).hash,
    );
  });

  it("is independent of enumValues ordering", async () => {
    const flipped: DatasetDef = {
      ...base,
      fields: {
        ...base.fields,
        amount: { ...base.fields.amount!, enumValues: ["b", "a"] },
      },
    };
    expect((await hashDataset(flipped)).hash).toBe(
      (await hashDataset(base)).hash,
    );
  });

  it("changes when dataset name changes", async () => {
    expect((await hashDataset({ ...base, name: "other" })).hash).not.toBe(
      (await hashDataset(base)).hash,
    );
  });

  it("changes when dataset index is set vs absent", async () => {
    expect((await hashDataset({ ...base, index: "id" })).hash).not.toBe(
      (await hashDataset(base)).hash,
    );
  });

  it("changes when a field's type changes", async () => {
    const mutated: DatasetDef = {
      ...base,
      fields: { ...base.fields, id: { type: "string" } },
    };
    expect((await hashDataset(mutated)).hash).not.toBe(
      (await hashDataset(base)).hash,
    );
  });

  it("changes when a field's measure changes", async () => {
    const mutated: DatasetDef = {
      ...base,
      fields: {
        ...base.fields,
        amount: { ...base.fields.amount!, measure: "nominal" },
      },
    };
    expect((await hashDataset(mutated)).hash).not.toBe(
      (await hashDataset(base)).hash,
    );
  });

  it("changes when a field's format changes", async () => {
    const mutated: DatasetDef = {
      ...base,
      fields: {
        ...base.fields,
        amount: { ...base.fields.amount!, format: "currency-dollars" },
      },
    };
    expect((await hashDataset(mutated)).hash).not.toBe(
      (await hashDataset(base)).hash,
    );
  });

  it("changes when a field's enumValues content changes", async () => {
    const mutated: DatasetDef = {
      ...base,
      fields: {
        ...base.fields,
        amount: { ...base.fields.amount!, enumValues: ["a", "c"] },
      },
    };
    expect((await hashDataset(mutated)).hash).not.toBe(
      (await hashDataset(base)).hash,
    );
  });

  it("changes when a field's relation changes", async () => {
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
    expect((await hashDataset(mutated)).hash).not.toBe(
      (await hashDataset(base)).hash,
    );
  });

  it("does not change when description changes", async () => {
    const mutated: DatasetDef = {
      ...base,
      description: "new",
      fields: {
        ...base.fields,
        id: { ...base.fields.id!, description: "ignored" },
      },
    };
    expect((await hashDataset(mutated)).hash).toBe(
      (await hashDataset(base)).hash,
    );
  });

  it("does not change when unit, activityType, blobPath, or sourceKey change", async () => {
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
    expect((await hashDataset(mutated)).hash).toBe(
      (await hashDataset(base)).hash,
    );
  });

  it("produces distinct hashes for a field without optional fingerprint keys vs with them", async () => {
    const bare: DatasetDef = {
      name: base.name,
      fields: { id: { type: "integer" } },
    };
    expect((await hashDataset(bare)).hash).not.toBe(
      (await hashDataset(base)).hash,
    );
  });
});

describe("hashDatasets", () => {
  it("returns a record keyed by dataset name", async () => {
    const other: DatasetDef = {
      name: "other",
      fields: { id: { type: "integer" } },
    };
    const result = await hashDatasets([base, other]);
    expect(Object.keys(result)).toEqual(["example", "other"]);
    expect(result.example!.hash).toBe((await hashDataset(base)).hash);
  });

  it("returns an empty object for an empty input", async () => {
    expect(await hashDatasets([])).toEqual({});
  });
});

describe("assertDatasetHash", () => {
  it("passes when the short hash matches", async () => {
    const { short } = await hashDataset(base);
    await expect(assertDatasetHash(base, short)).resolves.not.toThrow();
  });

  it("throws a descriptive Error when the short hash mismatches", async () => {
    await expect(assertDatasetHash(base, "00000000")).rejects.toThrow(
      /Schema drift detected for dataset "example"/,
    );
  });
});
