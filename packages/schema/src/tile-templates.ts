import { z } from "zod";
import { TileConfigSchema } from "./tiles.js";

export const TileTemplateSchema = z.object({
  key: z.string(),
  name: z.string(),
  config: TileConfigSchema,
  builtIn: z.boolean().default(false),
  rssdId: z.number().nullable().default(null),
  helpText: z.string().optional(),
  category: z
    .enum([
      "enrollment",
      "payments",
      "ttp",
      "invoices",
      "referrals",
      "saas",
      "capital-accounts",
      "active-features",
    ])
    .optional(),
  tier: z.enum(["basic", "premium"]).default("basic"),
});

export type TileTemplate = z.infer<typeof TileTemplateSchema>;
