import { defineDataset, defineField } from "../define.js";

export const institutions = defineDataset({
  name: "institutions",
  description:
    "FDIC-insured financial institutions, sourced from the FDIC BankFind dataset.",
  index: "CERT",
  fields: {
    // -------------------------------------------------------------------------
    // Identity
    // -------------------------------------------------------------------------
    CERT: defineField({
      type: "integer",
      description: "FDIC Certificate #",
      measure: "nominal",
      format: "id",
    }),
    UNINUM: defineField({
      type: "integer",
      description: "FDIC's unique identifier number for holding companies, banks, branches and nondeposit subsidiaries.",
      measure: "nominal",
      format: "id",
    }),
    FED_RSSD: defineField({
      type: "integer",
      description: "Federal Reserve ID Number",
      measure: "nominal",
      format: "id",
    }),
    NAME: defineField({
      type: "string",
      description: "Institution name",
      measure: "nominal",
      format: "text",
    }),
    ACTIVE: defineField({
      type: "integer",
      description: "Institution Status",
      measure: "nominal",
      format: "boolean",
      enumValues: ["0", "1"],
    }),
    INACTIVE: defineField({
      type: "integer",
      description: "Inactive — institutions that are currently closed but were once insured by the FDIC.",
      measure: "nominal",
      format: "boolean",
    }),

    // -------------------------------------------------------------------------
    // Location
    // -------------------------------------------------------------------------
    ADDRESS: defineField({
      type: "string",
      description: "Street Address",
      measure: "nominal",
      format: "text",
    }),
    ADDRESS2: defineField({
      type: "string",
      description: "Street Address Line 2",
      measure: "nominal",
      format: "text",
    }),
    CITY: defineField({
      type: "string",
      description: "City",
      measure: "nominal",
      format: "text",
    }),
    COUNTY: defineField({
      type: "string",
      description: "County",
      measure: "nominal",
      format: "text",
    }),
    STNAME: defineField({
      type: "string",
      description: "State Name",
      measure: "nominal",
      format: "text",
    }),
    STALP: defineField({
      type: "string",
      description: "State Alpha code",
      measure: "nominal",
      format: "text",
    }),
    STNUM: defineField({
      type: "integer",
      description: "State Number — Federal Information Processing Standard code used to identify states.",
      measure: "nominal",
      format: "id",
    }),
    STCNTY: defineField({
      type: "string",
      description: "State and county number — five digit FIPS state/county code.",
      measure: "nominal",
      format: "id",
    }),
    ZIP: defineField({
      type: "string",
      description: "Zip Code",
      measure: "nominal",
      format: "text",
    }),
    LATITUDE: defineField({
      type: "float",
      description: "Latitude",
      measure: "quantitative",
      format: "coordinate",
    }),
    LONGITUDE: defineField({
      type: "float",
      description: "Longitude",
      measure: "quantitative",
      format: "coordinate",
    }),

    // -------------------------------------------------------------------------
    // Financial metrics
    // -------------------------------------------------------------------------
    ASSET: defineField({
      type: "float",
      description: "Total assets",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
    }),
    DEP: defineField({
      type: "float",
      description: "Total deposits",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
    }),
    DEPDOM: defineField({
      type: "float",
      description: "Deposits held in domestic offices",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
    }),
    EQ: defineField({
      type: "float",
      description: "Equity capital",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
    }),
    NETINC: defineField({
      type: "float",
      description: "Net income",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
    }),
    NETINCQ: defineField({
      type: "float",
      description: "Net income - quarterly",
      measure: "quantitative",
      format: "currency-dollars",
      unit: "USD (thousands)",
    }),
    ROA: defineField({
      type: "float",
      description: "Return on assets (ROA) — net income after taxes (annualized) as a percent of average total assets.",
      measure: "quantitative",
      format: "percentage",
    }),
    ROAQ: defineField({
      type: "float",
      description: "Quarterly return on assets",
      measure: "quantitative",
      format: "percentage",
    }),
    ROAPTX: defineField({
      type: "float",
      description: "Pretax return on assets",
      measure: "quantitative",
      format: "percentage",
    }),
    ROAPTXQ: defineField({
      type: "float",
      description: "Quarterly pretax return on assets",
      measure: "quantitative",
      format: "percentage",
    }),
    ROE: defineField({
      type: "float",
      description: "Return on Equity (ROE) — annualized net income as a percent of average equity.",
      measure: "quantitative",
      format: "percentage",
    }),
    ROEQ: defineField({
      type: "float",
      description: "Quarterly return on equity",
      measure: "quantitative",
      format: "percentage",
    }),

    // -------------------------------------------------------------------------
    // Classification
    // -------------------------------------------------------------------------
    BKCLASS: defineField({
      type: "string",
      description: "Institution Class — charter type, charter agent, Fed membership, and primary federal regulator.",
      measure: "nominal",
      format: "enum",
      enumValues: ["N", "NM", "OI", "SB", "SI", "SL", "SM", "NC", "NS", "CU"],
    }),
    CB: defineField({
      type: "integer",
      description: "Community Bank — flag indicating whether the institution is a community bank.",
      measure: "nominal",
      format: "boolean",
    }),
    CLCODE: defineField({
      type: "integer",
      description: "Numeric Code — two-digit category identifying institution type.",
      measure: "nominal",
      format: "enum",
    }),
    CHRTAGNT: defineField({
      type: "string",
      description: "Chartering Agency",
      measure: "nominal",
      format: "enum",
      enumValues: ["OCC", "State"],
    }),
    MUTUAL: defineField({
      type: "integer",
      description: "Ownership Type — stock (0) or mutual/non-stock (1) institution.",
      measure: "nominal",
      format: "enum",
    }),
    SPECGRP: defineField({
      type: "integer",
      description: "Asset Concentration Hierarchy — primary specialization in terms of asset concentration.",
      measure: "nominal",
      format: "enum",
    }),
    SPECGRPN: defineField({
      type: "string",
      description: "Specialization Group — name of asset concentration specialization.",
      measure: "nominal",
      format: "enum",
    }),
    INSTAG: defineField({
      type: "integer",
      description: "Agricultural lending institution indicator.",
      measure: "nominal",
      format: "boolean",
    }),
    INSTCRCD: defineField({
      type: "integer",
      description: "Credit Card Institutions — institutions with total loans >50% of assets and credit card loans >50% of total loans.",
      measure: "nominal",
      format: "boolean",
    }),
    MDI_STATUS_CODE: defineField({
      type: "integer",
      description: "Minority Status Code",
      measure: "nominal",
      format: "enum",
    }),
    MDI_STATUS_DESC: defineField({
      type: "string",
      description: "Minority Status Description",
      measure: "nominal",
      format: "enum",
    }),
    SUBCHAPS: defineField({
      type: "integer",
      description: "Subchapter S Corporations — flag indicating Subchapter S corporation status.",
      measure: "nominal",
      format: "boolean",
    }),
    TRUST: defineField({
      type: "integer",
      description: "Trust Powers — type of trust power the institution possesses.",
      measure: "nominal",
      format: "enum",
      enumValues: ["00", "10", "11", "12", "20", "21", "30", "31", "40"],
    }),

    // -------------------------------------------------------------------------
    // Regulatory
    // -------------------------------------------------------------------------
    REGAGNT: defineField({
      type: "string",
      description: "Primary Regulator",
      measure: "nominal",
      format: "enum",
      enumValues: ["OCC", "FDIC", "OTS", "STATE", "FED"],
    }),
    REGAGENT2: defineField({
      type: "string",
      description: "Secondary Regulator",
      measure: "nominal",
      format: "enum",
      enumValues: ["CFPB", "OTS"],
    }),
    FEDCHRTR: defineField({
      type: "integer",
      description: "Federal charter flag — indicates whether the institution is chartered by the federal government.",
      measure: "nominal",
      format: "boolean",
    }),
    STCHRTR: defineField({
      type: "integer",
      description: "State Charter flag.",
      measure: "nominal",
      format: "boolean",
    }),
    FED: defineField({
      type: "integer",
      description: "Federal Reserve ID Number — district in which the institution is located.",
      measure: "nominal",
      format: "enum",
      enumValues: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    }),
    CONSERVE: defineField({
      type: "string",
      description: "Conservatorship — indicates if an institution is being operated in government conservatorship.",
      measure: "nominal",
      format: "enum",
      enumValues: ["Y", "N"],
    }),
    DENOVO: defineField({
      type: "integer",
      description: "Denovo Institution — flag indicating a new institution (not a recharter).",
      measure: "nominal",
      format: "boolean",
    }),
    HCTMULT: defineField({
      type: "integer",
      description: "Bank Holding Company Type — member of a multibank holding company.",
      measure: "nominal",
      format: "boolean",
    }),
    IBA: defineField({
      type: "integer",
      description: "Insured offices of foreign banks.",
      measure: "nominal",
      format: "boolean",
    }),
    INSDIF: defineField({
      type: "integer",
      description: "Deposit Insurance Fund member.",
      measure: "nominal",
      format: "boolean",
    }),
    INSFDIC: defineField({
      type: "integer",
      description: "FDIC Insured.",
      measure: "nominal",
      format: "boolean",
    }),
    INSBIF: defineField({
      type: "integer",
      description: "Bank Insurance Fund member.",
      measure: "nominal",
      format: "boolean",
    }),
    INSSAIF: defineField({
      type: "integer",
      description: "SAIF Insured.",
      measure: "nominal",
      format: "boolean",
    }),
    INSSAVE: defineField({
      type: "integer",
      description: "Insured Savings Institution.",
      measure: "nominal",
      format: "boolean",
    }),
    INSCOML: defineField({
      type: "integer",
      description: "Insured commercial banks.",
      measure: "nominal",
      format: "boolean",
    }),
    INSAGNT1: defineField({
      type: "string",
      description: "Primary Insurance Agency.",
      measure: "nominal",
      format: "enum",
    }),
    INSAGNT2: defineField({
      type: "string",
      description: "Secondary Insurance Fund.",
      measure: "nominal",
      format: "enum",
    }),
    CFPBFLAG: defineField({
      type: "integer",
      description: "CFPB Flag — indicates secondary supervision by CFPB.",
      measure: "nominal",
      format: "boolean",
    }),
    FORM31: defineField({
      type: "integer",
      description: "FFIEC Call Report 31 Filer — institution filed an FFIEC 031 Call Report.",
      measure: "nominal",
      format: "boolean",
    }),

    // -------------------------------------------------------------------------
    // Offices
    // -------------------------------------------------------------------------
    OFFDOM: defineField({
      type: "integer",
      description: "Number of Domestic Offices",
      measure: "quantitative",
      format: "count",
    }),
    OFFFOR: defineField({
      type: "integer",
      description: "Number of Foreign Offices",
      measure: "quantitative",
      format: "count",
    }),
    OFFOA: defineField({
      type: "integer",
      description: "Number of US Offices — offices in all US commonwealths and territories.",
      measure: "quantitative",
      format: "count",
    }),

    // -------------------------------------------------------------------------
    // Holding company
    // -------------------------------------------------------------------------
    NAMEHCR: defineField({
      type: "string",
      description: "Bank Holding Company (Regulatory Top Holder)",
      measure: "nominal",
      format: "text",
    }),
    RSSDHCR: defineField({
      type: "integer",
      description: "RSSDID - High Regulatory Holder — Federal Reserve Board ID of the regulatory high holding company.",
      measure: "nominal",
      format: "id",
    }),
    CITYHCR: defineField({
      type: "string",
      description: "City of High Holder",
      measure: "nominal",
      format: "text",
    }),
    STALPHCR: defineField({
      type: "string",
      description: "Regulatory holding company state location.",
      measure: "nominal",
      format: "text",
    }),
    PARCERT: defineField({
      type: "integer",
      description: "Directly owned by another bank (CERT) — FDIC certificate number of the parent bank.",
      measure: "nominal",
      format: "id",
    }),
    CERTCONS: defineField({
      type: "integer",
      description: "Directly owned by another bank (CERT) — certificate number of the parent with which financial data is consolidated.",
      measure: "nominal",
      format: "id",
    }),
    ULTCERT: defineField({
      type: "integer",
      description: "Ultimate Cert — cert number of the last successor or acquirer.",
      measure: "nominal",
      format: "id",
    }),
    NEWCERT: defineField({
      type: "integer",
      description: "New certificate number — new cert resulting from a merger or acquisition.",
      measure: "nominal",
      format: "id",
    }),

    // -------------------------------------------------------------------------
    // Geographic context
    // -------------------------------------------------------------------------
    CBSA: defineField({
      type: "string",
      description: "Core Based Statistical Area Name",
      measure: "nominal",
      format: "text",
    }),
    CBSA_NO: defineField({
      type: "integer",
      description: "Core Based Statistical Areas — numeric CBSA code.",
      measure: "nominal",
      format: "id",
    }),
    CBSA_DIV: defineField({
      type: "string",
      description: "Metropolitan Divisions Name",
      measure: "nominal",
      format: "text",
    }),
    CBSA_DIV_FLG: defineField({
      type: "integer",
      description: "Metropolitan Divisions Flag — member of a Core Based Statistical Division.",
      measure: "nominal",
      format: "boolean",
    }),
    CBSA_DIV_NO: defineField({
      type: "integer",
      description: "Metropolitan Divisions Number",
      measure: "nominal",
      format: "id",
    }),
    CBSA_METRO: defineField({
      type: "integer",
      description: "Metropolitan Division Number — numeric Metropolitan Statistical Area code.",
      measure: "nominal",
      format: "id",
    }),
    CBSA_METRO_FLG: defineField({
      type: "integer",
      description: "Metropolitan Division Flag — institution is in a Metropolitan Statistical Area.",
      measure: "nominal",
      format: "boolean",
    }),
    CBSA_METRO_NAME: defineField({
      type: "string",
      description: "Metropolitan Division Name",
      measure: "nominal",
      format: "text",
    }),
    CBSA_MICRO_FLG: defineField({
      type: "integer",
      description: "Micropolitan Division Flag — institution is in a Micropolitan Statistical Area.",
      measure: "nominal",
      format: "boolean",
    }),
    CSA: defineField({
      type: "string",
      description: "Combined Statistical Area Name",
      measure: "nominal",
      format: "text",
    }),
    CSA_FLG: defineField({
      type: "integer",
      description: "CSA Area Flag — institution is in a Combined Statistical Area.",
      measure: "nominal",
      format: "boolean",
    }),
    CSA_NO: defineField({
      type: "integer",
      description: "Combined Statistical Area Number",
      measure: "nominal",
      format: "id",
    }),
    FDICDBS: defineField({
      type: "string",
      description: "FDIC Geographic Region",
      measure: "nominal",
      format: "enum",
      enumValues: ["Boston", "New York", "Atlanta", "Memphis", "Chicago", "Kansas City", "Dallas", "San Francisco"],
    }),
    FDICREGN: defineField({
      type: "string",
      description: "FDIC Supervisory Region",
      measure: "nominal",
      format: "enum",
      enumValues: ["Boston", "New York", "Atlanta", "Memphis", "Chicago", "Kansas City", "Dallas", "San Francisco"],
    }),
    FDICSUPV: defineField({
      type: "string",
      description: "Federal Reserve District",
      measure: "nominal",
      format: "enum",
      enumValues: ["New York", "Atlanta", "Chicago", "Kansas City", "Dallas", "San Francisco", "Washington"],
    }),
    OCCDIST: defineField({
      type: "string",
      description: "Office of the Comptroller — OCC District.",
      measure: "nominal",
      format: "enum",
      enumValues: ["Northeast", "Southeast", "Central", "Midwest", "Southwest", "West"],
    }),
    SUPRV_FD: defineField({
      type: "integer",
      description: "Supervisory Region Number — FDIC Supervisory Division or Region.",
      measure: "nominal",
      format: "enum",
      enumValues: ["02", "05", "09", "11", "13", "14", "16"],
    }),
    QBPRCOML: defineField({
      type: "string",
      description: "Quarterly Banking Profile Commercial Bank Region",
      measure: "nominal",
      format: "text",
    }),

    // -------------------------------------------------------------------------
    // Dates
    // -------------------------------------------------------------------------
    ESTYMD: defineField({
      type: "date",
      description: "Established Date — date on which the institution began operations.",
      measure: "temporal",
      format: "date",
    }),
    INSDATE: defineField({
      type: "date",
      description: "Date of Deposit Insurance — date the institution obtained federal deposit insurance.",
      measure: "temporal",
      format: "date",
    }),
    INSDROPDATE: defineField({
      type: "date",
      description: "Date of Dropped Deposit Insurance",
      measure: "temporal",
      format: "date",
    }),
    ENDEFYMD: defineField({
      type: "date",
      description: "End date — date the institution became inactive (for closed institutions).",
      measure: "temporal",
      format: "date",
    }),
    EFFDATE: defineField({
      type: "date",
      description: "Last Structure Change Effective Date",
      measure: "temporal",
      format: "date",
    }),
    CFPBEFFDTE: defineField({
      type: "date",
      description: "CFPB Effective Date — date the institution began secondary supervision by CFPB.",
      measure: "temporal",
      format: "date",
    }),
    CFPBENDDTE: defineField({
      type: "date",
      description: "CFPB End Date — date the institution ended supervision by CFPB.",
      measure: "temporal",
      format: "date",
    }),
    REPDTE: defineField({
      type: "date",
      description: "Report Date — last day of the financial reporting period.",
      measure: "temporal",
      format: "date",
    }),
    DATEUPDT: defineField({
      type: "date",
      description: "Last update",
      measure: "temporal",
      format: "date",
    }),
    RUNDATE: defineField({
      type: "date",
      description: "Run Date — day the institution information was updated.",
      measure: "temporal",
      format: "date",
    }),
    PROCDATE: defineField({
      type: "date",
      description: "Last Structure Change Process Date",
      measure: "temporal",
      format: "date",
    }),

    // -------------------------------------------------------------------------
    // Web
    // -------------------------------------------------------------------------
    WEBADDR: defineField({
      type: "string",
      description: "Primary Internet Web Address",
      measure: "nominal",
      format: "url",
    }),

    // -------------------------------------------------------------------------
    // Other identifiers
    // -------------------------------------------------------------------------
    CHARTER: defineField({
      type: "string",
      description: "OCC Charter Number",
      measure: "nominal",
      format: "id",
    }),
    DOCKET: defineField({
      type: "string",
      description: "OTS Docket Number",
      measure: "nominal",
      format: "id",
    }),
  },
});
