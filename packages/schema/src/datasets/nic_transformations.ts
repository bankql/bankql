import { defineDataset, defineField } from "../define.js";

export const nic_transformations = defineDataset({
  name: "nic_transformations",
  description:
    "Federal Reserve NIC Transformations table — mergers, failures, charter discontinuations, splits, and asset sales. Composite primary key: ID_RSSD_PREDECESSOR + ID_RSSD_SUCCESSOR + DT_TRANS.",
  fields: {
    // -------------------------------------------------------------------------
    // Composite primary key
    // -------------------------------------------------------------------------
    ID_RSSD_PREDECESSOR: defineField({
      type: "integer",
      description: "RSSD ID of Predecessor — the entity that was transformed (the non-survivor in a merger).",
      measure: "nominal",
      format: "id",
      relation: { dataset: "nic_attributes", field: "ID_RSSD", cardinality: "many:1" },
    }),
    ID_RSSD_SUCCESSOR: defineField({
      type: "integer",
      description: "RSSD ID of Successor — the entity that continues or comes into existence as a result of the transformation (the survivor in a merger).",
      measure: "nominal",
      format: "id",
      relation: { dataset: "nic_attributes", field: "ID_RSSD", cardinality: "many:1" },
    }),
    DT_TRANS: defineField({
      type: "integer",
      description: "Date of Transformation — date on which the transformation became effective. Format YYYYMMDD.",
      measure: "temporal",
      format: "date",
    }),
    D_DT_TRANS: defineField({
      type: "datetime",
      description: "Date of Transformation (DB2 datetime format).",
      measure: "temporal",
      format: "datetime",
    }),

    // -------------------------------------------------------------------------
    // Transformation details
    // -------------------------------------------------------------------------
    TRNSFM_CD: defineField({
      type: "float",
      description: "Transformation Type Code — describes the event causing the transformation.",
      measure: "nominal",
      format: "enum",
      enumValues: ["1", "5", "7", "9", "50"],
    }),
    ACCT_METHOD: defineField({
      type: "float",
      description: "Accounting Method — method used in resolving a non-failure merger (0=N/A, 1=Pooling of interests, 2=Purchase/Acquisition).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2"],
    }),
  },
});
