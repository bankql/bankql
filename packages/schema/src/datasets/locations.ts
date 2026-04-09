import { defineDataset, defineField } from "../define.js";

export const locations = defineDataset({
  name: "locations",
  description:
    "FDIC branch office locations for all insured institutions.",
  index: "UNINUM",
  fields: {
    // -------------------------------------------------------------------------
    // Identity
    // -------------------------------------------------------------------------
    UNINUM: defineField({
      type: "integer",
      description: "Unique Identification Number for a Branch Office as assigned by the FDIC.",
      measure: "nominal",
      format: "id",
    }),
    CERT: defineField({
      type: "integer",
      description: "Institution FDIC Certificate #",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "CERT", cardinality: "many:1" },
    }),
    FI_UNINUM: defineField({
      type: "integer",
      description: "FDIC UNINUM of the Owner Institution — updated with every merger or purchase to reflect the most current owner.",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "UNINUM", cardinality: "many:1" },
    }),
    OFFNUM: defineField({
      type: "integer",
      description: "Branch Number — the branch's corresponding office number.",
      measure: "nominal",
      format: "id",
    }),
    MAINOFF: defineField({
      type: "integer",
      description: "Main Office — flag identifying the main office for the institution.",
      measure: "nominal",
      format: "boolean",
    }),

    // -------------------------------------------------------------------------
    // Names
    // -------------------------------------------------------------------------
    NAME: defineField({
      type: "string",
      description: "Institution Name — legal name of the FDIC insured institution.",
      measure: "nominal",
      format: "text",
    }),
    OFFNAME: defineField({
      type: "string",
      description: "Office Name — name of the branch.",
      measure: "nominal",
      format: "text",
    }),

    // -------------------------------------------------------------------------
    // Location
    // -------------------------------------------------------------------------
    ADDRESS: defineField({
      type: "string",
      description: "Branch Address — street address at which the branch is physically located.",
      measure: "nominal",
      format: "text",
    }),
    CITY: defineField({
      type: "string",
      description: "Branch City — city in which the branch is physically located.",
      measure: "nominal",
      format: "text",
    }),
    COUNTY: defineField({
      type: "string",
      description: "Branch County — county where the branch is physically located.",
      measure: "nominal",
      format: "text",
    }),
    STNAME: defineField({
      type: "string",
      description: "Branch State",
      measure: "nominal",
      format: "text",
    }),
    STALP: defineField({
      type: "string",
      description: "Branch State Abbreviation",
      measure: "nominal",
      format: "text",
    }),
    STCNTY: defineField({
      type: "string",
      description: "State and County Number — five digit FIPS state/county code.",
      measure: "nominal",
      format: "id",
    }),
    ZIP: defineField({
      type: "string",
      description: "Branch Zip Code",
      measure: "nominal",
      format: "text",
    }),

    // -------------------------------------------------------------------------
    // Classification
    // -------------------------------------------------------------------------
    BKCLASS: defineField({
      type: "string",
      description: "Institution Class — charter type, charter agent, Fed membership, and primary federal regulator.",
      measure: "nominal",
      format: "enum",
      enumValues: ["N", "NM", "OI", "SA", "SB", "SM"],
    }),
    SERVTYPE: defineField({
      type: "integer",
      description: "Service Type Code — type of office.",
      measure: "nominal",
      format: "enum",
      enumValues: [
        "11", "12", "13", "14", "15", "16",
        "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
      ],
    }),

    // -------------------------------------------------------------------------
    // Geographic context
    // -------------------------------------------------------------------------
    CBSA: defineField({
      type: "string",
      description: "Core Based Statistical Area Name (Branch)",
      measure: "nominal",
      format: "text",
    }),
    CBSA_NO: defineField({
      type: "integer",
      description: "Core Based Statistical Areas (Branch) — numeric CBSA code.",
      measure: "nominal",
      format: "id",
    }),
    CBSA_DIV: defineField({
      type: "string",
      description: "Metropolitan Divisions Name (Branch)",
      measure: "nominal",
      format: "text",
    }),
    CBSA_DIV_FLG: defineField({
      type: "integer",
      description: "Metropolitan Divisions Flag (Branch)",
      measure: "nominal",
      format: "boolean",
    }),
    CBSA_DIV_NO: defineField({
      type: "integer",
      description: "Metropolitan Divisions Number (Branch)",
      measure: "nominal",
      format: "id",
    }),
    CBSA_METRO: defineField({
      type: "integer",
      description: "Metropolitan Division Number (Branch)",
      measure: "nominal",
      format: "id",
    }),
    CBSA_METRO_FLG: defineField({
      type: "integer",
      description: "Metropolitan Division Flag (Branch)",
      measure: "nominal",
      format: "boolean",
    }),
    CBSA_METRO_NAME: defineField({
      type: "string",
      description: "Metropolitan Division Name (Branch)",
      measure: "nominal",
      format: "text",
    }),
    CBSA_MICRO_FLG: defineField({
      type: "integer",
      description: "Micropolitan Division Flag (Branch)",
      measure: "nominal",
      format: "boolean",
    }),
    CSA: defineField({
      type: "string",
      description: "Combined Statistical Area Name (Branch)",
      measure: "nominal",
      format: "text",
    }),
    CSA_FLG: defineField({
      type: "integer",
      description: "Combined Statistical Area Flag (Branch)",
      measure: "nominal",
      format: "boolean",
    }),
    CSA_NO: defineField({
      type: "integer",
      description: "Combined Statistical Area Number (Branch)",
      measure: "nominal",
      format: "id",
    }),

    // -------------------------------------------------------------------------
    // Dates
    // -------------------------------------------------------------------------
    ESTYMD: defineField({
      type: "date",
      description: "Branch Established Date — date on which the branch began operations.",
      measure: "temporal",
      format: "date",
    }),
    RUNDATE: defineField({
      type: "date",
      description: "Run Date — day the institution information was updated.",
      measure: "temporal",
      format: "date",
    }),
  },
});
