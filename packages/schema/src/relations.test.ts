import { describe, expect, it } from "vitest";
import { getRelations } from "./relations.js";
import type { DatasetDef } from "./types.js";

describe("getRelations", () => {
  it("returns an empty array for an empty dataset list", () => {
    expect(getRelations([])).toEqual([]);
  });

  it("returns an empty array when no fields declare a relation", () => {
    const dataset: DatasetDef = {
      name: "a",
      fields: { id: { type: "integer" } },
    };
    expect(getRelations([dataset])).toEqual([]);
  });

  it("emits one edge per relation-bearing field", () => {
    const users: DatasetDef = {
      name: "users",
      fields: { id: { type: "integer" } },
    };
    const payments: DatasetDef = {
      name: "payments",
      fields: {
        id: { type: "integer" },
        userId: {
          type: "integer",
          relation: { dataset: "users", field: "id", cardinality: "many:1" },
        },
      },
    };
    const orders: DatasetDef = {
      name: "orders",
      fields: {
        userId: {
          type: "integer",
          relation: { dataset: "users", field: "id", cardinality: "many:1" },
        },
        paymentId: {
          type: "integer",
          relation: {
            dataset: "payments",
            field: "id",
            cardinality: "1:1",
          },
        },
      },
    };
    expect(getRelations([users, payments, orders])).toEqual([
      {
        from: { dataset: "payments", field: "userId" },
        to: { dataset: "users", field: "id" },
        cardinality: "many:1",
      },
      {
        from: { dataset: "orders", field: "userId" },
        to: { dataset: "users", field: "id" },
        cardinality: "many:1",
      },
      {
        from: { dataset: "orders", field: "paymentId" },
        to: { dataset: "payments", field: "id" },
        cardinality: "1:1",
      },
    ]);
  });
});
