/**
 * Relation graph extraction from dataset definitions.
 *
 * Walks all datasets and builds a list of edges representing
 * foreign-key relationships between datasets.
 */

import type { DatasetDef, FieldDef, Cardinality } from "./types.js";

/** A single edge in the relation graph. */
export interface RelationEdge {
  from: { dataset: string; field: string };
  to: { dataset: string; field: string };
  cardinality: Cardinality;
}

/**
 * Extract all relation edges from a set of datasets.
 *
 * Returns a flat list of directed edges. Each edge represents one
 * field's `relation` declaration.
 */
export function getRelations(datasets: DatasetDef[]): RelationEdge[] {
  const edges: RelationEdge[] = [];

  for (const ds of datasets) {
    for (const [fieldName, field] of Object.entries(ds.fields)) {
      const f = field as FieldDef;
      if (f.relation) {
        edges.push({
          from: { dataset: ds.name, field: fieldName },
          to: { dataset: f.relation.dataset, field: f.relation.field },
          cardinality: f.relation.cardinality,
        });
      }
    }
  }

  return edges;
}
