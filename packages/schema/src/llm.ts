/**
 * LLM-ready context generation from rich dataset definitions.
 *
 * Converts DatasetDef objects into structured descriptions suitable for
 * inclusion in LLM system prompts or tool descriptions.
 */

import type { DatasetDef, FieldDef } from "./types.js";

/** LLM-friendly description of a single field. */
export interface LLMFieldDescription {
  name: string;
  type: string;
  description?: string;
  unit?: string;
  enumValues?: string[];
}

/** LLM-friendly description of a dataset. */
export interface LLMDatasetDescription {
  name: string;
  description?: string;
  fields: LLMFieldDescription[];
  relations: Array<{
    field: string;
    targetDataset: string;
    targetField: string;
    cardinality: string;
  }>;
}

/** Convert a DatasetDef into a structured LLM-friendly description. */
export function toLLMDescription(dataset: DatasetDef): LLMDatasetDescription {
  const fields: LLMFieldDescription[] = [];
  const relations: LLMDatasetDescription["relations"] = [];

  for (const [name, field] of Object.entries(dataset.fields)) {
    const f = field as FieldDef;
    fields.push({
      name,
      type: f.type,
      ...(f.description && { description: f.description }),
      ...(f.unit && { unit: f.unit }),
      ...(f.enumValues && { enumValues: f.enumValues }),
    });

    if (f.relation) {
      relations.push({
        field: name,
        targetDataset: f.relation.dataset,
        targetField: f.relation.field,
        cardinality: f.relation.cardinality,
      });
    }
  }

  return {
    name: dataset.name,
    ...(dataset.description && { description: dataset.description }),
    fields,
    relations,
  };
}

/**
 * Generate a markdown-formatted system prompt section describing all datasets.
 *
 * Useful for providing an LLM with full context about the data model.
 */
export function toLLMSystemPrompt(datasets: DatasetDef[]): string {
  const sections = datasets.map((ds) => {
    const desc = toLLMDescription(ds);
    const lines: string[] = [];

    lines.push(`### ${desc.name}`);
    if (desc.description) lines.push(desc.description);
    lines.push("");
    lines.push("| Column | Type | Description |");
    lines.push("|--------|------|-------------|");

    for (const f of desc.fields) {
      const parts: string[] = [];
      if (f.description) parts.push(f.description);
      if (f.unit) parts.push(`(${f.unit})`);
      if (f.enumValues) parts.push(`Values: ${f.enumValues.join(", ")}`);
      lines.push(`| ${f.name} | ${f.type} | ${parts.join(" ")} |`);
    }

    if (desc.relations.length > 0) {
      lines.push("");
      lines.push("**Relations:**");
      for (const r of desc.relations) {
        lines.push(
          `- \`${r.field}\` → \`${r.targetDataset}.${r.targetField}\` (${r.cardinality})`,
        );
      }
    }

    return lines.join("\n");
  });

  return `## Data Model\n\n${sections.join("\n\n---\n\n")}`;
}
