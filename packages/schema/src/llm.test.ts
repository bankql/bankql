import { describe, expect, it } from "vitest";
import { toLLMDescription, toLLMSystemPrompt } from "./llm.js";
import type { DatasetDef } from "./types.js";

const minimalDataset: DatasetDef = {
  name: "users",
  fields: { id: { type: "integer" } },
};

const richDataset: DatasetDef = {
  name: "payments",
  description: "Payment events",
  fields: {
    id: { type: "integer" },
    amount: { type: "float", description: "Amount paid", unit: "USD" },
    status: {
      type: "string",
      enumValues: ["pending", "settled"],
    },
    userId: {
      type: "integer",
      relation: { dataset: "users", field: "id", cardinality: "many:1" },
    },
  },
};

describe("toLLMDescription", () => {
  it("omits optional keys when field metadata is absent", () => {
    const desc = toLLMDescription(minimalDataset);
    expect(desc).toEqual({
      name: "users",
      fields: [{ name: "id", type: "integer" }],
      relations: [],
    });
    expect(desc.description).toBeUndefined();
  });

  it("populates optional field metadata when present", () => {
    const desc = toLLMDescription(richDataset);
    expect(desc.description).toBe("Payment events");
    const amount = desc.fields.find((f) => f.name === "amount");
    expect(amount).toEqual({
      name: "amount",
      type: "float",
      description: "Amount paid",
      unit: "USD",
    });
    const status = desc.fields.find((f) => f.name === "status");
    expect(status).toEqual({
      name: "status",
      type: "string",
      enumValues: ["pending", "settled"],
    });
  });

  it("builds relations from fields with .relation", () => {
    const desc = toLLMDescription(richDataset);
    expect(desc.relations).toEqual([
      {
        field: "userId",
        targetDataset: "users",
        targetField: "id",
        cardinality: "many:1",
      },
    ]);
  });
});

describe("toLLMSystemPrompt", () => {
  it("renders a markdown section per dataset joined by ---", () => {
    const prompt = toLLMSystemPrompt([minimalDataset, richDataset]);
    expect(prompt).toMatch(/^## Data Model/);
    expect(prompt).toContain("### users");
    expect(prompt).toContain("### payments");
    expect(prompt.split("\n---\n").length).toBe(2);
  });

  it("includes dataset description line when present", () => {
    const prompt = toLLMSystemPrompt([richDataset]);
    expect(prompt).toContain("Payment events");
  });

  it("omits dataset description line when absent", () => {
    const prompt = toLLMSystemPrompt([minimalDataset]);
    const header = prompt.split("\n").slice(2, 5).join("\n");
    expect(header).not.toContain("undefined");
  });

  it("renders column table rows with description, unit, and enum values", () => {
    const prompt = toLLMSystemPrompt([richDataset]);
    expect(prompt).toContain("| amount | float | Amount paid (USD) |");
    expect(prompt).toContain("Values: pending, settled");
  });

  it("emits a Relations section only when relations exist", () => {
    const withRelations = toLLMSystemPrompt([richDataset]);
    expect(withRelations).toContain("**Relations:**");
    expect(withRelations).toContain(
      "`userId` → `users.id` (many:1)",
    );

    const withoutRelations = toLLMSystemPrompt([minimalDataset]);
    expect(withoutRelations).not.toContain("**Relations:**");
  });
});
