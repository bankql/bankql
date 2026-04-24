import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { TileTemplateSchema } from "./tile-templates.js";

const baseConfig = { type: "stat", title: "t", sql: "s" } as const;

describe("TileTemplateSchema", () => {
  it("applies defaults for builtIn, rssdId, tier on a minimal template", () => {
    const parsed = TileTemplateSchema.parse({
      key: "k",
      name: "n",
      config: baseConfig,
    });
    expect(parsed).toMatchObject({
      key: "k",
      name: "n",
      builtIn: false,
      rssdId: null,
      tier: "basic",
    });
  });

  it("accepts a full template with every optional field", () => {
    const parsed = TileTemplateSchema.parse({
      key: "k",
      name: "n",
      config: baseConfig,
      builtIn: true,
      rssdId: 123,
      helpText: "how to",
      category: "payments",
      tier: "premium",
    });
    expect(parsed.helpText).toBe("how to");
    expect(parsed.rssdId).toBe(123);
    expect(parsed.tier).toBe("premium");
  });

  it.each([
    "enrollment",
    "payments",
    "ttp",
    "invoices",
    "referrals",
    "saas",
    "capital-accounts",
    "active-features",
  ] as const)("accepts category '%s'", (category) => {
    const parsed = TileTemplateSchema.parse({
      key: "k",
      name: "n",
      config: baseConfig,
      category,
    });
    expect(parsed.category).toBe(category);
  });

  it("rejects an unknown category", () => {
    expect(() =>
      TileTemplateSchema.parse({
        key: "k",
        name: "n",
        config: baseConfig,
        category: "nope",
      }),
    ).toThrow(ZodError);
  });

  it.each(["basic", "premium"] as const)("accepts tier '%s'", (tier) => {
    const parsed = TileTemplateSchema.parse({
      key: "k",
      name: "n",
      config: baseConfig,
      tier,
    });
    expect(parsed.tier).toBe(tier);
  });

  it("rejects an unknown tier", () => {
    expect(() =>
      TileTemplateSchema.parse({
        key: "k",
        name: "n",
        config: baseConfig,
        tier: "enterprise",
      }),
    ).toThrow(ZodError);
  });

  it("rejects a template whose nested config fails TileConfigSchema", () => {
    expect(() =>
      TileTemplateSchema.parse({
        key: "k",
        name: "n",
        config: { type: "stat", title: "t" },
      }),
    ).toThrow(ZodError);
  });
});
