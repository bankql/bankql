import { defineDataset, defineField } from "../define.js";

export const nic_attributes = defineDataset({
  name: "nic_attributes",
  description:
    "Federal Reserve NIC Attributes table — entity characteristics for active institutions, closed institutions, and branches. Each entity has a unique ID_RSSD; rows are versioned by DT_START/DT_END date ranges.",
  index: "ID_RSSD",
  fields: {
    // -------------------------------------------------------------------------
    // Primary key / versioning
    // -------------------------------------------------------------------------
    ID_RSSD: defineField({
      type: "integer",
      description: "RSSD ID — primary identifier assigned by the Federal Reserve. Unique, never changes, never reused.",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "FED_RSSD", cardinality: "1:1" },
    }),
    DT_START: defineField({
      type: "integer",
      description: "Date Start — first date the information in this record was known to be valid. Format YYYYMMDD.",
      measure: "temporal",
      format: "date",
    }),
    DT_END: defineField({
      type: "integer",
      description: "Date End — last date the information was valid. 99991231 = non-terminated record. Format YYYYMMDD.",
      measure: "temporal",
      format: "date",
    }),
    D_DT_START: defineField({
      type: "datetime",
      description: "Date Start (DB2 datetime format).",
      measure: "temporal",
      format: "datetime",
    }),
    D_DT_END: defineField({
      type: "datetime",
      description: "Date End (DB2 datetime format).",
      measure: "temporal",
      format: "datetime",
    }),

    // -------------------------------------------------------------------------
    // Names
    // -------------------------------------------------------------------------
    NM_LGL: defineField({
      type: "string",
      description: "Legal Name — legal name from the charter or formation document.",
      measure: "nominal",
      format: "text",
    }),
    NM_SHORT: defineField({
      type: "string",
      description: "Short Name — abbreviated version of the legal name used for processing.",
      measure: "nominal",
      format: "text",
    }),
    NM_SRCH_CD: defineField({
      type: "integer",
      description: "Numeric Search Code — derived from NM_LGL to speed automated name searches.",
      measure: "nominal",
      format: "id",
    }),

    // -------------------------------------------------------------------------
    // Entity classification
    // -------------------------------------------------------------------------
    ENTITY_TYPE: defineField({
      type: "string",
      description: "Entity Type — derived code identifying the legal and structural type of the entity (e.g., BHC, NAT, SMB, FSB, SCU).",
      measure: "nominal",
      format: "enum",
      enumValues: [
        "AGB", "AGI", "BHC", "CPB", "CSA", "DBR", "DEO", "DPS", "EBR", "EDB", "EDI",
        "FBH", "FBK", "FBO", "FCU", "FEO", "FHD", "FHF", "FNC", "FSB", "IBK", "IBR",
        "IHC", "IFB", "INB", "ISB", "MTC", "NAT", "NMB", "NTC", "NYI", "PST", "REP",
        "SAL", "SBD", "SCU", "SLHC", "SMB", "SSB", "TWG", "UFA", "UFB", "USA", "USB",
      ],
    }),
    CHTR_TYPE_CD: defineField({
      type: "integer",
      description: "Charter Type — type of entity based on its charter or formation documents.",
      measure: "nominal",
      format: "enum",
      enumValues: [
        "0", "110", "200", "250", "300", "310", "320", "330", "340",
        "400", "500", "550", "610", "700", "710", "720",
      ],
    }),
    CHTR_AUTH_CD: defineField({
      type: "integer",
      description: "Authority Charter — chartering authority (0=N/A, 1=Federal, 2=State).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2"],
    }),
    ORG_TYPE_CD: defineField({
      type: "integer",
      description: "Organization Type — legal structure (1=Corporation, 2=General Partnership, 6=Mutual, 9=Cooperative, etc.).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2", "3", "4", "5", "6", "9", "10", "11", "12", "13", "99"],
    }),
    BROAD_REG_CD: defineField({
      type: "integer",
      description: "Broad Regulatory Code — major regulatory grouping (1=Bank per BHC Act, 2=Other depository, 3=Non-depository, 4=Inactive).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2", "3", "4"],
    }),
    EST_TYPE_CD: defineField({
      type: "integer",
      description: "Establishment Type Code — type of physical establishment (1=HQ, 2=Full service branch, 3=Limited service branch, etc.).",
      measure: "nominal",
      format: "enum",
      enumValues: ["1", "2", "3", "5", "6", "7", "8", "9", "11", "12", "13", "14", "15", "16", "17", "18", "19"],
    }),
    ACT_PRIM_CD: defineField({
      type: "string",
      description: "Primary Activity Code — five or six-digit NAICS code describing the entity's primary activity.",
      measure: "nominal",
      format: "id",
    }),
    BNK_TYPE_ANALYS_CD: defineField({
      type: "integer",
      description: "Bank Type Analysis Code — special classification (0=N/A, 4=Credit card, 5=Wholesale, 6=Internet-only, 9=Depository trust, etc.).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"],
    }),

    // -------------------------------------------------------------------------
    // Holding company indicators
    // -------------------------------------------------------------------------
    BHC_IND: defineField({
      type: "integer",
      description: "Bank Holding Company Indicator (0=N/A, 1=Is a BHC, 2=Controls grandfathered non-bank bank).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2"],
    }),
    BANK_CNT: defineField({
      type: "integer",
      description: "Bank Count — derived count of U.S. banking subsidiaries in a BHC's organizational structure.",
      measure: "quantitative",
      format: "count",
    }),
    FHC_IND: defineField({
      type: "integer",
      description: "Financial Holding Company Indicator (0=N/A, 1=FHC, 2=SLHC designated FHC).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2"],
    }),
    SLHC_IND: defineField({
      type: "integer",
      description: "Savings and Loan Holding Company Indicator.",
      measure: "nominal",
      format: "boolean",
    }),
    SLHC_TYPE_IND: defineField({
      type: "integer",
      description: "Savings and Loan Holding Company type (0=N/A, 1-5=various SLHC structures).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2", "3", "4", "5"],
    }),
    IHC_IND: defineField({
      type: "integer",
      description: "Intermediate Holding Company Indicator.",
      measure: "nominal",
      format: "boolean",
    }),
    FBO_4C9_IND: defineField({
      type: "integer",
      description: "FBO/4C9 Qualification Indicator — whether an FBO is exempt from non-bank activity restrictions under Section 4(c)(9) of the BHCA.",
      measure: "nominal",
      format: "boolean",
    }),

    // -------------------------------------------------------------------------
    // Financial subsidiary
    // -------------------------------------------------------------------------
    FNCL_SUB_HOLDER: defineField({
      type: "integer",
      description: "Financial Subsidiary Holder — whether a bank conducts expanded financial activities through a financial subsidiary (0=N/A, 1=Holds one or more, 2=Other).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2"],
    }),
    FNCL_SUB_IND: defineField({
      type: "integer",
      description: "Financial Subsidiary Indicator — whether a non-bank subsidiary engages in financial-in-nature activities.",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2"],
    }),
    FUNC_REG: defineField({
      type: "integer",
      description: "Functional Regulator — regulator of financial subsidiaries (1=SEC/CFTC, 2=SEC, 3=State Securities, 4=State Insurance, 5=CFTC, 6=Other).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2", "3", "4", "5", "6"],
    }),
    IBF_IND: defineField({
      type: "integer",
      description: "IBF Indicator — entity operates an International Banking Facility.",
      measure: "nominal",
      format: "boolean",
    }),

    // -------------------------------------------------------------------------
    // Regulatory identifiers
    // -------------------------------------------------------------------------
    PRIM_FED_REG: defineField({
      type: "string",
      description: "Primary Federal Regulator (FCA, FDIC, FHFA, FRS, NCUA, OCC, OTS).",
      measure: "nominal",
      format: "enum",
      enumValues: ["FCA", "FDIC", "FHFA", "FRS", "NCUA", "OCC", "OTS"],
    }),
    INSUR_PRI_CD: defineField({
      type: "integer",
      description: "Primary Insurer (0=Not insured, 1=FDIC/BIF, 2=FDIC/SAIF, 3=NCUSIF, 4=State, 5=Other, 7=DIF).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2", "3", "4", "5", "6", "7"],
    }),
    CNSRVTR_CD: defineField({
      type: "integer",
      description: "Conservatorship Code (0=N/A, 1=RTC, 2=OCC, 3=FDIC, 4=STATE, 5=NCUA).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2", "3", "4", "5"],
    }),
    REASON_TERM_CD: defineField({
      type: "integer",
      description: "Reason for Termination (0=Ongoing, 1=Voluntary liquidation, 2=Closure, 3=Inactive/no longer regulated, 4=Failure/continues, 5=Failure/ceases).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2", "3", "4", "5"],
    }),
    SEC_RPTG_STATUS: defineField({
      type: "integer",
      description: "SEC Reporting Status — registration or reporting status under the Securities Exchange Act of 1934.",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "2", "3", "4", "5"],
    }),
    MBR_FHLBS_IND: defineField({
      type: "integer",
      description: "FHLBS Membership Indicator — member of the Federal Home Loan Bank System.",
      measure: "nominal",
      format: "boolean",
    }),
    MBR_FRS_IND: defineField({
      type: "integer",
      description: "FRS Membership Indicator — member of the Federal Reserve System.",
      measure: "nominal",
      format: "boolean",
    }),
    DOMESTIC_IND: defineField({
      type: "string",
      description: "Domestic Indicator — Y if physically located in the U.S. or its territories.",
      measure: "nominal",
      format: "enum",
      enumValues: ["Y", "N"],
    }),
    MJR_OWN_MNRTY: defineField({
      type: "integer",
      description: "Majority-Owned by Minorities or Women (0=N/A, 1=African American, 5=Caucasian Women, 10=Hispanic, 20=Asian American, 30=Native American, 99=Other).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0", "1", "5", "10", "20", "30", "35", "37", "39", "99"],
    }),

    // -------------------------------------------------------------------------
    // Cross-reference identifiers
    // -------------------------------------------------------------------------
    ID_FDIC_CERT: defineField({
      type: "integer",
      description: "FDIC Certificate ID — number assigned by the FDIC to each head office depository institution.",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "CERT", cardinality: "1:1" },
    }),
    ID_RSSD_HD_OFF: defineField({
      type: "integer",
      description: "Head Office ID_RSSD — ID_RSSD of the head office for branches and non-independent facilities.",
      measure: "nominal",
      format: "id",
      relation: { dataset: "nic_attributes", field: "ID_RSSD", cardinality: "many:1" },
    }),
    ID_ABA_PRIM: defineField({
      type: "integer",
      description: "Primary ABA Routing Number — identifies the entity's primary account for check clearing.",
      measure: "nominal",
      format: "id",
    }),
    ID_CUSIP: defineField({
      type: "string",
      description: "CUSIP ID — six-character identifier for the entity's securities.",
      measure: "nominal",
      format: "id",
    }),
    ID_LEI: defineField({
      type: "string",
      description: "Legal Entity Identifier — 20-digit alpha-numeric code for entities engaged in financial transactions.",
      measure: "nominal",
      format: "id",
    }),
    ID_NCUA: defineField({
      type: "integer",
      description: "NCUA Charter ID — number assigned by the National Credit Union Administration.",
      measure: "nominal",
      format: "id",
    }),
    ID_OCC: defineField({
      type: "integer",
      description: "OCC Charter ID — number assigned by the Office of the Comptroller of the Currency.",
      measure: "nominal",
      format: "id",
    }),
    ID_TAX: defineField({
      type: "integer",
      description: "Tax ID — federal employer identification number (EIN).",
      measure: "nominal",
      format: "id",
    }),
    ID_THRIFT: defineField({
      type: "integer",
      description: "Thrift ID — OTS docket number for institutions with charter type 300 or 310 that are FHLB members.",
      measure: "nominal",
      format: "id",
    }),
    ID_THRIFT_HC: defineField({
      type: "string",
      description: "Thrift Holding Company ID — OTS-assigned alpha-numeric code ('H' + 5 numbers).",
      measure: "nominal",
      format: "id",
    }),

    // -------------------------------------------------------------------------
    // Location
    // -------------------------------------------------------------------------
    STREET_LINE1: defineField({
      type: "string",
      description: "Physical First Street Line",
      measure: "nominal",
      format: "text",
    }),
    STREET_LINE2: defineField({
      type: "string",
      description: "Physical Second Street Line",
      measure: "nominal",
      format: "text",
    }),
    CITY: defineField({
      type: "string",
      description: "City/Town Text Name — city or town in which the entity is physically located.",
      measure: "nominal",
      format: "text",
    }),
    STATE_ABBR_NM: defineField({
      type: "string",
      description: "Abbreviated State Name — two-character state abbreviation (FIPS 5-2).",
      measure: "nominal",
      format: "text",
    }),
    STATE_CD: defineField({
      type: "integer",
      description: "Physical State Code — two-digit FIPS state code.",
      measure: "nominal",
      format: "id",
    }),
    STATE_HOME_CD: defineField({
      type: "integer",
      description: "Home State — FIPS state code identifying the home state of a Foreign Banking Organization.",
      measure: "nominal",
      format: "id",
    }),
    STATE_INC_ABBR_NM: defineField({
      type: "string",
      description: "Abbreviated State of Incorporation — two-character state abbreviation.",
      measure: "nominal",
      format: "text",
    }),
    STATE_INC_CD: defineField({
      type: "integer",
      description: "State of Incorporation — two-digit FIPS state code.",
      measure: "nominal",
      format: "id",
    }),
    COUNTY_CD: defineField({
      type: "integer",
      description: "County Code — numeric FIPS county code for the state in which the entity is physically located.",
      measure: "nominal",
      format: "id",
    }),
    ZIP_CD: defineField({
      type: "string",
      description: "Zip/Foreign Mailing Code",
      measure: "nominal",
      format: "text",
    }),
    PLACE_CD: defineField({
      type: "integer",
      description: "Physical Place Code — FIPS code for the incorporated place, census place, or county division.",
      measure: "nominal",
      format: "id",
    }),
    PROV_REGION: defineField({
      type: "string",
      description: "Province Region — territorial unit within a country or state.",
      measure: "nominal",
      format: "text",
    }),
    CNTRY_CD: defineField({
      type: "float",
      description: "Country Code — numeric Treasury code for the country of physical location.",
      measure: "nominal",
      format: "id",
    }),
    CNTRY_NM: defineField({
      type: "string",
      description: "Country Name",
      measure: "nominal",
      format: "text",
    }),
    CNTRY_INC_CD: defineField({
      type: "integer",
      description: "Country Incorporation Code — numeric code for the country of incorporation.",
      measure: "nominal",
      format: "id",
    }),
    CNTRY_INC_NM: defineField({
      type: "string",
      description: "Country Incorporation Name",
      measure: "nominal",
      format: "text",
    }),

    // -------------------------------------------------------------------------
    // Federal Reserve district
    // -------------------------------------------------------------------------
    DIST_FRS: defineField({
      type: "integer",
      description: "Federal Reserve District Code — two-digit code for the district of physical location (01=Boston…12=San Francisco).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0","01","02","03","04","05","06","07","08","09","10","11","12"],
    }),
    AUTH_REG_DIST_FRS: defineField({
      type: "integer",
      description: "Federal Reserve Regulatory District Code — district of regulatory authority (may differ from physical location).",
      measure: "nominal",
      format: "enum",
      enumValues: ["0","01","02","03","04","05","06","07","08","09","10","11","12"],
    }),

    // -------------------------------------------------------------------------
    // Dates
    // -------------------------------------------------------------------------
    DT_EXIST_CMNC: defineField({
      type: "integer",
      description: "Commencement of Existence — date the entity came into existence. Format YYYYMMDD.",
      measure: "temporal",
      format: "date",
    }),
    D_DT_EXIST_CMNC: defineField({
      type: "date",
      description: "Commencement of Existence (DB2 date format).",
      measure: "temporal",
      format: "date",
    }),
    DT_EXIST_TERM: defineField({
      type: "integer",
      description: "Final Day of Existence — last full day the entity existed. 99991231 = non-terminated. Format YYYYMMDD.",
      measure: "temporal",
      format: "date",
    }),
    D_DT_EXIST_TERM: defineField({
      type: "datetime",
      description: "Final Day of Existence (DB2 datetime format).",
      measure: "temporal",
      format: "datetime",
    }),
    DT_OPEN: defineField({
      type: "integer",
      description: "Date of Opening — date the entity's general ledger was first opened. Format YYYYMMDD.",
      measure: "temporal",
      format: "date",
    }),
    D_DT_OPEN: defineField({
      type: "date",
      description: "Date of Opening (DB2 date format).",
      measure: "temporal",
      format: "date",
    }),
    DT_INSUR: defineField({
      type: "integer",
      description: "Date Insured — date insurance became effective. Format YYYYMMDD.",
      measure: "temporal",
      format: "date",
    }),
    D_DT_INSUR: defineField({
      type: "datetime",
      description: "Date Insured (DB2 datetime format).",
      measure: "temporal",
      format: "datetime",
    }),
    FISC_YREND_MMDD: defineField({
      type: "float",
      description: "Date of Fiscal Year End — MMDD format. Applicable to BHCs, SLHCs, FBOs, and other FR Y-7 filers.",
      measure: "nominal",
      format: "date",
    }),

    // -------------------------------------------------------------------------
    // Web
    // -------------------------------------------------------------------------
    URL: defineField({
      type: "string",
      description: "Web Site — web address of the reporting company.",
      measure: "nominal",
      format: "url",
    }),
  },
});
