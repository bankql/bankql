import { defineDataset, defineField } from "../define.js";

export const nic_transformations = defineDataset({
  name: "nic_transformations",
  description:
    "Federal Reserve NIC Transformations table — mergers, failures, charter discontinuations, splits, and asset sales. Composite primary key: predecessorRssdId + successorRssdId + transformationDate.",
  fields: {
    // -------------------------------------------------------------------------
    // Composite primary key
    // -------------------------------------------------------------------------
    predecessorRssdId: defineField({
      type: "integer",
      label: "Predecessor RSSD ID",
      description: "RSSD ID of Predecessor — the entity that was transformed (the non-survivor in a merger).",
      measure: "nominal",
      format: "id",
      relation: { dataset: "nic_attributes", field: "rssdId", cardinality: "many:1" },
      sourceKey: "ID_RSSD_PREDECESSOR",
    }),
    successorRssdId: defineField({
      type: "integer",
      label: "Successor RSSD ID",
      description: "RSSD ID of Successor — the entity that continues or comes into existence as a result of the transformation (the survivor in a merger).",
      measure: "nominal",
      format: "id",
      relation: { dataset: "nic_attributes", field: "rssdId", cardinality: "many:1" },
      sourceKey: "ID_RSSD_SUCCESSOR",
    }),
    transformationDate: defineField({
      type: "integer",
      label: "Transformation Date (YYYYMMDD)",
      description: "Date of Transformation — date on which the transformation became effective. Format YYYYMMDD.",
      measure: "temporal",
      format: "date",
      sourceKey: "DT_TRANS",
    }),
    transformationTimestamp: defineField({
      type: "datetime",
      label: "Transformation Date (DB2 Timestamp)",
      description: "Date of Transformation (DB2 datetime format).",
      measure: "temporal",
      format: "datetime",
      sourceKey: "D_DT_TRANS",
    }),

    // -------------------------------------------------------------------------
    // Transformation details
    // -------------------------------------------------------------------------
    transformationCode: defineField({
      type: "float",
      label: "Transformation Type Code",
      description: "Transformation Type Code — describes the event causing the transformation.",
      measure: "nominal",
      format: "enum",
      enumValues: ["1", "5", "7", "9", "50"],
      sourceKey: "TRNSFM_CD",
    }),
    accountingMethod: defineField({
      type: "float",
      label: "Accounting Method",
      description: "Accounting Method — method used in resolving a non-failure merger (0=N/A, 1=Pooling of interests, 2=Purchase/Acquisition).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2"],
      sourceKey: "ACCT_METHOD",
    }),
  },
});
