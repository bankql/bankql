import { defineDataset, defineField } from "../define.js";

const CLASS_ENUM = ["N", "SM", "NM", "SI", "MI", "SB", "SL", "OI", "CU", "NC", "NS"];
const SERVTYPE_ENUM = ["11", "12", "13", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"];
const REGAGENT_ENUM = ["OCC", "FDIC", "FRB", "NCUA", "OTS", "STATE"];
const FDICREGION_ENUM = ["02", "05", "09", "11", "13", "14", "16"];

export const events = defineDataset({
  name: "events",
  description:
    "FDIC structural event history — mergers, acquisitions, charter changes, openings, and closings for all institutions and branch offices.",
  index: "TRANSNUM",
  fields: {
    // -------------------------------------------------------------------------
    // Event identity
    // -------------------------------------------------------------------------
    TRANSNUM: defineField({
      type: "integer",
      description: "System Transaction Number — unique number identifying the change/event.",
      measure: "nominal",
      format: "id",
    }),
    ACT_EVT_NUM: defineField({
      type: "integer",
      description: "Activity Event Number — indicates a change/event to an institution's activities or ownership over time.",
      measure: "nominal",
      format: "id",
    }),
    ACT_EVT_DESC: defineField({
      type: "string",
      description: "Activity Event Description",
      measure: "nominal",
      format: "text",
    }),
    CHANGECODE: defineField({
      type: "string",
      description: "Activity Event Code",
      measure: "nominal",
      format: "enum",
    }),
    CHANGECODE_DESC: defineField({
      type: "string",
      description: "Activity Event Code Description",
      measure: "nominal",
      format: "text",
    }),
    REPORT_TYPE: defineField({
      type: "string",
      description: "Report Type",
      measure: "nominal",
      format: "enum",
    }),
    ORG_ROLE_CDE: defineField({
      type: "string",
      description: "Organization Role Code — FI (Financial Institution), BR (Branch), or PA.",
      measure: "nominal",
      format: "enum",
      enumValues: ["FI", "BR", "PA"],
    }),

    // -------------------------------------------------------------------------
    // Subject institution identity
    // -------------------------------------------------------------------------
    CERT: defineField({
      type: "integer",
      description: "FDIC Certificate #",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "CERT", cardinality: "many:1" },
    }),
    UNINUM: defineField({
      type: "integer",
      description: "FDIC's unique number for holding companies, banks, branches and nondeposit subsidiaries.",
      measure: "nominal",
      format: "id",
    }),
    NAME: defineField({
      type: "string",
      description: "Institution name",
      measure: "nominal",
      format: "text",
    }),
    INSTNAME: defineField({
      type: "string",
      description: "Institution Name — legal name of the institution.",
      measure: "nominal",
      format: "text",
    }),
    ACTIVE: defineField({
      type: "integer",
      description: "Institution Status",
      measure: "nominal",
      format: "boolean",
    }),

    // -------------------------------------------------------------------------
    // Subject institution physical address
    // -------------------------------------------------------------------------
    ADDRESS: defineField({ type: "string", description: "Street Address", measure: "nominal", format: "text" }),
    ADDRESS2: defineField({ type: "string", description: "Street Address Line 2", measure: "nominal", format: "text" }),
    CITY: defineField({ type: "string", description: "City", measure: "nominal", format: "text" }),
    STALP: defineField({ type: "string", description: "State Alpha code", measure: "nominal", format: "text" }),
    STNAME: defineField({ type: "string", description: "State Name", measure: "nominal", format: "text" }),
    STNUM: defineField({ type: "integer", description: "State Number — FIPS state code.", measure: "nominal", format: "id" }),
    ZIP: defineField({ type: "string", description: "Zip Code", measure: "nominal", format: "text" }),
    CNTYNAME: defineField({ type: "string", description: "County", measure: "nominal", format: "text" }),
    CNTYNUM: defineField({ type: "integer", description: "County Number — FIPS county code.", measure: "nominal", format: "id" }),

    // -------------------------------------------------------------------------
    // Subject institution physical address (PADDR variant)
    // -------------------------------------------------------------------------
    PADDR: defineField({ type: "string", description: "Physical Street Address", measure: "nominal", format: "text" }),
    PADDR2: defineField({ type: "string", description: "Physical Street Address Line 2", measure: "nominal", format: "text" }),
    PCITY: defineField({ type: "string", description: "Physical City", measure: "nominal", format: "text" }),
    PSTALP: defineField({ type: "string", description: "Physical State Alpha Code", measure: "nominal", format: "text" }),
    PZIP5: defineField({ type: "string", description: "Physical Zip Code", measure: "nominal", format: "text" }),

    // -------------------------------------------------------------------------
    // Subject institution mailing address
    // -------------------------------------------------------------------------
    MADDR: defineField({ type: "string", description: "Mailing Street Address", measure: "nominal", format: "text" }),
    MADDR2: defineField({ type: "string", description: "Mailing Street Address Line 2", measure: "nominal", format: "text" }),
    MCITY: defineField({ type: "string", description: "Mailing City", measure: "nominal", format: "text" }),
    MSTALP: defineField({ type: "string", description: "Mailing State Alpha Code", measure: "nominal", format: "text" }),
    MZIP5: defineField({ type: "string", description: "Mailing Zip Code", measure: "nominal", format: "text" }),

    // -------------------------------------------------------------------------
    // Subject institution classification
    // -------------------------------------------------------------------------
    CLASS: defineField({
      type: "string",
      description: "Bank Charter Class",
      measure: "nominal",
      format: "enum",
      enumValues: CLASS_ENUM,
    }),
    CLCODE: defineField({
      type: "integer",
      description: "Numeric Code — two-digit identifying category of an institution.",
      measure: "nominal",
      format: "enum",
    }),
    CHARTAGENT: defineField({
      type: "string",
      description: "Chartering Agency",
      measure: "nominal",
      format: "enum",
      enumValues: ["OCC", "OTS", "State", "Sover"],
    }),
    CHARTER: defineField({ type: "string", description: "OCC Charter Number", measure: "nominal", format: "id" }),
    REGAGENT: defineField({ type: "string", description: "Primary Regulator", measure: "nominal", format: "enum", enumValues: REGAGENT_ENUM }),
    REGAGENT2: defineField({ type: "string", description: "Secondary Regulator", measure: "nominal", format: "enum", enumValues: ["CFPB", "OTS"] }),
    TRUST: defineField({ type: "integer", description: "Trust Powers", measure: "nominal", format: "enum" }),
    INSAGENT1: defineField({ type: "string", description: "Insurance Fund Membership — DIF, BIF, or SAIF.", measure: "nominal", format: "enum" }),
    INSAGENT2: defineField({ type: "string", description: "Secondary Insurance Fund.", measure: "nominal", format: "enum" }),
    CONSERVE: defineField({ type: "integer", description: "Conservatorship flag.", measure: "nominal", format: "boolean" }),
    DOCKET: defineField({ type: "string", description: "OTS Docket Number", measure: "nominal", format: "id" }),
    FDICREGION: defineField({ type: "string", description: "Supervisory Region", measure: "nominal", format: "enum", enumValues: FDICREGION_ENUM }),
    FDICREGION_DESC: defineField({ type: "string", description: "Supervisory Region Description", measure: "nominal", format: "text" }),
    SUPRV_FD: defineField({ type: "integer", description: "Supervisory Region Number", measure: "nominal", format: "enum" }),
    OCCDIST: defineField({ type: "string", description: "Office of the Comptroller district.", measure: "nominal", format: "enum" }),

    // -------------------------------------------------------------------------
    // Dates
    // -------------------------------------------------------------------------
    EFFDATE: defineField({ type: "date", description: "Last Structure Change Effective Date", measure: "temporal", format: "date" }),
    ENDDATE: defineField({ type: "date", description: "End Effective Date", measure: "temporal", format: "date" }),
    ENDEFYMD: defineField({ type: "date", description: "End date — date the institution became inactive.", measure: "temporal", format: "date" }),
    INSDATE: defineField({ type: "date", description: "Date of Deposit Insurance", measure: "temporal", format: "date" }),
    PROCDATE: defineField({ type: "date", description: "Last Structure Change Process Date", measure: "temporal", format: "date" }),
    CFPBEFFDTE: defineField({ type: "date", description: "CFPB Effective Date", measure: "temporal", format: "date" }),
    CFPBENDDTE: defineField({ type: "date", description: "CFPB End Date", measure: "temporal", format: "date" }),
    SYS_LST_DTETME: defineField({ type: "datetime", description: "System Last Datetime — last update to a record.", measure: "temporal", format: "datetime" }),

    // -------------------------------------------------------------------------
    // Office / branch fields
    // -------------------------------------------------------------------------
    OFFNAME: defineField({ type: "string", description: "Office Name — branch office name.", measure: "nominal", format: "text" }),
    OFFNUM: defineField({ type: "integer", description: "Branch Number", measure: "nominal", format: "id" }),
    OFF_NAME: defineField({ type: "string", description: "Office Name — legal name of the office.", measure: "nominal", format: "text" }),
    OFF_NUM: defineField({ type: "integer", description: "Branch Number", measure: "nominal", format: "id" }),
    OFF_EFFDATE: defineField({ type: "date", description: "Office Structure Change Effective Date", measure: "temporal", format: "date" }),
    OFF_CNTYNAME: defineField({ type: "string", description: "Office County Name", measure: "nominal", format: "text" }),
    OFF_CNTYNUM: defineField({ type: "integer", description: "Office County Number — FIPS code.", measure: "nominal", format: "id" }),
    OFF_PADDR: defineField({ type: "string", description: "Office Physical Street Address", measure: "nominal", format: "text" }),
    OFF_PADDR2: defineField({ type: "string", description: "Office Physical Street Address Line 2", measure: "nominal", format: "text" }),
    OFF_PCITY: defineField({ type: "string", description: "Office Physical City", measure: "nominal", format: "text" }),
    OFF_PSTALP: defineField({ type: "string", description: "Office Physical State Alpha Code", measure: "nominal", format: "text" }),
    OFF_PZIP5: defineField({ type: "string", description: "Office Physical Zip Code", measure: "nominal", format: "text" }),
    OFF_SERVTYPE: defineField({ type: "integer", description: "Office Service Type", measure: "nominal", format: "enum", enumValues: SERVTYPE_ENUM }),
    OFF_SERVTYPE_DESC: defineField({ type: "string", description: "Office Service Type Description", measure: "nominal", format: "text" }),

    // -------------------------------------------------------------------------
    // Acquiring institution
    // -------------------------------------------------------------------------
    ACQ_CERT: defineField({
      type: "integer",
      description: "Acquiring FDIC Certificate #",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "CERT", cardinality: "many:1" },
    }),
    ACQ_UNINUM: defineField({ type: "integer", description: "Acquiring Unique FDIC Number", measure: "nominal", format: "id" }),
    ACQ_INSTNAME: defineField({ type: "string", description: "Acquiring Institution Name", measure: "nominal", format: "text" }),
    ACQ_CLASS: defineField({ type: "string", description: "Acquiring Class Designation", measure: "nominal", format: "enum", enumValues: CLASS_ENUM }),
    ACQ_CLCODE: defineField({ type: "integer", description: "Acquiring Numeric Class Code", measure: "nominal", format: "enum" }),
    ACQ_CHARTAGENT: defineField({ type: "string", description: "Acquiring Chartering Agency", measure: "nominal", format: "enum" }),
    ACQ_CHARTER: defineField({ type: "string", description: "Acquiring OCC Charter Number", measure: "nominal", format: "id" }),
    ACQ_REGAGENT: defineField({ type: "string", description: "Acquiring Chartering Agency", measure: "nominal", format: "enum" }),
    ACQ_INSAGENT1: defineField({ type: "string", description: "Acquiring Insurance Fund Membership", measure: "nominal", format: "enum" }),
    ACQ_INSAGENT2: defineField({ type: "string", description: "Acquiring Secondary Insurance Fund", measure: "nominal", format: "enum" }),
    ACQ_TRUST: defineField({ type: "integer", description: "Acquiring Trust Power", measure: "nominal", format: "enum" }),
    ACQ_FDICREGION: defineField({ type: "string", description: "Acquiring Supervisory Region Number", measure: "nominal", format: "enum", enumValues: FDICREGION_ENUM }),
    ACQ_FDICREGION_DESC: defineField({ type: "string", description: "Acquiring Supervisory Region Description", measure: "nominal", format: "text" }),
    ACQ_CNTYNAME: defineField({ type: "string", description: "Acquiring County Name", measure: "nominal", format: "text" }),
    ACQ_CNTYNUM: defineField({ type: "integer", description: "Acquiring County Number — FIPS code.", measure: "nominal", format: "id" }),
    ACQ_PADDR: defineField({ type: "string", description: "Acquiring Physical Street Address", measure: "nominal", format: "text" }),
    ACQ_PADDR2: defineField({ type: "string", description: "Acquiring Physical Street Address Line 2", measure: "nominal", format: "text" }),
    ACQ_PCITY: defineField({ type: "string", description: "Acquiring Physical City", measure: "nominal", format: "text" }),
    ACQ_PSTALP: defineField({ type: "string", description: "Acquiring Physical State Alpha Code", measure: "nominal", format: "text" }),
    ACQ_PZIP5: defineField({ type: "string", description: "Acquiring Zip Code", measure: "nominal", format: "text" }),
    ACQ_MADDR: defineField({ type: "string", description: "Acquiring Mailing Street Address", measure: "nominal", format: "text" }),
    ACQ_MADDR2: defineField({ type: "string", description: "Acquiring Mailing Street Address Line 2", measure: "nominal", format: "text" }),
    ACQ_MCITY: defineField({ type: "string", description: "Acquiring Mailing City", measure: "nominal", format: "text" }),
    ACQ_MSTALP: defineField({ type: "string", description: "Acquiring Mailing State Abbreviation", measure: "nominal", format: "text" }),
    ACQ_MZIP5: defineField({ type: "string", description: "Acquiring Zip Code", measure: "nominal", format: "text" }),
    ACQ_ORG_EFF_DTE: defineField({ type: "date", description: "Acquiring Institution's Effective Date", measure: "temporal", format: "date" }),

    // -------------------------------------------------------------------------
    // Outgoing institution
    // -------------------------------------------------------------------------
    OUT_CERT: defineField({
      type: "integer",
      description: "Outgoing FDIC Certificate #",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "CERT", cardinality: "many:1" },
    }),
    OUT_UNINUM: defineField({ type: "integer", description: "Outgoing FDIC Unique Number", measure: "nominal", format: "id" }),
    OUT_INSTNAME: defineField({ type: "string", description: "Outgoing Institution name", measure: "nominal", format: "text" }),
    OUT_CLASS: defineField({ type: "string", description: "Outgoing Class", measure: "nominal", format: "enum", enumValues: CLASS_ENUM }),
    OUT_CLCODE: defineField({ type: "integer", description: "Outgoing Class Code", measure: "nominal", format: "enum" }),
    OUT_CHARTAGENT: defineField({ type: "string", description: "Outgoing Chartering Agency", measure: "nominal", format: "enum" }),
    OUT_CHARTER: defineField({ type: "string", description: "Outgoing OCC Charter Number", measure: "nominal", format: "id" }),
    OUT_REGAGENT: defineField({ type: "string", description: "Outgoing Chartering Agency", measure: "nominal", format: "enum" }),
    OUT_INSAGENT1: defineField({ type: "string", description: "Outgoing Insurance Fund Membership", measure: "nominal", format: "enum" }),
    OUT_INSAGENT2: defineField({ type: "string", description: "Outgoing Secondary Insurance Fund", measure: "nominal", format: "enum" }),
    OUT_TRUST: defineField({ type: "integer", description: "Outgoing Trust Power", measure: "nominal", format: "enum" }),
    OUT_FDICREGION: defineField({ type: "string", description: "Outgoing FDIC Supervisory Region Number", measure: "nominal", format: "enum", enumValues: FDICREGION_ENUM }),
    OUT_FDICREGION_DESC: defineField({ type: "string", description: "Outgoing Supervisory Region Description", measure: "nominal", format: "text" }),
    OUT_CNTYNAME: defineField({ type: "string", description: "Outgoing County Name", measure: "nominal", format: "text" }),
    OUT_CNTYNUM: defineField({ type: "integer", description: "Outgoing County Number — FIPS code.", measure: "nominal", format: "id" }),
    OUT_PADDR: defineField({ type: "string", description: "Outgoing Physical Street Address", measure: "nominal", format: "text" }),
    OUT_PADDR2: defineField({ type: "string", description: "Outgoing Physical Street Address Line 2", measure: "nominal", format: "text" }),
    OUT_PCITY: defineField({ type: "string", description: "Outgoing Physical City", measure: "nominal", format: "text" }),
    OUT_PSTALP: defineField({ type: "string", description: "Outgoing Physical State Alpha Code", measure: "nominal", format: "text" }),
    OUT_PZIP5: defineField({ type: "string", description: "Outgoing Physical Zip Code", measure: "nominal", format: "text" }),
    OUT_MADDR: defineField({ type: "string", description: "Outgoing Mailing Street Address", measure: "nominal", format: "text" }),
    OUT_MADDR2: defineField({ type: "string", description: "Outgoing Mailing Street Address Line 2", measure: "nominal", format: "text" }),
    OUT_MCITY: defineField({ type: "string", description: "Outgoing Mailing City", measure: "nominal", format: "text" }),
    OUT_MSTALP: defineField({ type: "string", description: "Outgoing Mailing State Alpha Code", measure: "nominal", format: "text" }),
    OUT_MZIP5: defineField({ type: "string", description: "Outgoing Mailing Zip Code", measure: "nominal", format: "text" }),

    // -------------------------------------------------------------------------
    // Surviving institution
    // -------------------------------------------------------------------------
    SUR_CERT: defineField({
      type: "integer",
      description: "Surviving FDIC Certificate #",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "CERT", cardinality: "many:1" },
    }),
    SUR_INSTNAME: defineField({ type: "string", description: "Surviving Institution Name", measure: "nominal", format: "text" }),
    SUR_CLASS: defineField({ type: "string", description: "Surviving Class", measure: "nominal", format: "enum", enumValues: CLASS_ENUM }),
    SUR_CLCODE: defineField({ type: "integer", description: "Surviving Class Code", measure: "nominal", format: "enum" }),
    SUR_CHARTAGENT: defineField({ type: "string", description: "Surviving Chartering Agency", measure: "nominal", format: "enum" }),
    SUR_CHARTER: defineField({ type: "string", description: "Surviving OCC Charter Number", measure: "nominal", format: "id" }),
    SUR_REGAGENT: defineField({ type: "string", description: "Surviving Chartering Agency", measure: "nominal", format: "enum" }),
    SUR_INSAGENT1: defineField({ type: "string", description: "Surviving Insurance Fund Membership", measure: "nominal", format: "enum" }),
    SUR_INSAGENT2: defineField({ type: "string", description: "Surviving Secondary Insurance Fund", measure: "nominal", format: "enum" }),
    SUR_TRUST: defineField({ type: "integer", description: "Surviving Trust Power", measure: "nominal", format: "enum" }),
    SUR_FDICREGION: defineField({ type: "string", description: "Surviving Supervisory Region Number", measure: "nominal", format: "enum", enumValues: FDICREGION_ENUM }),
    SUR_FDICREGION_DESC: defineField({ type: "string", description: "Surviving Supervisory Region Description", measure: "nominal", format: "text" }),
    SUR_CNTYNAME: defineField({ type: "string", description: "Surviving County", measure: "nominal", format: "text" }),
    SUR_CNTYNUM: defineField({ type: "integer", description: "Surviving County Number — FIPS code.", measure: "nominal", format: "id" }),
    SUR_PADDR: defineField({ type: "string", description: "Surviving Physical Street Address", measure: "nominal", format: "text" }),
    SUR_PADDR2: defineField({ type: "string", description: "Surviving Physical Street Address Line 2", measure: "nominal", format: "text" }),
    SUR_PCITY: defineField({ type: "string", description: "Surviving Physical City", measure: "nominal", format: "text" }),
    SUR_PSTALP: defineField({ type: "string", description: "Surviving Physical State Alpha Code", measure: "nominal", format: "text" }),
    SUR_PZIP5: defineField({ type: "string", description: "Surviving Physical Zip Code", measure: "nominal", format: "text" }),
    SUR_MADDR: defineField({ type: "string", description: "Surviving Mailing Street Address", measure: "nominal", format: "text" }),
    SUR_MADDR2: defineField({ type: "string", description: "Surviving Mailing Street Address Line 2", measure: "nominal", format: "text" }),
    SUR_MCITY: defineField({ type: "string", description: "Surviving Mailing City", measure: "nominal", format: "text" }),
    SUR_MSTALP: defineField({ type: "string", description: "Surviving Mailing State Alpha Code", measure: "nominal", format: "text" }),
    SUR_MZIP5: defineField({ type: "string", description: "Surviving Mailing Zip Code", measure: "nominal", format: "text" }),
    SUR_CHANGECODE: defineField({ type: "string", description: "Surviving Activity Event Code", measure: "nominal", format: "enum" }),

    // -------------------------------------------------------------------------
    // Previous institution state (FRM_*)
    // -------------------------------------------------------------------------
    FRM_CERT: defineField({
      type: "integer",
      description: "Previous FDIC Certificate #",
      measure: "nominal",
      format: "id",
    }),
    FRM_INSTNAME: defineField({ type: "string", description: "Previous Institution Name", measure: "nominal", format: "text" }),
    FRM_CLASS: defineField({ type: "string", description: "Previous Bank Charter Class", measure: "nominal", format: "enum", enumValues: CLASS_ENUM }),
    FRM_CLCODE: defineField({ type: "integer", description: "Previous Numeric Code", measure: "nominal", format: "enum" }),
    FRM_CHARTAGENT: defineField({ type: "string", description: "Previous Chartering Agency", measure: "nominal", format: "enum" }),
    FRM_REGAGENT: defineField({ type: "string", description: "Previous Chartering Agency", measure: "nominal", format: "enum" }),
    FRM_TRUST: defineField({ type: "integer", description: "Previous Trust Power", measure: "nominal", format: "enum" }),
    FRM_CNTYNAME: defineField({ type: "string", description: "Previous County", measure: "nominal", format: "text" }),
    FRM_CNTYNUM: defineField({ type: "integer", description: "Previous County Number — FIPS code.", measure: "nominal", format: "id" }),
    FRM_PADDR: defineField({ type: "string", description: "Previous Physical Street Address", measure: "nominal", format: "text" }),
    FRM_PADDR2: defineField({ type: "string", description: "Previous Physical Street Address Line 2", measure: "nominal", format: "text" }),
    FRM_PCITY: defineField({ type: "string", description: "Previous Physical City", measure: "nominal", format: "text" }),
    FRM_PSTALP: defineField({ type: "string", description: "Previous State Alpha Code", measure: "nominal", format: "text" }),
    FRM_PZIP5: defineField({ type: "string", description: "Previous Zip Code", measure: "nominal", format: "text" }),
    FRM_OFFNAME: defineField({ type: "string", description: "Previous Branch Name", measure: "nominal", format: "text" }),
    FRM_OFFNUM: defineField({ type: "integer", description: "Previous Branch Number", measure: "nominal", format: "id" }),
    FRM_OFF_NAME: defineField({ type: "string", description: "Previous Office Name", measure: "nominal", format: "text" }),
    FRM_OFF_NUM: defineField({ type: "integer", description: "Previous Office Number", measure: "nominal", format: "id" }),
    FRM_OFF_CHARTAGENT: defineField({ type: "string", description: "Previous Office Chartering Agency", measure: "nominal", format: "enum" }),
    FRM_OFF_CLASS: defineField({ type: "string", description: "Previous Office Class", measure: "nominal", format: "enum", enumValues: CLASS_ENUM }),
    FRM_OFF_CLCODE: defineField({ type: "integer", description: "Previous Office Numeric Code", measure: "nominal", format: "enum" }),
    FRM_OFF_REGAGENT: defineField({ type: "string", description: "Previous Regulator", measure: "nominal", format: "enum" }),
    FRM_OFF_TRUST: defineField({ type: "integer", description: "Previous Trust Power", measure: "nominal", format: "enum" }),
    FRM_OFF_SERVTYPE: defineField({ type: "integer", description: "Previous Service Type", measure: "nominal", format: "enum", enumValues: SERVTYPE_ENUM }),
    FRM_OFF_SERVTYPE_DESC: defineField({ type: "string", description: "Previous Service Type Description", measure: "nominal", format: "text" }),
    FRM_OFF_CNTYNAME: defineField({ type: "string", description: "Previous Office County", measure: "nominal", format: "text" }),
    FRM_OFF_CNTYNUM: defineField({ type: "integer", description: "Previous County Number — FIPS code.", measure: "nominal", format: "id" }),
    FRM_OFF_PADDR: defineField({ type: "string", description: "Previous Physical Street Address", measure: "nominal", format: "text" }),
    FRM_OFF_PADDR2: defineField({ type: "string", description: "Previous Physical Street Address Line 2", measure: "nominal", format: "text" }),
    FRM_OFF_PCITY: defineField({ type: "string", description: "Previous City", measure: "nominal", format: "text" }),
    FRM_OFF_PSTALP: defineField({ type: "string", description: "Previous State Alpha Code", measure: "nominal", format: "text" }),
    FRM_OFF_PZIP5: defineField({ type: "string", description: "Previous Zip Code", measure: "nominal", format: "text" }),
  },
});
