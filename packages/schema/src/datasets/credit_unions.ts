import { defineDataset, defineField } from "../define.js";

export const credit_unions = defineDataset({
  name: "credit_unions",
  description:
    "NCUA federally-insured credit unions, sourced from the FOICU file inside the NCUA quarterly Call Report ZIP.",
  index: "cuNumber",
  fields: {
    // -------------------------------------------------------------------------
    // Identity
    // -------------------------------------------------------------------------
    ncuaCharterNumber: defineField({
      type: "integer",
      label: "NCUA Charter Number",
      description: "NCUA charter number.",
      measure: "nominal",
      format: "id",
      sourceKey: "CU_NUMBER",
    }),
    callReportCycleEndDate: defineField({
      type: "date",
      label: "Call Report Cycle End Date",
      description:
        "Call report cycle end date (March, June, September, or December).",
      measure: "temporal",
      format: "date",
      sourceKey: "CYCLE_DATE",
    }),
    ncuaInternalJoinNumber: defineField({
      type: "integer",
      label: "NCUA Internal Join Number",
      description: "NCUA internal join number for the credit union.",
      measure: "nominal",
      format: "id",
      sourceKey: "JOIN_NUMBER",
    }),
    rssdId: defineField({
      type: "string",
      label: "RSSD ID",
      description:
        "Federal Reserve RSSD ID — unique institution identifier assigned by the Federal Reserve.",
      measure: "nominal",
      format: "id",
      sourceKey: "RSSD",
    }),
    creditUnionType: defineField({
      type: "string",
      label: "Credit Union Type",
      description: "Credit union type code (e.g. federal vs state charter).",
      measure: "nominal",
      format: "enum",
      sourceKey: "CU_TYPE",
    }),
    creditUnionName: defineField({
      type: "string",
      label: "Credit Union Name",
      description: "Credit union name.",
      measure: "nominal",
      format: "text",
      sourceKey: "CU_NAME",
    }),

    // -------------------------------------------------------------------------
    // Location
    // -------------------------------------------------------------------------
    city: defineField({
      type: "string",
      label: "City",
      description: "Mailing address city.",
      measure: "nominal",
      format: "text",
      sourceKey: "CITY",
    }),
    state: defineField({
      type: "string",
      label: "State",
      description: "Mailing address state (two-letter abbreviation).",
      measure: "nominal",
      format: "text",
      sourceKey: "STATE",
    }),
    charterState: defineField({
      type: "string",
      label: "Charter State",
      description: "State in which the credit union was chartered.",
      measure: "nominal",
      format: "text",
      sourceKey: "CharterState",
    }),
    stateCode: defineField({
      type: "integer",
      label: "FIPS State Code",
      description: "FIPS state code.",
      measure: "nominal",
      format: "id",
      sourceKey: "STATE_CODE",
    }),
    zipCode: defineField({
      type: "string",
      label: "ZIP Code",
      description: "Mailing address ZIP code.",
      measure: "nominal",
      format: "text",
      sourceKey: "ZIP_CODE",
    }),
    countyCode: defineField({
      type: "integer",
      label: "FIPS County Code",
      description: "FIPS county code.",
      measure: "nominal",
      format: "id",
      sourceKey: "COUNTY_CODE",
    }),
    congressionalDistrict: defineField({
      type: "integer",
      label: "Congressional District",
      description: "Congressional district (Congressional Atlas).",
      measure: "nominal",
      format: "id",
      sourceKey: "CONG_DIST",
    }),
    standardMetropolitanStatisticalAreaCode: defineField({
      type: "integer",
      label: "SMSA Code",
      description: "Standard Metropolitan Statistical Area code.",
      measure: "nominal",
      format: "id",
      sourceKey: "SMSA",
    }),
    mailingAttentionLine: defineField({
      type: "string",
      label: "Mailing Attention Line",
      description: "Mailing attention line.",
      measure: "nominal",
      format: "text",
      sourceKey: "ATTENTION_OF",
    }),
    street: defineField({
      type: "string",
      label: "Street",
      description: "Mailing address street.",
      measure: "nominal",
      format: "text",
      sourceKey: "STREET",
    }),

    // -------------------------------------------------------------------------
    // Supervision
    // -------------------------------------------------------------------------
    ncuaRegionCode: defineField({
      type: "string",
      label: "NCUA Region Code",
      description:
        "NCUA region code. 1=Albany, 2=Capital, 3=Atlanta, 4=Austin, 5=Tempe.",
      measure: "nominal",
      format: "enum",
      sourceKey: "REGION",
    }),
    ncuaSupervisoryExaminerCode: defineField({
      type: "string",
      label: "NCUA Supervisory Examiner Code",
      description: "NCUA SE (supervisory examiner) code.",
      measure: "nominal",
      format: "enum",
      sourceKey: "SE",
    }),
    ncuaDistrict: defineField({
      type: "integer",
      label: "NCUA District",
      description: "NCUA district.",
      measure: "nominal",
      format: "id",
      sourceKey: "DISTRICT",
    }),

    // -------------------------------------------------------------------------
    // Charter attributes
    // -------------------------------------------------------------------------
    creditUnionYearOpened: defineField({
      type: "integer",
      label: "Year Opened",
      description: "Year the credit union was organized.",
      measure: "temporal",
      format: "count",
      sourceKey: "YEAR_OPENED",
    }),
    tomCode: defineField({
      type: "string",
      label: "Field of Membership (TOM) Code",
      description: "Field of membership (TOM) code.",
      measure: "nominal",
      format: "enum",
      sourceKey: "TOM_CODE",
    }),
    isDesignatedLowIncome: defineField({
      type: "integer",
      label: "Low-Income Designation",
      description: "Low-income designation flag.",
      measure: "nominal",
      format: "boolean",
      sourceKey: "LIMITED_INC",
    }),
    creditUnionCharterIssueDate: defineField({
      type: "date",
      label: "Charter Issue Date",
      description: "Date the credit union's charter was issued.",
      measure: "temporal",
      format: "date",
      sourceKey: "ISSUE_DATE",
    }),
    ncuaPeerGroup: defineField({
      type: "integer",
      label: "NCUA Peer Group",
      description:
        "NCUA peer group by asset size. 1: <$2M; 2: $2–10M; 3: $10–50M; 4: $50–100M; 5: $100–500M; 6: ≥$500M.",
      measure: "nominal",
      format: "enum",
      enumValues: ["1", "2", "3", "4", "5", "6"],
      sourceKey: "Peer_Group",
    }),
    quarterFlag: defineField({
      type: "integer",
      label: "Quarter Flag",
      description:
        "Legacy field; NCUA stopped populating it. Historical values may exist but new records are null.",
      measure: "nominal",
      format: "enum",
      sourceKey: "Quarter_Flag",
      isDeprecated: true,
    }),
    isMinorityDepositoryInstitution: defineField({
      type: "boolean",
      label: "Minority Depository Institution",
      description: "Minority Depository Institution flag.",
      measure: "nominal",
      format: "boolean",
      sourceKey: "IsMDI",
    }),
    ncuaFirstInsuredDate: defineField({
      type: "date",
      label: "NCUA First Insured Date",
      description: "Date first insured by NCUA.",
      measure: "temporal",
      format: "date",
      sourceKey: "INSURED_DATE",
    }),
    creditUnionAnnualMeetingDate: defineField({
      type: "date",
      label: "Annual Meeting Date",
      description: "Date of the credit union's annual meeting.",
      measure: "temporal",
      format: "date",
      sourceKey: "AM_DateHeld",
    }),
  },
});
