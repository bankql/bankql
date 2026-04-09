import { defineDataset, defineField } from "../define.js";

export const sod = defineDataset({
  name: "sod",
  description:
    "FDIC Summary of Deposits — annual branch-level deposit data as of June 30 each year (1994–current).",
  fields: {
    // -------------------------------------------------------------------------
    // Survey key
    // -------------------------------------------------------------------------
    YEAR: defineField({
      type: "integer",
      description: "Year of survey (1994–current). All SOD surveys are annual as of June 30.",
      measure: "temporal",
      format: "date",
    }),
    CERT: defineField({
      type: "integer",
      description: "The certificate number assigned to an institution for deposit insurance.",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "CERT", cardinality: "many:1" },
    }),
    BRNUM: defineField({
      type: "integer",
      description: "Branch Number — numerical reference to identify a branch office within one institution.",
      measure: "nominal",
      format: "id",
    }),
    UNINUMBR: defineField({
      type: "integer",
      description: "Unique number associated with a specific physical branch location — persists across ownership changes.",
      measure: "nominal",
      format: "id",
      relation: { dataset: "locations", field: "UNINUM", cardinality: "many:1" },
    }),

    // -------------------------------------------------------------------------
    // Names
    // -------------------------------------------------------------------------
    NAMEFULL: defineField({
      type: "string",
      description: "Institution name.",
      measure: "nominal",
      format: "text",
    }),
    NAMEBR: defineField({
      type: "string",
      description: "Branch name.",
      measure: "nominal",
      format: "text",
    }),
    NAMEHCR: defineField({
      type: "string",
      description: "The name of the headquarters of the top regulatory bank holding company.",
      measure: "nominal",
      format: "text",
    }),

    // -------------------------------------------------------------------------
    // Institution headquarters location
    // -------------------------------------------------------------------------
    ADDRESS: defineField({
      type: "string",
      description: "The physical address of the main office (headquarters) of the institution.",
      measure: "nominal",
      format: "text",
    }),
    CITY: defineField({
      type: "string",
      description: "The city where the headquarters of the institution is located.",
      measure: "nominal",
      format: "text",
    }),
    STALP: defineField({
      type: "string",
      description: "The state abbreviation of the location of the institution's headquarters.",
      measure: "nominal",
      format: "text",
    }),
    STNAME: defineField({
      type: "string",
      description: "The state name of the location of the institution's headquarters.",
      measure: "nominal",
      format: "text",
    }),
    STCNTY: defineField({
      type: "string",
      description: "The state and county FIPS code associated with the headquarters location.",
      measure: "nominal",
      format: "id",
    }),
    ZIP: defineField({
      type: "string",
      description: "The ZIP code associated with the physical address of the institution's headquarters.",
      measure: "nominal",
      format: "text",
    }),

    // -------------------------------------------------------------------------
    // Branch location
    // -------------------------------------------------------------------------
    ADDRESBR: defineField({
      type: "string",
      description: "Physical location of the branch.",
      measure: "nominal",
      format: "text",
    }),
    CITYBR: defineField({
      type: "string",
      description: "Reported city in which the branch is located.",
      measure: "nominal",
      format: "text",
    }),
    CITY2BR: defineField({
      type: "string",
      description: "Central city based on the reported ZIP code of the branch.",
      measure: "nominal",
      format: "text",
    }),
    CNTYNAMB: defineField({
      type: "string",
      description: "County name in which the branch is located.",
      measure: "nominal",
      format: "text",
    }),
    CNTYNUMB: defineField({
      type: "string",
      description: "County number corresponding to the county in which the branch is located.",
      measure: "nominal",
      format: "id",
    }),
    STALPBR: defineField({
      type: "string",
      description: "The state abbreviation of the location in which the branch is physically located.",
      measure: "nominal",
      format: "text",
    }),
    STNAMEBR: defineField({
      type: "string",
      description: "The state name where branch is physically located.",
      measure: "nominal",
      format: "text",
    }),
    STCNTYBR: defineField({
      type: "string",
      description: "The state and county FIPS code associated with the specific branch location.",
      measure: "nominal",
      format: "id",
    }),
    STNUMBR: defineField({
      type: "integer",
      description: "The FIPS number of the state in which the branch is physically located.",
      measure: "nominal",
      format: "id",
    }),
    ZIPBR: defineField({
      type: "string",
      description: "The ZIP code associated with the physical address of the branch.",
      measure: "nominal",
      format: "text",
    }),
    SIMS_LATITITUDE: defineField({
      type: "float",
      description: "The latitude of the branch's physical location.",
      measure: "quantitative",
      format: "coordinate",
    }),
    SIMS_LONGITUDE: defineField({
      type: "float",
      description: "The longitude of the branch's physical location.",
      measure: "quantitative",
      format: "coordinate",
    }),
    SIMS_ESTABLISHED_DATE: defineField({
      type: "date",
      description: "The date that the branch location was established.",
      measure: "temporal",
      format: "date",
    }),
    SIMS_ACQUIRED_DATE: defineField({
      type: "date",
      description: "The date that a branch was last acquired by another institution.",
      measure: "temporal",
      format: "date",
    }),
    SIMS_DESCRIPTION: defineField({
      type: "string",
      description: "The quality of the match of the branch's physical location to a latitude/longitude.",
      measure: "nominal",
      format: "text",
    }),
    SIMS_PROJECTION: defineField({
      type: "string",
      description: "The method used to arrive at the latitude and longitude of the branch's physical location.",
      measure: "nominal",
      format: "text",
    }),

    // -------------------------------------------------------------------------
    // Branch classification
    // -------------------------------------------------------------------------
    BKMO: defineField({
      type: "integer",
      description: "Main office / branch identifier — main office = 1, branch = 0.",
      measure: "nominal",
      format: "boolean",
    }),
    BRCENM: defineField({
      type: "string",
      description: "Code describing the nature of reported deposits — C=Combined, E=Estimated, N=Non Deposit, M=Main Office.",
      measure: "nominal",
      format: "enum",
      enumValues: ["C", "E", "N", "M"],
    }),
    BRSERTYP: defineField({
      type: "integer",
      description: "Branch service type code.",
      measure: "nominal",
      format: "enum",
      enumValues: ["11", "12", "13", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"],
    }),
    CONSOLD: defineField({
      type: "integer",
      description: "When BRCENM=C (consolidated), the office number (BRNUM) in which deposits are reported.",
      measure: "nominal",
      format: "id",
    }),
    UNIT: defineField({
      type: "integer",
      description: "Flag identifying an institution with only a main office location; no branch locations.",
      measure: "nominal",
      format: "boolean",
    }),

    // -------------------------------------------------------------------------
    // Deposits
    // -------------------------------------------------------------------------
    DEPSUMBR: defineField({
      type: "float",
      description: "Branch office deposits as of June 30.",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
    }),
    DEPSUM: defineField({
      type: "float",
      description: "Total deposits of the institution as of June 30.",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
    }),
    DEPDOM: defineField({
      type: "float",
      description: "Total domestic deposits of the institution as of June 30.",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
    }),
    ESCROW: defineField({
      type: "float",
      description: "Escrow deposits reported on the Thrift Financial Reports.",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
    }),
    INSBRDD: defineField({
      type: "float",
      description: "Demand deposits in insured branches located in Puerto Rico and U.S. Territories.",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
    }),
    INSBRTS: defineField({
      type: "float",
      description: "Time and savings deposits in insured branches located in Puerto Rico and U.S. Territories.",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
    }),

    // -------------------------------------------------------------------------
    // Institution financials
    // -------------------------------------------------------------------------
    ASSET: defineField({
      type: "float",
      description: "Total assets of the institution as of June 30. Repeated for every branch — use once per institution to avoid duplication.",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
    }),

    // -------------------------------------------------------------------------
    // Institution classification
    // -------------------------------------------------------------------------
    BKCLASS: defineField({
      type: "string",
      description: "Institution Class — major groupings based on insuring agent, entity type, charter agent, and Fed membership.",
      measure: "nominal",
      format: "enum",
      enumValues: ["N", "SM", "NM", "SI", "SB", "SL", "SA", "OI", "NC", "NS", "CU"],
    }),
    CLCODE: defineField({
      type: "integer",
      description: "Two-digit numeric code identifying the major and minor categories of an institution.",
      measure: "nominal",
      format: "enum",
    }),
    CHRTAGNN: defineField({
      type: "string",
      description: "The name of the chartering agency of the institution.",
      measure: "nominal",
      format: "enum",
      enumValues: ["OCC", "OTS", "STATE", "SOVER"],
    }),
    CHRTAGNT: defineField({
      type: "string",
      description: "The abbreviation of the chartering agency of the institution.",
      measure: "nominal",
      format: "enum",
      enumValues: ["OCC", "OTS", "STATE", "SOVER"],
    }),
    CHARTER: defineField({
      type: "string",
      description: "Identifies whether an institution is federally or state chartered.",
      measure: "nominal",
      format: "enum",
    }),
    REGAGNT: defineField({
      type: "string",
      description: "The primary regulatory agency of the institution.",
      measure: "nominal",
      format: "enum",
      enumValues: ["FED", "FDIC", "OCC", "OTS", "NCUA", "STATE"],
    }),
    INSAGNT1: defineField({
      type: "string",
      description: "The primary insurer, insurance agent, or insurance status of an institution.",
      measure: "nominal",
      format: "enum",
      enumValues: ["BIF", "DIF", "SAIF", "STATE", "PRIV", "SOVER", "OTHER", "NONE", "NCUA"],
    }),
    INSURED: defineField({
      type: "string",
      description: "Identifies commercial banks (CB), savings institutions (SA), and insured branches of foreign banks (IB).",
      measure: "nominal",
      format: "enum",
      enumValues: ["CB", "SA", "IB"],
    }),
    DENOVO: defineField({
      type: "integer",
      description: "Flag indicating whether an institution is a new institution, not a recharter.",
      measure: "nominal",
      format: "boolean",
    }),
    HCTMULT: defineField({
      type: "string",
      description: "Holding company type — MULT (multi-bank), ONE (one-bank), NONE (not a member).",
      measure: "nominal",
      format: "enum",
      enumValues: ["MULT", "ONE", "NONE"],
    }),
    SPECGRP: defineField({
      type: "integer",
      description: "Asset concentration specialization group.",
      measure: "nominal",
      format: "enum",
    }),
    SPECDESC: defineField({
      type: "string",
      description: "Description of the institution's primary asset specialization.",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    }),
    CALL: defineField({
      type: "integer",
      description: "Prior to 2012, OTS institutions filed a Thrift Financial Report (TFR). All others file the CALL report.",
      measure: "nominal",
      format: "boolean",
    }),
    DOCKET: defineField({
      type: "string",
      description: "Unique identification number assigned to OTS-chartered institutions or FHLB members.",
      measure: "nominal",
      format: "id",
    }),
    USA: defineField({
      type: "integer",
      description: "Flag identifying that the institution is headquartered in the United States.",
      measure: "nominal",
      format: "boolean",
    }),
    CNTRYNA: defineField({
      type: "string",
      description: "The country name where the headquarters of the institution is chartered.",
      measure: "nominal",
      format: "text",
    }),
    CNTRYNAB: defineField({
      type: "string",
      description: "Country name in which the branch is located.",
      measure: "nominal",
      format: "text",
    }),

    // -------------------------------------------------------------------------
    // Regulatory / geographic
    // -------------------------------------------------------------------------
    FDICDBS: defineField({
      type: "integer",
      description: "The number assigned to the FDIC Regional Office that services the institution.",
      measure: "nominal",
      format: "enum",
    }),
    FDICNAME: defineField({
      type: "string",
      description: "The name of the FDIC Regional Office that services the institution.",
      measure: "nominal",
      format: "text",
    }),
    FED: defineField({
      type: "integer",
      description: "The number identifying the Federal Reserve District where the institution is located.",
      measure: "nominal",
      format: "enum",
    }),
    FEDNAME: defineField({
      type: "string",
      description: "The name of the Federal Reserve District where the institution is located.",
      measure: "nominal",
      format: "text",
    }),
    OCCDIST: defineField({
      type: "integer",
      description: "OCC district number in which the institution is located.",
      measure: "nominal",
      format: "enum",
      enumValues: ["01", "03", "04", "05"],
    }),
    OCCNAME: defineField({
      type: "string",
      description: "OCC district name.",
      measure: "nominal",
      format: "text",
    }),
    RSSDHCR: defineField({
      type: "integer",
      description: "The unique FRB number assigned to the top regulatory bank holding company.",
      measure: "nominal",
      format: "id",
    }),
    RSSDID: defineField({
      type: "integer",
      description: "The unique number assigned by the Federal Reserve Board to the institution.",
      measure: "nominal",
      format: "id",
    }),
    STALPHCR: defineField({
      type: "string",
      description: "The state abbreviation of the headquarters of the top regulatory bank holding company.",
      measure: "nominal",
      format: "text",
    }),
    CITYHCR: defineField({
      type: "string",
      description: "The city of the headquarters of the top regulatory bank holding company.",
      measure: "nominal",
      format: "text",
    }),

    // -------------------------------------------------------------------------
    // Metro / statistical areas (branch)
    // -------------------------------------------------------------------------
    MSABR: defineField({
      type: "integer",
      description: "Metropolitan Statistical Area number based on the 2020 Census.",
      measure: "nominal",
      format: "id",
    }),
    MSANAMB: defineField({
      type: "string",
      description: "Metropolitan Statistical Area name in which the branch is physically located.",
      measure: "nominal",
      format: "text",
    }),
    METROBR: defineField({
      type: "integer",
      description: "Indicator for an area containing a core urban area of 50,000 or more population.",
      measure: "nominal",
      format: "boolean",
    }),
    MICROBR: defineField({
      type: "integer",
      description: "Indicator for an area containing an urban core of at least 10,000 but less than 50,000 population.",
      measure: "nominal",
      format: "boolean",
    }),
    CSABR: defineField({
      type: "integer",
      description: "Combined Statistical Area code for the branch.",
      measure: "nominal",
      format: "id",
    }),
    CSANAMBR: defineField({
      type: "string",
      description: "Combined Statistical Area name for the branch.",
      measure: "nominal",
      format: "text",
    }),
    CBSA_DIV_NAMB: defineField({
      type: "string",
      description: "Metropolitan Division name for the branch.",
      measure: "nominal",
      format: "text",
    }),
    DIVISIONB: defineField({
      type: "string",
      description: "Metropolitan Division — county or group of counties within a CBSA with a core population of at least 2.5 million.",
      measure: "nominal",
      format: "text",
    }),
    PLACENUM: defineField({
      type: "integer",
      description: "FIPS MCD (Minor Civil Division) code for the branch.",
      measure: "nominal",
      format: "id",
    }),
    NECTABR: defineField({
      type: "integer",
      description: "Code of the New England City Town Areas based on PLACENUM.",
      measure: "nominal",
      format: "id",
    }),
    NECNAMB: defineField({
      type: "string",
      description: "Name of the New England City Town Areas based on PLACENUM.",
      measure: "nominal",
      format: "text",
    }),
  },
});
