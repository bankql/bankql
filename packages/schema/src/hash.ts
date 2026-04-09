/**
 * Schema hashing for drift detection.
 *
 * Produces a deterministic SHA-256 fingerprint of a DatasetDef's structure.
 * Only structural fields are included — changes to descriptions, units,
 * activityType, or blobPath do not affect the hash.
 *
 * Fields included in the hash:
 *   dataset: name, index
 *   per field: type, measure, format, enumValues, relation
 *
 * Usage:
 *   const { hash, short } = hashDataset(institutions);
 *   // hash  → full 64-char hex SHA-256
 *   // short → first 8 chars, suitable for display / filenames
 */

import { createHash } from "node:crypto";
import type { DatasetDef, FieldDef } from "./types.js";

interface FieldFingerprint {
  type: string;
  measure?: string;
  format?: string;
  enumValues?: string[];
  relation?: { dataset: string; field: string; cardinality: string };
}

interface DatasetFingerprint {
  name: string;
  index?: string;
  fields: Record<string, FieldFingerprint>;
}

/** Build a deterministic, documentation-free fingerprint of a DatasetDef. */
function fingerprint(dataset: DatasetDef): DatasetFingerprint {
  const fields: Record<string, FieldFingerprint> = {};

  for (const key of Object.keys(dataset.fields).sort()) {
    const f = dataset.fields[key] as FieldDef;
    const entry: FieldFingerprint = { type: f.type };
    if (f.measure !== undefined) entry.measure = f.measure;
    if (f.format !== undefined) entry.format = f.format;
    if (f.enumValues !== undefined) entry.enumValues = [...f.enumValues].sort();
    if (f.relation !== undefined) {
      entry.relation = {
        dataset: f.relation.dataset,
        field: f.relation.field,
        cardinality: f.relation.cardinality,
      };
    }
    fields[key] = entry;
  }

  return {
    name: dataset.name,
    ...(dataset.index !== undefined && { index: dataset.index }),
    fields,
  };
}

export interface SchemaHash {
  /** Full 64-character SHA-256 hex digest. */
  hash: string;
  /** First 8 characters — suitable for filenames, logs, and display. */
  short: string;
}

/** Compute the structural hash of a single DatasetDef. */
export function hashDataset(dataset: DatasetDef): SchemaHash {
  const fp = fingerprint(dataset);
  const json = JSON.stringify(fp);
  const hash = createHash("sha256").update(json).digest("hex");
  return { hash, short: hash.slice(0, 8) };
}

/** Compute hashes for multiple datasets, keyed by dataset name. */
export function hashDatasets(
  datasets: DatasetDef[],
): Record<string, SchemaHash> {
  return Object.fromEntries(
    datasets.map((ds) => [ds.name, hashDataset(ds)]),
  );
}

/**
 * Assert that a dataset matches an expected hash.
 * Throws if the hash has changed — useful in tests or startup checks
 * to catch accidental schema drift.
 *
 * @example
 *   assertDatasetHash(institutions, "a3f2c1b0");
 */
export function assertDatasetHash(
  dataset: DatasetDef,
  expectedShort: string,
): void {
  const { short, hash } = hashDataset(dataset);
  if (short !== expectedShort) {
    throw new Error(
      `Schema drift detected for dataset "${dataset.name}": ` +
        `expected hash "${expectedShort}", got "${short}" (full: ${hash}). ` +
        `Update the expected hash or roll back the schema change.`,
    );
  }
}
