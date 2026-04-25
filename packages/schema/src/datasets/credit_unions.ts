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
    cuNumber: defineField({
      type: "integer",
      description: "NCUA charter number.",
      measure: "nominal",
      format: "id",
      sourceKey: "CU_NUMBER",
    }),
    cycleDate: defineField({
      type: "date",
      description: "Call report cycle end date (March, June, September, or December).",
      measure: "temporal",
      format: "date",
      sourceKey: "CYCLE_DATE",
    }),
    joinNumber: defineField({
      type: "integer",
      description: "NCUA internal join number for the credit union.",
      measure: "nominal",
      format: "id",
      sourceKey: "JOIN_NUMBER",
    }),
    rssd: defineField({
      type: "string",
      description: "Federal Reserve RSSD ID — unique institution identifier assigned by the Federal Reserve.",
      measure: "nominal",
      format: "id",
      sourceKey: "RSSD",
    }),
    cuType: defineField({
      type: "string",
      description: "Credit union type code (e.g. federal vs state charter).",
      measure: "nominal",
      format: "enum",
      sourceKey: "CU_TYPE",
    }),
    cuName: defineField({
      type: "string",
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
      description: "Mailing address city.",
      measure: "nominal",
      format: "text",
      sourceKey: "CITY",
    }),
    state: defineField({
      type: "string",
      description: "Mailing address state (two-letter abbreviation).",
      measure: "nominal",
      format: "text",
      sourceKey: "STATE",
    }),
    charterState: defineField({
      type: "string",
      description: "State in which the credit union was chartered.",
      measure: "nominal",
      format: "text",
      sourceKey: "CharterState",
    }),
    stateCode: defineField({
      type: "integer",
      description: "FIPS state code.",
      measure: "nominal",
      format: "id",
      sourceKey: "STATE_CODE",
    }),
    zipCode: defineField({
      type: "string",
      description: "Mailing address ZIP code.",
      measure: "nominal",
      format: "text",
      sourceKey: "ZIP_CODE",
    }),
    countyCode: defineField({
      type: "integer",
      description: "FIPS county code.",
      measure: "nominal",
      format: "id",
      sourceKey: "COUNTY_CODE",
    }),
    congressionalDistrict: defineField({
      type: "integer",
      description: "Congressional district (Congressional Atlas).",
      measure: "nominal",
      format: "id",
      sourceKey: "CONG_DIST",
    }),
    smsa: defineField({
      type: "integer",
      description: "Standard Metropolitan Statistical Area code.",
      measure: "nominal",
      format: "id",
      sourceKey: "SMSA",
    }),
    attentionOf: defineField({
      type: "string",
      description: "Mailing attention line.",
      measure: "nominal",
      format: "text",
      sourceKey: "ATTENTION_OF",
    }),
    street: defineField({
      type: "string",
      description: "Mailing address street.",
      measure: "nominal",
      format: "text",
      sourceKey: "STREET",
    }),

    // -------------------------------------------------------------------------
    // Supervision
    // -------------------------------------------------------------------------
    region: defineField({
      type: "string",
      description:
        "NCUA region code. 1=Albany, 2=Capital, 3=Atlanta, 4=Austin, 5=Tempe.",
      measure: "nominal",
      format: "enum",
      sourceKey: "REGION",
    }),
    se: defineField({
      type: "string",
      description: "NCUA SE (supervisory examiner) code.",
      measure: "nominal",
      format: "enum",
      sourceKey: "SE",
    }),
    district: defineField({
      type: "integer",
      description: "NCUA district.",
      measure: "nominal",
      format: "id",
      sourceKey: "DISTRICT",
    }),

    // -------------------------------------------------------------------------
    // Charter attributes
    // -------------------------------------------------------------------------
    yearOpened: defineField({
      type: "integer",
      description: "Year the credit union was organized.",
      measure: "temporal",
      format: "count",
      sourceKey: "YEAR_OPENED",
    }),
    tomCode: defineField({
      type: "string",
      description: "Field of membership (TOM) code.",
      measure: "nominal",
      format: "enum",
      sourceKey: "TOM_CODE",
    }),
    limitedIncome: defineField({
      type: "integer",
      description: "Low-income designation flag.",
      measure: "nominal",
      format: "boolean",
      sourceKey: "LIMITED_INC",
    }),
    issueDate: defineField({
      type: "date",
      description: "Date the credit union's charter was issued.",
      measure: "temporal",
      format: "date",
      sourceKey: "ISSUE_DATE",
    }),
    peerGroup: defineField({
      type: "integer",
      description:
        "NCUA peer group by asset size. 1: <$2M; 2: $2–10M; 3: $10–50M; 4: $50–100M; 5: $100–500M; 6: ≥$500M.",
      measure: "nominal",
      format: "enum",
      enumValues: ["1", "2", "3", "4", "5", "6"],
      sourceKey: "Peer_Group",
    }),
    quarterFlag: defineField({
      type: "integer",
      description: "Quarter flag (legacy, not used by NCUA).",
      measure: "nominal",
      format: "enum",
      sourceKey: "Quarter_Flag",
    }),
    isMinorityDepositoryInstitution: defineField({
      type: "boolean",
      description: "Minority Depository Institution flag.",
      measure: "nominal",
      format: "boolean",
      sourceKey: "IsMDI",
    }),
    insuredDate: defineField({
      type: "date",
      description: "Date first insured by NCUA.",
      measure: "temporal",
      format: "date",
      sourceKey: "INSURED_DATE",
    }),
    annualMeetingDate: defineField({
      type: "date",
      description: "Date of the credit union's annual meeting.",
      measure: "temporal",
      format: "date",
      sourceKey: "AM_DateHeld",
    }),
  },
});
