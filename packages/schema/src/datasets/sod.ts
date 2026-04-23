import { defineDataset, defineField } from "../define.js";

export const sod = defineDataset({
  name: "sod",
  description:
    "FDIC Summary of Deposits — annual branch-level deposit data as of June 30 each year (1994–current).",
  fields: {
    // -------------------------------------------------------------------------
    // Survey key
    // -------------------------------------------------------------------------
    year: defineField({
      type: "integer",
      description: "Year of survey (1994–current). All SOD surveys are annual as of June 30.",
      measure: "temporal",
      format: "date",
      sourceKey: "YEAR",
    }),
    certificate: defineField({
      type: "integer",
      description: "The certificate number assigned to an institution for deposit insurance.",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "certificate", cardinality: "many:1" },
      sourceKey: "CERT",
    }),
    branchNumber: defineField({
      type: "integer",
      description: "Branch Number — numerical reference to identify a branch office within one institution.",
      measure: "nominal",
      format: "id",
      sourceKey: "BRNUM",
    }),
    uninum: defineField({
      type: "integer",
      description: "Unique number associated with a specific physical branch location — persists across ownership changes.",
      measure: "nominal",
      format: "id",
      relation: { dataset: "locations", field: "uninum", cardinality: "many:1" },
      sourceKey: "UNINUMBR",
    }),

    // -------------------------------------------------------------------------
    // Names
    // -------------------------------------------------------------------------
    institutionName: defineField({
      type: "string",
      description: "Institution name.",
      measure: "nominal",
      format: "text",
      sourceKey: "NAMEFULL",
    }),
    branchName: defineField({
      type: "string",
      description: "Branch name.",
      measure: "nominal",
      format: "text",
      sourceKey: "NAMEBR",
    }),
    holdingCompanyName: defineField({
      type: "string",
      description: "The name of the headquarters of the top regulatory bank holding company.",
      measure: "nominal",
      format: "text",
      sourceKey: "NAMEHCR",
    }),

    // -------------------------------------------------------------------------
    // Institution headquarters location
    // -------------------------------------------------------------------------
    address: defineField({
      type: "string",
      description: "The physical address of the main office (headquarters) of the institution.",
      measure: "nominal",
      format: "text",
      sourceKey: "ADDRESS",
    }),
    city: defineField({
      type: "string",
      description: "The city where the headquarters of the institution is located.",
      measure: "nominal",
      format: "text",
      sourceKey: "CITY",
    }),
    stateAbbreviation: defineField({
      type: "string",
      description: "The state abbreviation of the location of the institution's headquarters.",
      measure: "nominal",
      format: "text",
      sourceKey: "STALP",
    }),
    stateName: defineField({
      type: "string",
      description: "The state name of the location of the institution's headquarters.",
      measure: "nominal",
      format: "text",
      sourceKey: "STNAME",
    }),
    stateCountyCode: defineField({
      type: "string",
      description: "The state and county FIPS code associated with the headquarters location.",
      measure: "nominal",
      format: "id",
      sourceKey: "STCNTY",
    }),
    zip: defineField({
      type: "string",
      description: "The ZIP code associated with the physical address of the institution's headquarters.",
      measure: "nominal",
      format: "text",
      sourceKey: "ZIP",
    }),

    // -------------------------------------------------------------------------
    // Branch location
    // -------------------------------------------------------------------------
    branchAddress: defineField({
      type: "string",
      description: "Physical location of the branch.",
      measure: "nominal",
      format: "text",
      sourceKey: "ADDRESBR",
    }),
    branchCity: defineField({
      type: "string",
      description: "Reported city in which the branch is located.",
      measure: "nominal",
      format: "text",
      sourceKey: "CITYBR",
    }),
    branchCity2: defineField({
      type: "string",
      description: "Central city based on the reported ZIP code of the branch.",
      measure: "nominal",
      format: "text",
      sourceKey: "CITY2BR",
    }),
    branchCountyName: defineField({
      type: "string",
      description: "County name in which the branch is located.",
      measure: "nominal",
      format: "text",
      sourceKey: "CNTYNAMB",
    }),
    branchCountyNumber: defineField({
      type: "string",
      description: "County number corresponding to the county in which the branch is located.",
      measure: "nominal",
      format: "id",
      sourceKey: "CNTYNUMB",
    }),
    branchStateAbbreviation: defineField({
      type: "string",
      description: "The state abbreviation of the location in which the branch is physically located.",
      measure: "nominal",
      format: "text",
      sourceKey: "STALPBR",
    }),
    branchStateName: defineField({
      type: "string",
      description: "The state name where branch is physically located.",
      measure: "nominal",
      format: "text",
      sourceKey: "STNAMEBR",
    }),
    branchStateCountyCode: defineField({
      type: "string",
      description: "The state and county FIPS code associated with the specific branch location.",
      measure: "nominal",
      format: "id",
      sourceKey: "STCNTYBR",
    }),
    branchStateNumber: defineField({
      type: "integer",
      description: "The FIPS number of the state in which the branch is physically located.",
      measure: "nominal",
      format: "id",
      sourceKey: "STNUMBR",
    }),
    branchZip: defineField({
      type: "string",
      description: "The ZIP code associated with the physical address of the branch.",
      measure: "nominal",
      format: "text",
      sourceKey: "ZIPBR",
    }),
    branchLatitude: defineField({
      type: "float",
      description: "The latitude of the branch's physical location.",
      measure: "quantitative",
      format: "coordinate",
      sourceKey: "SIMS_LATITITUDE",
    }),
    branchLongitude: defineField({
      type: "float",
      description: "The longitude of the branch's physical location.",
      measure: "quantitative",
      format: "coordinate",
      sourceKey: "SIMS_LONGITUDE",
    }),
    branchEstablishedDate: defineField({
      type: "date",
      description: "The date that the branch location was established.",
      measure: "temporal",
      format: "date",
      sourceKey: "SIMS_ESTABLISHED_DATE",
    }),
    branchAcquiredDate: defineField({
      type: "date",
      description: "The date that a branch was last acquired by another institution.",
      measure: "temporal",
      format: "date",
      sourceKey: "SIMS_ACQUIRED_DATE",
    }),
    branchLocationMatchQuality: defineField({
      type: "string",
      description: "The quality of the match of the branch's physical location to a latitude/longitude.",
      measure: "nominal",
      format: "text",
      sourceKey: "SIMS_DESCRIPTION",
    }),
    branchLocationMethod: defineField({
      type: "string",
      description: "The method used to arrive at the latitude and longitude of the branch's physical location.",
      measure: "nominal",
      format: "text",
      sourceKey: "SIMS_PROJECTION",
    }),

    // -------------------------------------------------------------------------
    // Branch classification
    // -------------------------------------------------------------------------
    mainOffice: defineField({
      type: "integer",
      description: "Main office / branch identifier — main office = 1, branch = 0.",
      measure: "nominal",
      format: "boolean",
      sourceKey: "BKMO",
    }),
    depositReportingType: defineField({
      type: "string",
      description: "Code describing the nature of reported deposits — C=Combined, E=Estimated, N=Non Deposit, M=Main Office.",
      measure: "nominal",
      format: "enum",
      enumValues: ["C", "E", "N", "M"],
      sourceKey: "BRCENM",
    }),
    branchServiceType: defineField({
      type: "integer",
      description: "Branch service type code.",
      measure: "nominal",
      format: "enum",
      enumValues: ["11", "12", "13", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"],
      sourceKey: "BRSERTYP",
    }),
    consolidatedOfficeNumber: defineField({
      type: "integer",
      description: "When BRCENM=C (consolidated), the office number (BRNUM) in which deposits are reported.",
      measure: "nominal",
      format: "id",
      sourceKey: "CONSOLD",
    }),
    mainOfficeOnly: defineField({
      type: "integer",
      description: "Flag identifying an institution with only a main office location; no branch locations.",
      measure: "nominal",
      format: "boolean",
      sourceKey: "UNIT",
    }),

    // -------------------------------------------------------------------------
    // Deposits
    // -------------------------------------------------------------------------
    branchDeposits: defineField({
      type: "float",
      description: "Branch office deposits as of June 30.",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
      sourceKey: "DEPSUMBR",
    }),
    totalDeposits: defineField({
      type: "float",
      description: "Total deposits of the institution as of June 30.",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
      sourceKey: "DEPSUM",
    }),
    domesticDeposits: defineField({
      type: "float",
      description: "Total domestic deposits of the institution as of June 30.",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
      sourceKey: "DEPDOM",
    }),
    escrowDeposits: defineField({
      type: "float",
      description: "Escrow deposits reported on the Thrift Financial Reports.",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
      sourceKey: "ESCROW",
    }),
    territoryDemandDeposits: defineField({
      type: "float",
      description: "Demand deposits in insured branches located in Puerto Rico and U.S. Territories.",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
      sourceKey: "INSBRDD",
    }),
    territoryTimeSavingsDeposits: defineField({
      type: "float",
      description: "Time and savings deposits in insured branches located in Puerto Rico and U.S. Territories.",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
      sourceKey: "INSBRTS",
    }),

    // -------------------------------------------------------------------------
    // Institution financials
    // -------------------------------------------------------------------------
    totalAssets: defineField({
      type: "float",
      description: "Total assets of the institution as of June 30. Repeated for every branch — use once per institution to avoid duplication.",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
      sourceKey: "ASSET",
    }),

    // -------------------------------------------------------------------------
    // Institution classification
    // -------------------------------------------------------------------------
    institutionClass: defineField({
      type: "string",
      description: "Institution Class — major groupings based on insuring agent, entity type, charter agent, and Fed membership.",
      measure: "nominal",
      format: "enum",
      enumValues: ["N", "SM", "NM", "SI", "SB", "SL", "SA", "OI", "NC", "NS", "CU"],
      sourceKey: "BKCLASS",
    }),
    classCode: defineField({
      type: "integer",
      description: "Two-digit numeric code identifying the major and minor categories of an institution.",
      measure: "nominal",
      format: "enum",
      sourceKey: "CLCODE",
    }),
    charteringAgencyName: defineField({
      type: "string",
      description: "The name of the chartering agency of the institution.",
      measure: "nominal",
      format: "enum",
      enumValues: ["OCC", "OTS", "STATE", "SOVER"],
      sourceKey: "CHRTAGNN",
    }),
    charteringAgency: defineField({
      type: "string",
      description: "The abbreviation of the chartering agency of the institution.",
      measure: "nominal",
      format: "enum",
      enumValues: ["OCC", "OTS", "STATE", "SOVER"],
      sourceKey: "CHRTAGNT",
    }),
    charterType: defineField({
      type: "string",
      description: "Identifies whether an institution is federally or state chartered.",
      measure: "nominal",
      format: "enum",
      sourceKey: "CHARTER",
    }),
    primaryRegulator: defineField({
      type: "string",
      description: "The primary regulatory agency of the institution.",
      measure: "nominal",
      format: "enum",
      enumValues: ["FED", "FDIC", "OCC", "OTS", "NCUA", "STATE"],
      sourceKey: "REGAGNT",
    }),
    primaryInsurer: defineField({
      type: "string",
      description: "The primary insurer, insurance agent, or insurance status of an institution.",
      measure: "nominal",
      format: "enum",
      enumValues: ["BIF", "DIF", "SAIF", "STATE", "PRIV", "SOVER", "OTHER", "NONE", "NCUA"],
      sourceKey: "INSAGNT1",
    }),
    insuranceCategory: defineField({
      type: "string",
      description: "Identifies commercial banks (CB), savings institutions (SA), and insured branches of foreign banks (IB).",
      measure: "nominal",
      format: "enum",
      enumValues: ["CB", "SA", "IB"],
      sourceKey: "INSURED",
    }),
    denovo: defineField({
      type: "integer",
      description: "Flag indicating whether an institution is a new institution, not a recharter.",
      measure: "nominal",
      format: "boolean",
      sourceKey: "DENOVO",
    }),
    holdingCompanyType: defineField({
      type: "string",
      description: "Holding company type — MULT (multi-bank), ONE (one-bank), NONE (not a member).",
      measure: "nominal",
      format: "enum",
      enumValues: ["MULT", "ONE", "NONE"],
      sourceKey: "HCTMULT",
    }),
    specializationGroup: defineField({
      type: "integer",
      description: "Asset concentration specialization group.",
      measure: "nominal",
      format: "enum",
      sourceKey: "SPECGRP",
    }),
    specializationDescription: defineField({
      type: "string",
      description: "Description of the institution's primary asset specialization.",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
      sourceKey: "SPECDESC",
    }),
    filesCallReport: defineField({
      type: "integer",
      description: "Prior to 2012, OTS institutions filed a Thrift Financial Report (TFR). All others file the CALL report.",
      measure: "nominal",
      format: "boolean",
      sourceKey: "CALL",
    }),
    otsDocketNumber: defineField({
      type: "string",
      description: "Unique identification number assigned to OTS-chartered institutions or FHLB members.",
      measure: "nominal",
      format: "id",
      sourceKey: "DOCKET",
    }),
    headquarteredInUsa: defineField({
      type: "integer",
      description: "Flag identifying that the institution is headquartered in the United States.",
      measure: "nominal",
      format: "boolean",
      sourceKey: "USA",
    }),
    country: defineField({
      type: "string",
      description: "The country name where the headquarters of the institution is chartered.",
      measure: "nominal",
      format: "text",
      sourceKey: "CNTRYNA",
    }),
    branchCountry: defineField({
      type: "string",
      description: "Country name in which the branch is located.",
      measure: "nominal",
      format: "text",
      sourceKey: "CNTRYNAB",
    }),

    // -------------------------------------------------------------------------
    // Regulatory / geographic
    // -------------------------------------------------------------------------
    fdicRegionNumber: defineField({
      type: "integer",
      description: "The number assigned to the FDIC Regional Office that services the institution.",
      measure: "nominal",
      format: "enum",
      sourceKey: "FDICDBS",
    }),
    fdicRegionName: defineField({
      type: "string",
      description: "The name of the FDIC Regional Office that services the institution.",
      measure: "nominal",
      format: "text",
      sourceKey: "FDICNAME",
    }),
    federalReserveDistrict: defineField({
      type: "integer",
      description: "The number identifying the Federal Reserve District where the institution is located.",
      measure: "nominal",
      format: "enum",
      sourceKey: "FED",
    }),
    federalReserveDistrictName: defineField({
      type: "string",
      description: "The name of the Federal Reserve District where the institution is located.",
      measure: "nominal",
      format: "text",
      sourceKey: "FEDNAME",
    }),
    occDistrict: defineField({
      type: "integer",
      description: "OCC district number in which the institution is located.",
      measure: "nominal",
      format: "enum",
      enumValues: ["01", "03", "04", "05"],
      sourceKey: "OCCDIST",
    }),
    occDistrictName: defineField({
      type: "string",
      description: "OCC district name.",
      measure: "nominal",
      format: "text",
      sourceKey: "OCCNAME",
    }),
    holdingCompanyRssdId: defineField({
      type: "integer",
      description: "The unique FRB number assigned to the top regulatory bank holding company.",
      measure: "nominal",
      format: "id",
      sourceKey: "RSSDHCR",
    }),
    rssdId: defineField({
      type: "integer",
      description: "The unique number assigned by the Federal Reserve Board to the institution.",
      measure: "nominal",
      format: "id",
      sourceKey: "RSSDID",
    }),
    holdingCompanyState: defineField({
      type: "string",
      description: "The state abbreviation of the headquarters of the top regulatory bank holding company.",
      measure: "nominal",
      format: "text",
      sourceKey: "STALPHCR",
    }),
    holdingCompanyCity: defineField({
      type: "string",
      description: "The city of the headquarters of the top regulatory bank holding company.",
      measure: "nominal",
      format: "text",
      sourceKey: "CITYHCR",
    }),

    // -------------------------------------------------------------------------
    // Metro / statistical areas (branch)
    // -------------------------------------------------------------------------
    branchMsaNumber: defineField({
      type: "integer",
      description: "Metropolitan Statistical Area number based on the 2020 Census.",
      measure: "nominal",
      format: "id",
      sourceKey: "MSABR",
    }),
    branchMsaName: defineField({
      type: "string",
      description: "Metropolitan Statistical Area name in which the branch is physically located.",
      measure: "nominal",
      format: "text",
      sourceKey: "MSANAMB",
    }),
    branchMetro: defineField({
      type: "integer",
      description: "Indicator for an area containing a core urban area of 50,000 or more population.",
      measure: "nominal",
      format: "boolean",
      sourceKey: "METROBR",
    }),
    branchMicro: defineField({
      type: "integer",
      description: "Indicator for an area containing an urban core of at least 10,000 but less than 50,000 population.",
      measure: "nominal",
      format: "boolean",
      sourceKey: "MICROBR",
    }),
    branchCsaNumber: defineField({
      type: "integer",
      description: "Combined Statistical Area code for the branch.",
      measure: "nominal",
      format: "id",
      sourceKey: "CSABR",
    }),
    branchCsaName: defineField({
      type: "string",
      description: "Combined Statistical Area name for the branch.",
      measure: "nominal",
      format: "text",
      sourceKey: "CSANAMBR",
    }),
    branchCbsaDivisionName: defineField({
      type: "string",
      description: "Metropolitan Division name for the branch.",
      measure: "nominal",
      format: "text",
      sourceKey: "CBSA_DIV_NAMB",
    }),
    branchMetroDivision: defineField({
      type: "string",
      description: "Metropolitan Division — county or group of counties within a CBSA with a core population of at least 2.5 million.",
      measure: "nominal",
      format: "text",
      sourceKey: "DIVISIONB",
    }),
    branchPlaceNumber: defineField({
      type: "integer",
      description: "FIPS MCD (Minor Civil Division) code for the branch.",
      measure: "nominal",
      format: "id",
      sourceKey: "PLACENUM",
    }),
    branchNectaCode: defineField({
      type: "integer",
      description: "Code of the New England City Town Areas based on PLACENUM.",
      measure: "nominal",
      format: "id",
      sourceKey: "NECTABR",
    }),
    branchNectaName: defineField({
      type: "string",
      description: "Name of the New England City Town Areas based on PLACENUM.",
      measure: "nominal",
      format: "text",
      sourceKey: "NECNAMB",
    }),
  },
});
