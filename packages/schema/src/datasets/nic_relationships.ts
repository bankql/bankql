import { defineDataset, defineField } from "../define.js";

export const nic_relationships = defineDataset({
  name: "nic_relationships",
  description:
    "Federal Reserve NIC Relationships table — history of ownership and control between entities. Composite primary key: parentRssdId + offspringRssdId + dateStart + relationshipLevel.",
  fields: {
    // -------------------------------------------------------------------------
    // Composite primary key
    // -------------------------------------------------------------------------
    parentRssdId: defineField({
      type: "integer",
      description: "RSSD ID of Parent — entity that owns or controls Offspring.",
      measure: "nominal",
      format: "id",
      relation: { dataset: "nic_attributes", field: "rssdId", cardinality: "many:1" },
      sourceKey: "ID_RSSD_PARENT",
    }),
    offspringRssdId: defineField({
      type: "integer",
      description: "RSSD ID of Offspring — entity that is owned or controlled by Parent.",
      measure: "nominal",
      format: "id",
      relation: { dataset: "nic_attributes", field: "rssdId", cardinality: "many:1" },
      sourceKey: "ID_RSSD_OFFSPRING",
    }),
    dateStart: defineField({
      type: "integer",
      description: "Date Start — first date this relationship row was known to be valid. Format YYYYMMDD.",
      measure: "temporal",
      format: "date",
      sourceKey: "DT_START",
    }),
    relationshipLevel: defineField({
      type: "float",
      description: "Relationship Level (1=Direct, 2=Indirect, 3=2G3, 4=Debt Previously Contracted).",
      measure: "nominal",
      format: "enum",
      enumValues: ["1", "2", "3", "4"],
      sourceKey: "RELN_LVL",
    }),

    // -------------------------------------------------------------------------
    // Date range
    // -------------------------------------------------------------------------
    dateEnd: defineField({
      type: "integer",
      description: "Date End — last date the record was valid. 99991231 = non-terminated. Format YYYYMMDD.",
      measure: "temporal",
      format: "date",
      sourceKey: "DT_END",
    }),
    dateStartTimestamp: defineField({
      type: "datetime",
      description: "Date Start (DB2 datetime format).",
      measure: "temporal",
      format: "datetime",
      sourceKey: "D_DT_START",
    }),
    dateEndTimestamp: defineField({
      type: "datetime",
      description: "Date End (DB2 datetime format).",
      measure: "temporal",
      format: "datetime",
      sourceKey: "D_DT_END",
    }),
    relationshipEstablishedDate: defineField({
      type: "integer",
      description: "Date Relationship was Established — may predate dateStart for pre-regulation relationships. Format YYYYMMDD.",
      measure: "temporal",
      format: "date",
      sourceKey: "DT_RELN_EST",
    }),
    relationshipEstablishedTimestamp: defineField({
      type: "datetime",
      description: "Date Relationship was Established (DB2 datetime format).",
      measure: "temporal",
      format: "datetime",
      sourceKey: "D_DT_RELN_EST",
    }),

    // -------------------------------------------------------------------------
    // Control & regulation
    // -------------------------------------------------------------------------
    controlIndicator: defineField({
      type: "float",
      description: "Control Indicator — whether Parent controls Offspring (0=N/A, 1=Controlled, 2=Non-controlled).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2"],
      sourceKey: "CTRL_IND",
    }),
    regulatedIndicator: defineField({
      type: "float",
      description: "Regulated Indicator — whether the relationship is governed by banking statutes (1=Regulated, 2=Unregulated).",
      measure: "nominal",
      format: "enum",
      enumValues: ["1", "2"],
      sourceKey: "REG_IND",
    }),

    // -------------------------------------------------------------------------
    // Equity / ownership
    // -------------------------------------------------------------------------
    equityIndicator: defineField({
      type: "float",
      description: "Equity Indicator — form of ownership (0=Other basis, 1=Exact % in BHC/bank/FBO, 2=Bracket % in non-banking).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2"],
      sourceKey: "EQUITY_IND",
    }),
    percentEquity: defineField({
      type: "float",
      description: "Percent of Equity Voting Control — Parent's percent ownership or control of Offspring.",
      measure: "quantitative",
      format: "percentage",
      sourceKey: "PCT_EQUITY",
    }),
    percentEquityBracket: defineField({
      type: "string",
      description: "Percent Equity Bracket — derived ownership range (100*, 80-<100, >50-<80, 25-50, <25, 0).",
      measure: "nominal",
      format: "enum",
      enumValues: ["100*", "80 - <100", ">50 - <80", "25 - 50", "< 25", "0"],
      sourceKey: "PCT_EQUITY_BRACKET",
    }),
    percentEquityFormat: defineField({
      type: "string",
      description: "Percent Equity Format — text description of how percent is reported (Other, Exact, Bracket).",
      measure: "nominal",
      format: "enum",
      enumValues: ["Other", "Exact", "Bracket"],
      sourceKey: "PCT_EQUITY_FORMAT",
    }),
    percentOther: defineField({
      type: "float",
      description: "Percent of Other Voting Control — exact percent when basis is non-voting equity or merchant banking investment.",
      measure: "quantitative",
      format: "percentage",
      sourceKey: "PCT_OTHER",
    }),
    otherBasisIndicator: defineField({
      type: "float",
      description: "Other Basis for Relationship Indicator (0=None, 1=Management contract/board control, 2=Non-voting equity, 3=Merchant banking, 4=Subordinated debt, etc.).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
      sourceKey: "OTHER_BASIS_IND",
    }),
    financialConsolidationIndicator: defineField({
      type: "float",
      description: "Financial Consolidation Indicator — whether the company is consolidated in the reporter's financial statements (0=N/A, 1=Yes, 2=No).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2"],
      sourceKey: "FC_IND",
    }),
    merchantBankingCost: defineField({
      type: "float",
      description: "Merchant Banking / Insurance Company Investment — dollar amount (in millions) of FHC investments under merchant banking or insurance authority.",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (millions)",
      sourceKey: "MB_COST",
    }),
    regulationKInvestment: defineField({
      type: "float",
      description: "Regulation K Subpart A Investment (0=N/A, 1=Portfolio Investment, 2=Joint Venture, 3=Subsidiary).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2", "3"],
      sourceKey: "REGK_INV",
    }),

    // -------------------------------------------------------------------------
    // Row lifecycle
    // -------------------------------------------------------------------------
    reasonRowCreated: defineField({
      type: "float",
      description: "Reason for Creation of the Relationship row (1=Initial, 2=Equity change, 3=Reestablishment, 4=Basis change, 5=Control change, 6=Reg change, 8=Other).",
      measure: "nominal",
      format: "enum",
      enumValues: ["1", "2", "3", "4", "5", "6", "7", "8"],
      sourceKey: "REASON_ROW_CRTD",
    }),
    reasonTerminated: defineField({
      type: "float",
      description: "Reason for Termination of the Relationship (0=Ongoing, 1=Terminated no remaining basis, 2=Parent sold/transferred, 3=Offspring liquidated/merged, 4=Below threshold, 5=Parent ceased, 6=Regulatory criteria change).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2", "3", "4", "5", "6"],
      sourceKey: "REASON_TERM_RELN",
    }),
  },
});
