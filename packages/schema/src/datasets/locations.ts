import { defineDataset, defineField } from "../define.js";

export const locations = defineDataset({
  name: "locations",
  description:
    "FDIC branch office locations for all insured institutions.",
  index: "uninum",
  fields: {
    // -------------------------------------------------------------------------
    // Identity
    // -------------------------------------------------------------------------
    uninum: defineField({
      type: "integer",
      description: "Unique Identification Number for a Branch Office as assigned by the FDIC.",
      measure: "nominal",
      format: "id",
      sourceKey: "UNINUM",
    }),
    certificate: defineField({
      type: "integer",
      description: "Institution FDIC Certificate #",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "certificate", cardinality: "many:1" },
      sourceKey: "CERT",
    }),
    institutionUninum: defineField({
      type: "integer",
      description: "FDIC UNINUM of the Owner Institution — updated with every merger or purchase to reflect the most current owner.",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "uninum", cardinality: "many:1" },
      sourceKey: "FI_UNINUM",
    }),
    officeNumber: defineField({
      type: "integer",
      description: "Branch Number — the branch's corresponding office number.",
      measure: "nominal",
      format: "id",
      sourceKey: "OFFNUM",
    }),
    mainOffice: defineField({
      type: "integer",
      description: "Main Office — flag identifying the main office for the institution.",
      measure: "nominal",
      format: "boolean",
      sourceKey: "MAINOFF",
    }),

    // -------------------------------------------------------------------------
    // Names
    // -------------------------------------------------------------------------
    institutionName: defineField({
      type: "string",
      description: "Institution Name — legal name of the FDIC insured institution.",
      measure: "nominal",
      format: "text",
      sourceKey: "NAME",
    }),
    officeName: defineField({
      type: "string",
      description: "Office Name — name of the branch.",
      measure: "nominal",
      format: "text",
      sourceKey: "OFFNAME",
    }),

    // -------------------------------------------------------------------------
    // Location
    // -------------------------------------------------------------------------
    address: defineField({
      type: "string",
      description: "Branch Address — street address at which the branch is physically located.",
      measure: "nominal",
      format: "text",
      sourceKey: "ADDRESS",
    }),
    city: defineField({
      type: "string",
      description: "Branch City — city in which the branch is physically located.",
      measure: "nominal",
      format: "text",
      sourceKey: "CITY",
    }),
    county: defineField({
      type: "string",
      description: "Branch County — county where the branch is physically located.",
      measure: "nominal",
      format: "text",
      sourceKey: "COUNTY",
    }),
    stateName: defineField({
      type: "string",
      description: "Branch State",
      measure: "nominal",
      format: "text",
      sourceKey: "STNAME",
    }),
    stateAbbreviation: defineField({
      type: "string",
      description: "Branch State Abbreviation",
      measure: "nominal",
      format: "text",
      sourceKey: "STALP",
    }),
    stateCountyCode: defineField({
      type: "string",
      description: "State and County Number — five digit FIPS state/county code.",
      measure: "nominal",
      format: "id",
      sourceKey: "STCNTY",
    }),
    zip: defineField({
      type: "string",
      description: "Branch Zip Code",
      measure: "nominal",
      format: "text",
      sourceKey: "ZIP",
    }),

    // -------------------------------------------------------------------------
    // Classification
    // -------------------------------------------------------------------------
    institutionClass: defineField({
      type: "string",
      description: "Institution Class — charter type, charter agent, Fed membership, and primary federal regulator.",
      measure: "nominal",
      format: "enum",
      enumValues: ["N", "NM", "OI", "SA", "SB", "SM"],
      sourceKey: "BKCLASS",
    }),
    serviceType: defineField({
      type: "integer",
      description: "Service Type Code — type of office.",
      measure: "nominal",
      format: "enum",
      enumValues: [
        "11", "12", "13", "14", "15", "16",
        "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
      ],
      sourceKey: "SERVTYPE",
    }),

    // -------------------------------------------------------------------------
    // Geographic context
    // -------------------------------------------------------------------------
    cbsaName: defineField({
      type: "string",
      description: "Core Based Statistical Area Name (Branch)",
      measure: "nominal",
      format: "text",
      sourceKey: "CBSA",
    }),
    cbsaNumber: defineField({
      type: "integer",
      description: "Core Based Statistical Areas (Branch) — numeric CBSA code.",
      measure: "nominal",
      format: "id",
      sourceKey: "CBSA_NO",
    }),
    cbsaDivisionName: defineField({
      type: "string",
      description: "Metropolitan Divisions Name (Branch)",
      measure: "nominal",
      format: "text",
      sourceKey: "CBSA_DIV",
    }),
    cbsaDivisionMember: defineField({
      type: "integer",
      description: "Metropolitan Divisions Flag (Branch)",
      measure: "nominal",
      format: "boolean",
      sourceKey: "CBSA_DIV_FLG",
    }),
    cbsaDivisionNumber: defineField({
      type: "integer",
      description: "Metropolitan Divisions Number (Branch)",
      measure: "nominal",
      format: "id",
      sourceKey: "CBSA_DIV_NO",
    }),
    cbsaMetroNumber: defineField({
      type: "integer",
      description: "Metropolitan Division Number (Branch)",
      measure: "nominal",
      format: "id",
      sourceKey: "CBSA_METRO",
    }),
    cbsaMetroMember: defineField({
      type: "integer",
      description: "Metropolitan Division Flag (Branch)",
      measure: "nominal",
      format: "boolean",
      sourceKey: "CBSA_METRO_FLG",
    }),
    cbsaMetroName: defineField({
      type: "string",
      description: "Metropolitan Division Name (Branch)",
      measure: "nominal",
      format: "text",
      sourceKey: "CBSA_METRO_NAME",
    }),
    cbsaMicroMember: defineField({
      type: "integer",
      description: "Micropolitan Division Flag (Branch)",
      measure: "nominal",
      format: "boolean",
      sourceKey: "CBSA_MICRO_FLG",
    }),
    csaName: defineField({
      type: "string",
      description: "Combined Statistical Area Name (Branch)",
      measure: "nominal",
      format: "text",
      sourceKey: "CSA",
    }),
    csaMember: defineField({
      type: "integer",
      description: "Combined Statistical Area Flag (Branch)",
      measure: "nominal",
      format: "boolean",
      sourceKey: "CSA_FLG",
    }),
    csaNumber: defineField({
      type: "integer",
      description: "Combined Statistical Area Number (Branch)",
      measure: "nominal",
      format: "id",
      sourceKey: "CSA_NO",
    }),

    // -------------------------------------------------------------------------
    // Dates
    // -------------------------------------------------------------------------
    establishedDate: defineField({
      type: "date",
      description: "Branch Established Date — date on which the branch began operations.",
      measure: "temporal",
      format: "date",
      sourceKey: "ESTYMD",
    }),
    runDate: defineField({
      type: "date",
      description: "Run Date — day the institution information was updated.",
      measure: "temporal",
      format: "date",
      sourceKey: "RUNDATE",
    }),
  },
});
