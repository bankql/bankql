import { defineDataset, defineField } from "../define.js";

const CLASS_ENUM = ["N", "SM", "NM", "SI", "MI", "SB", "SL", "OI", "CU", "NC", "NS"];
const SERVTYPE_ENUM = ["11", "12", "13", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"];
const REGAGENT_ENUM = ["OCC", "FDIC", "FRB", "NCUA", "OTS", "STATE"];
const FDICREGION_ENUM = ["02", "05", "09", "11", "13", "14", "16"];

export const events = defineDataset({
  name: "events",
  description:
    "FDIC structural event history — mergers, acquisitions, charter changes, openings, and closings for all institutions and branch offices.",
  index: "transactionNumber",
  fields: {
    // -------------------------------------------------------------------------
    // Event identity
    // -------------------------------------------------------------------------
    transactionNumber: defineField({
      type: "integer",
      description: "System Transaction Number — unique number identifying the change/event.",
      measure: "nominal",
      format: "id",
      sourceKey: "TRANSNUM",
    }),
    activityEventNumber: defineField({
      type: "integer",
      description: "Activity Event Number — indicates a change/event to an institution's activities or ownership over time.",
      measure: "nominal",
      format: "id",
      sourceKey: "ACT_EVT_NUM",
    }),
    activityEventDescription: defineField({
      type: "string",
      description: "Activity Event Description",
      measure: "nominal",
      format: "text",
      sourceKey: "ACT_EVT_DESC",
    }),
    changeCode: defineField({
      type: "string",
      description: "Activity Event Code",
      measure: "nominal",
      format: "enum",
      sourceKey: "CHANGECODE",
    }),
    changeCodeDescription: defineField({
      type: "string",
      description: "Activity Event Code Description",
      measure: "nominal",
      format: "text",
      sourceKey: "CHANGECODE_DESC",
    }),
    reportType: defineField({
      type: "string",
      description: "Report Type",
      measure: "nominal",
      format: "enum",
      sourceKey: "REPORT_TYPE",
    }),
    organizationRoleCode: defineField({
      type: "string",
      description: "Organization Role Code — FI (Financial Institution), BR (Branch), or PA.",
      measure: "nominal",
      format: "enum",
      enumValues: ["FI", "BR", "PA"],
      sourceKey: "ORG_ROLE_CDE",
    }),

    // -------------------------------------------------------------------------
    // Subject institution identity
    // -------------------------------------------------------------------------
    certificate: defineField({
      type: "integer",
      description: "FDIC Certificate #",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "certificate", cardinality: "many:1" },
      sourceKey: "CERT",
    }),
    uninum: defineField({
      type: "integer",
      description: "FDIC's unique number for holding companies, banks, branches and nondeposit subsidiaries.",
      measure: "nominal",
      format: "id",
      sourceKey: "UNINUM",
    }),
    name: defineField({
      type: "string",
      description: "Institution name",
      measure: "nominal",
      format: "text",
      sourceKey: "NAME",
    }),
    institutionName: defineField({
      type: "string",
      description: "Institution Name — legal name of the institution.",
      measure: "nominal",
      format: "text",
      sourceKey: "INSTNAME",
    }),
    active: defineField({
      type: "integer",
      description: "Institution Status",
      measure: "nominal",
      format: "boolean",
      sourceKey: "ACTIVE",
    }),

    // -------------------------------------------------------------------------
    // Subject institution physical address
    // -------------------------------------------------------------------------
    address: defineField({ type: "string", description: "Street Address", measure: "nominal", format: "text", sourceKey: "ADDRESS" }),
    address2: defineField({ type: "string", description: "Street Address Line 2", measure: "nominal", format: "text", sourceKey: "ADDRESS2" }),
    city: defineField({ type: "string", description: "City", measure: "nominal", format: "text", sourceKey: "CITY" }),
    stateAbbreviation: defineField({ type: "string", description: "State Alpha code", measure: "nominal", format: "text", sourceKey: "STALP" }),
    stateName: defineField({ type: "string", description: "State Name", measure: "nominal", format: "text", sourceKey: "STNAME" }),
    stateNumber: defineField({ type: "integer", description: "State Number — FIPS state code.", measure: "nominal", format: "id", sourceKey: "STNUM" }),
    zip: defineField({ type: "string", description: "Zip Code", measure: "nominal", format: "text", sourceKey: "ZIP" }),
    countyName: defineField({ type: "string", description: "County", measure: "nominal", format: "text", sourceKey: "CNTYNAME" }),
    countyNumber: defineField({ type: "integer", description: "County Number — FIPS county code.", measure: "nominal", format: "id", sourceKey: "CNTYNUM" }),

    // -------------------------------------------------------------------------
    // Subject institution physical address (PADDR variant)
    // -------------------------------------------------------------------------
    physicalAddress: defineField({ type: "string", description: "Physical Street Address", measure: "nominal", format: "text", sourceKey: "PADDR" }),
    physicalAddress2: defineField({ type: "string", description: "Physical Street Address Line 2", measure: "nominal", format: "text", sourceKey: "PADDR2" }),
    physicalCity: defineField({ type: "string", description: "Physical City", measure: "nominal", format: "text", sourceKey: "PCITY" }),
    physicalStateAbbreviation: defineField({ type: "string", description: "Physical State Alpha Code", measure: "nominal", format: "text", sourceKey: "PSTALP" }),
    physicalZip: defineField({ type: "string", description: "Physical Zip Code", measure: "nominal", format: "text", sourceKey: "PZIP5" }),

    // -------------------------------------------------------------------------
    // Subject institution mailing address
    // -------------------------------------------------------------------------
    mailingAddress: defineField({ type: "string", description: "Mailing Street Address", measure: "nominal", format: "text", sourceKey: "MADDR" }),
    mailingAddress2: defineField({ type: "string", description: "Mailing Street Address Line 2", measure: "nominal", format: "text", sourceKey: "MADDR2" }),
    mailingCity: defineField({ type: "string", description: "Mailing City", measure: "nominal", format: "text", sourceKey: "MCITY" }),
    mailingStateAbbreviation: defineField({ type: "string", description: "Mailing State Alpha Code", measure: "nominal", format: "text", sourceKey: "MSTALP" }),
    mailingZip: defineField({ type: "string", description: "Mailing Zip Code", measure: "nominal", format: "text", sourceKey: "MZIP5" }),

    // -------------------------------------------------------------------------
    // Subject institution classification
    // -------------------------------------------------------------------------
    institutionClass: defineField({
      type: "string",
      description: "Bank Charter Class",
      measure: "nominal",
      format: "enum",
      enumValues: CLASS_ENUM,
      sourceKey: "CLASS",
    }),
    classCode: defineField({
      type: "integer",
      description: "Numeric Code — two-digit identifying category of an institution.",
      measure: "nominal",
      format: "enum",
      sourceKey: "CLCODE",
    }),
    charteringAgency: defineField({
      type: "string",
      description: "Chartering Agency",
      measure: "nominal",
      format: "enum",
      enumValues: ["OCC", "OTS", "State", "Sover"],
      sourceKey: "CHARTAGENT",
    }),
    occCharterNumber: defineField({ type: "string", description: "OCC Charter Number", measure: "nominal", format: "id", sourceKey: "CHARTER" }),
    primaryRegulator: defineField({ type: "string", description: "Primary Regulator", measure: "nominal", format: "enum", enumValues: REGAGENT_ENUM, sourceKey: "REGAGENT" }),
    secondaryRegulator: defineField({ type: "string", description: "Secondary Regulator", measure: "nominal", format: "enum", enumValues: ["CFPB", "OTS"], sourceKey: "REGAGENT2" }),
    trustPowers: defineField({ type: "integer", description: "Trust Powers", measure: "nominal", format: "enum", sourceKey: "TRUST" }),
    primaryInsuranceAgency: defineField({ type: "string", description: "Insurance Fund Membership — DIF, BIF, or SAIF.", measure: "nominal", format: "enum", sourceKey: "INSAGENT1" }),
    secondaryInsuranceAgency: defineField({ type: "string", description: "Secondary Insurance Fund.", measure: "nominal", format: "enum", sourceKey: "INSAGENT2" }),
    conservatorship: defineField({ type: "integer", description: "Conservatorship flag.", measure: "nominal", format: "boolean", sourceKey: "CONSERVE" }),
    otsDocketNumber: defineField({ type: "string", description: "OTS Docket Number", measure: "nominal", format: "id", sourceKey: "DOCKET" }),
    fdicRegion: defineField({ type: "string", description: "Supervisory Region", measure: "nominal", format: "enum", enumValues: FDICREGION_ENUM, sourceKey: "FDICREGION" }),
    fdicRegionDescription: defineField({ type: "string", description: "Supervisory Region Description", measure: "nominal", format: "text", sourceKey: "FDICREGION_DESC" }),
    supervisoryRegionNumber: defineField({ type: "integer", description: "Supervisory Region Number", measure: "nominal", format: "enum", sourceKey: "SUPRV_FD" }),
    occDistrict: defineField({ type: "string", description: "Office of the Comptroller district.", measure: "nominal", format: "enum", sourceKey: "OCCDIST" }),

    // -------------------------------------------------------------------------
    // Dates
    // -------------------------------------------------------------------------
    effectiveDate: defineField({ type: "date", description: "Last Structure Change Effective Date", measure: "temporal", format: "date", sourceKey: "EFFDATE" }),
    endEffectiveDate: defineField({ type: "date", description: "End Effective Date", measure: "temporal", format: "date", sourceKey: "ENDDATE" }),
    endDate: defineField({ type: "date", description: "End date — date the institution became inactive.", measure: "temporal", format: "date", sourceKey: "ENDEFYMD" }),
    insuranceDate: defineField({ type: "date", description: "Date of Deposit Insurance", measure: "temporal", format: "date", sourceKey: "INSDATE" }),
    processDate: defineField({ type: "date", description: "Last Structure Change Process Date", measure: "temporal", format: "date", sourceKey: "PROCDATE" }),
    cfpbStartDate: defineField({ type: "date", description: "CFPB Effective Date", measure: "temporal", format: "date", sourceKey: "CFPBEFFDTE" }),
    cfpbEndDate: defineField({ type: "date", description: "CFPB End Date", measure: "temporal", format: "date", sourceKey: "CFPBENDDTE" }),
    systemLastDatetime: defineField({ type: "datetime", description: "System Last Datetime — last update to a record.", measure: "temporal", format: "datetime", sourceKey: "SYS_LST_DTETME" }),

    // -------------------------------------------------------------------------
    // Office / branch fields
    // -------------------------------------------------------------------------
    officeName: defineField({ type: "string", description: "Office Name — branch office name.", measure: "nominal", format: "text", sourceKey: "OFFNAME" }),
    officeNumber: defineField({ type: "integer", description: "Branch Number", measure: "nominal", format: "id", sourceKey: "OFFNUM" }),
    officeLegalName: defineField({ type: "string", description: "Office Name — legal name of the office.", measure: "nominal", format: "text", sourceKey: "OFF_NAME" }),
    branchNumber: defineField({ type: "integer", description: "Branch Number", measure: "nominal", format: "id", sourceKey: "OFF_NUM" }),
    officeEffectiveDate: defineField({ type: "date", description: "Office Structure Change Effective Date", measure: "temporal", format: "date", sourceKey: "OFF_EFFDATE" }),
    officeCountyName: defineField({ type: "string", description: "Office County Name", measure: "nominal", format: "text", sourceKey: "OFF_CNTYNAME" }),
    officeCountyNumber: defineField({ type: "integer", description: "Office County Number — FIPS code.", measure: "nominal", format: "id", sourceKey: "OFF_CNTYNUM" }),
    officePhysicalAddress: defineField({ type: "string", description: "Office Physical Street Address", measure: "nominal", format: "text", sourceKey: "OFF_PADDR" }),
    officePhysicalAddress2: defineField({ type: "string", description: "Office Physical Street Address Line 2", measure: "nominal", format: "text", sourceKey: "OFF_PADDR2" }),
    officePhysicalCity: defineField({ type: "string", description: "Office Physical City", measure: "nominal", format: "text", sourceKey: "OFF_PCITY" }),
    officePhysicalStateAbbreviation: defineField({ type: "string", description: "Office Physical State Alpha Code", measure: "nominal", format: "text", sourceKey: "OFF_PSTALP" }),
    officePhysicalZip: defineField({ type: "string", description: "Office Physical Zip Code", measure: "nominal", format: "text", sourceKey: "OFF_PZIP5" }),
    officeServiceType: defineField({ type: "integer", description: "Office Service Type", measure: "nominal", format: "enum", enumValues: SERVTYPE_ENUM, sourceKey: "OFF_SERVTYPE" }),
    officeServiceTypeDescription: defineField({ type: "string", description: "Office Service Type Description", measure: "nominal", format: "text", sourceKey: "OFF_SERVTYPE_DESC" }),

    // -------------------------------------------------------------------------
    // Acquiring institution
    // -------------------------------------------------------------------------
    acquiringCertificate: defineField({
      type: "integer",
      description: "Acquiring FDIC Certificate #",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "certificate", cardinality: "many:1" },
      sourceKey: "ACQ_CERT",
    }),
    acquiringUninum: defineField({ type: "integer", description: "Acquiring Unique FDIC Number", measure: "nominal", format: "id", sourceKey: "ACQ_UNINUM" }),
    acquiringInstitutionName: defineField({ type: "string", description: "Acquiring Institution Name", measure: "nominal", format: "text", sourceKey: "ACQ_INSTNAME" }),
    acquiringClass: defineField({ type: "string", description: "Acquiring Class Designation", measure: "nominal", format: "enum", enumValues: CLASS_ENUM, sourceKey: "ACQ_CLASS" }),
    acquiringClassCode: defineField({ type: "integer", description: "Acquiring Numeric Class Code", measure: "nominal", format: "enum", sourceKey: "ACQ_CLCODE" }),
    acquiringCharteringAgency: defineField({ type: "string", description: "Acquiring Chartering Agency", measure: "nominal", format: "enum", sourceKey: "ACQ_CHARTAGENT" }),
    acquiringOccCharterNumber: defineField({ type: "string", description: "Acquiring OCC Charter Number", measure: "nominal", format: "id", sourceKey: "ACQ_CHARTER" }),
    acquiringRegulator: defineField({ type: "string", description: "Acquiring Chartering Agency", measure: "nominal", format: "enum", sourceKey: "ACQ_REGAGENT" }),
    acquiringPrimaryInsuranceAgency: defineField({ type: "string", description: "Acquiring Insurance Fund Membership", measure: "nominal", format: "enum", sourceKey: "ACQ_INSAGENT1" }),
    acquiringSecondaryInsuranceAgency: defineField({ type: "string", description: "Acquiring Secondary Insurance Fund", measure: "nominal", format: "enum", sourceKey: "ACQ_INSAGENT2" }),
    acquiringTrustPowers: defineField({ type: "integer", description: "Acquiring Trust Power", measure: "nominal", format: "enum", sourceKey: "ACQ_TRUST" }),
    acquiringFdicRegion: defineField({ type: "string", description: "Acquiring Supervisory Region Number", measure: "nominal", format: "enum", enumValues: FDICREGION_ENUM, sourceKey: "ACQ_FDICREGION" }),
    acquiringFdicRegionDescription: defineField({ type: "string", description: "Acquiring Supervisory Region Description", measure: "nominal", format: "text", sourceKey: "ACQ_FDICREGION_DESC" }),
    acquiringCountyName: defineField({ type: "string", description: "Acquiring County Name", measure: "nominal", format: "text", sourceKey: "ACQ_CNTYNAME" }),
    acquiringCountyNumber: defineField({ type: "integer", description: "Acquiring County Number — FIPS code.", measure: "nominal", format: "id", sourceKey: "ACQ_CNTYNUM" }),
    acquiringPhysicalAddress: defineField({ type: "string", description: "Acquiring Physical Street Address", measure: "nominal", format: "text", sourceKey: "ACQ_PADDR" }),
    acquiringPhysicalAddress2: defineField({ type: "string", description: "Acquiring Physical Street Address Line 2", measure: "nominal", format: "text", sourceKey: "ACQ_PADDR2" }),
    acquiringPhysicalCity: defineField({ type: "string", description: "Acquiring Physical City", measure: "nominal", format: "text", sourceKey: "ACQ_PCITY" }),
    acquiringPhysicalStateAbbreviation: defineField({ type: "string", description: "Acquiring Physical State Alpha Code", measure: "nominal", format: "text", sourceKey: "ACQ_PSTALP" }),
    acquiringPhysicalZip: defineField({ type: "string", description: "Acquiring Zip Code", measure: "nominal", format: "text", sourceKey: "ACQ_PZIP5" }),
    acquiringMailingAddress: defineField({ type: "string", description: "Acquiring Mailing Street Address", measure: "nominal", format: "text", sourceKey: "ACQ_MADDR" }),
    acquiringMailingAddress2: defineField({ type: "string", description: "Acquiring Mailing Street Address Line 2", measure: "nominal", format: "text", sourceKey: "ACQ_MADDR2" }),
    acquiringMailingCity: defineField({ type: "string", description: "Acquiring Mailing City", measure: "nominal", format: "text", sourceKey: "ACQ_MCITY" }),
    acquiringMailingStateAbbreviation: defineField({ type: "string", description: "Acquiring Mailing State Abbreviation", measure: "nominal", format: "text", sourceKey: "ACQ_MSTALP" }),
    acquiringMailingZip: defineField({ type: "string", description: "Acquiring Zip Code", measure: "nominal", format: "text", sourceKey: "ACQ_MZIP5" }),
    acquiringEffectiveDate: defineField({ type: "date", description: "Acquiring Institution's Effective Date", measure: "temporal", format: "date", sourceKey: "ACQ_ORG_EFF_DTE" }),

    // -------------------------------------------------------------------------
    // Outgoing institution
    // -------------------------------------------------------------------------
    outgoingCertificate: defineField({
      type: "integer",
      description: "Outgoing FDIC Certificate #",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "certificate", cardinality: "many:1" },
      sourceKey: "OUT_CERT",
    }),
    outgoingUninum: defineField({ type: "integer", description: "Outgoing FDIC Unique Number", measure: "nominal", format: "id", sourceKey: "OUT_UNINUM" }),
    outgoingInstitutionName: defineField({ type: "string", description: "Outgoing Institution name", measure: "nominal", format: "text", sourceKey: "OUT_INSTNAME" }),
    outgoingClass: defineField({ type: "string", description: "Outgoing Class", measure: "nominal", format: "enum", enumValues: CLASS_ENUM, sourceKey: "OUT_CLASS" }),
    outgoingClassCode: defineField({ type: "integer", description: "Outgoing Class Code", measure: "nominal", format: "enum", sourceKey: "OUT_CLCODE" }),
    outgoingCharteringAgency: defineField({ type: "string", description: "Outgoing Chartering Agency", measure: "nominal", format: "enum", sourceKey: "OUT_CHARTAGENT" }),
    outgoingOccCharterNumber: defineField({ type: "string", description: "Outgoing OCC Charter Number", measure: "nominal", format: "id", sourceKey: "OUT_CHARTER" }),
    outgoingRegulator: defineField({ type: "string", description: "Outgoing Chartering Agency", measure: "nominal", format: "enum", sourceKey: "OUT_REGAGENT" }),
    outgoingPrimaryInsuranceAgency: defineField({ type: "string", description: "Outgoing Insurance Fund Membership", measure: "nominal", format: "enum", sourceKey: "OUT_INSAGENT1" }),
    outgoingSecondaryInsuranceAgency: defineField({ type: "string", description: "Outgoing Secondary Insurance Fund", measure: "nominal", format: "enum", sourceKey: "OUT_INSAGENT2" }),
    outgoingTrustPowers: defineField({ type: "integer", description: "Outgoing Trust Power", measure: "nominal", format: "enum", sourceKey: "OUT_TRUST" }),
    outgoingFdicRegion: defineField({ type: "string", description: "Outgoing FDIC Supervisory Region Number", measure: "nominal", format: "enum", enumValues: FDICREGION_ENUM, sourceKey: "OUT_FDICREGION" }),
    outgoingFdicRegionDescription: defineField({ type: "string", description: "Outgoing Supervisory Region Description", measure: "nominal", format: "text", sourceKey: "OUT_FDICREGION_DESC" }),
    outgoingCountyName: defineField({ type: "string", description: "Outgoing County Name", measure: "nominal", format: "text", sourceKey: "OUT_CNTYNAME" }),
    outgoingCountyNumber: defineField({ type: "integer", description: "Outgoing County Number — FIPS code.", measure: "nominal", format: "id", sourceKey: "OUT_CNTYNUM" }),
    outgoingPhysicalAddress: defineField({ type: "string", description: "Outgoing Physical Street Address", measure: "nominal", format: "text", sourceKey: "OUT_PADDR" }),
    outgoingPhysicalAddress2: defineField({ type: "string", description: "Outgoing Physical Street Address Line 2", measure: "nominal", format: "text", sourceKey: "OUT_PADDR2" }),
    outgoingPhysicalCity: defineField({ type: "string", description: "Outgoing Physical City", measure: "nominal", format: "text", sourceKey: "OUT_PCITY" }),
    outgoingPhysicalStateAbbreviation: defineField({ type: "string", description: "Outgoing Physical State Alpha Code", measure: "nominal", format: "text", sourceKey: "OUT_PSTALP" }),
    outgoingPhysicalZip: defineField({ type: "string", description: "Outgoing Physical Zip Code", measure: "nominal", format: "text", sourceKey: "OUT_PZIP5" }),
    outgoingMailingAddress: defineField({ type: "string", description: "Outgoing Mailing Street Address", measure: "nominal", format: "text", sourceKey: "OUT_MADDR" }),
    outgoingMailingAddress2: defineField({ type: "string", description: "Outgoing Mailing Street Address Line 2", measure: "nominal", format: "text", sourceKey: "OUT_MADDR2" }),
    outgoingMailingCity: defineField({ type: "string", description: "Outgoing Mailing City", measure: "nominal", format: "text", sourceKey: "OUT_MCITY" }),
    outgoingMailingStateAbbreviation: defineField({ type: "string", description: "Outgoing Mailing State Alpha Code", measure: "nominal", format: "text", sourceKey: "OUT_MSTALP" }),
    outgoingMailingZip: defineField({ type: "string", description: "Outgoing Mailing Zip Code", measure: "nominal", format: "text", sourceKey: "OUT_MZIP5" }),

    // -------------------------------------------------------------------------
    // Surviving institution
    // -------------------------------------------------------------------------
    survivingCertificate: defineField({
      type: "integer",
      description: "Surviving FDIC Certificate #",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "certificate", cardinality: "many:1" },
      sourceKey: "SUR_CERT",
    }),
    survivingInstitutionName: defineField({ type: "string", description: "Surviving Institution Name", measure: "nominal", format: "text", sourceKey: "SUR_INSTNAME" }),
    survivingClass: defineField({ type: "string", description: "Surviving Class", measure: "nominal", format: "enum", enumValues: CLASS_ENUM, sourceKey: "SUR_CLASS" }),
    survivingClassCode: defineField({ type: "integer", description: "Surviving Class Code", measure: "nominal", format: "enum", sourceKey: "SUR_CLCODE" }),
    survivingCharteringAgency: defineField({ type: "string", description: "Surviving Chartering Agency", measure: "nominal", format: "enum", sourceKey: "SUR_CHARTAGENT" }),
    survivingOccCharterNumber: defineField({ type: "string", description: "Surviving OCC Charter Number", measure: "nominal", format: "id", sourceKey: "SUR_CHARTER" }),
    survivingRegulator: defineField({ type: "string", description: "Surviving Chartering Agency", measure: "nominal", format: "enum", sourceKey: "SUR_REGAGENT" }),
    survivingPrimaryInsuranceAgency: defineField({ type: "string", description: "Surviving Insurance Fund Membership", measure: "nominal", format: "enum", sourceKey: "SUR_INSAGENT1" }),
    survivingSecondaryInsuranceAgency: defineField({ type: "string", description: "Surviving Secondary Insurance Fund", measure: "nominal", format: "enum", sourceKey: "SUR_INSAGENT2" }),
    survivingTrustPowers: defineField({ type: "integer", description: "Surviving Trust Power", measure: "nominal", format: "enum", sourceKey: "SUR_TRUST" }),
    survivingFdicRegion: defineField({ type: "string", description: "Surviving Supervisory Region Number", measure: "nominal", format: "enum", enumValues: FDICREGION_ENUM, sourceKey: "SUR_FDICREGION" }),
    survivingFdicRegionDescription: defineField({ type: "string", description: "Surviving Supervisory Region Description", measure: "nominal", format: "text", sourceKey: "SUR_FDICREGION_DESC" }),
    survivingCountyName: defineField({ type: "string", description: "Surviving County", measure: "nominal", format: "text", sourceKey: "SUR_CNTYNAME" }),
    survivingCountyNumber: defineField({ type: "integer", description: "Surviving County Number — FIPS code.", measure: "nominal", format: "id", sourceKey: "SUR_CNTYNUM" }),
    survivingPhysicalAddress: defineField({ type: "string", description: "Surviving Physical Street Address", measure: "nominal", format: "text", sourceKey: "SUR_PADDR" }),
    survivingPhysicalAddress2: defineField({ type: "string", description: "Surviving Physical Street Address Line 2", measure: "nominal", format: "text", sourceKey: "SUR_PADDR2" }),
    survivingPhysicalCity: defineField({ type: "string", description: "Surviving Physical City", measure: "nominal", format: "text", sourceKey: "SUR_PCITY" }),
    survivingPhysicalStateAbbreviation: defineField({ type: "string", description: "Surviving Physical State Alpha Code", measure: "nominal", format: "text", sourceKey: "SUR_PSTALP" }),
    survivingPhysicalZip: defineField({ type: "string", description: "Surviving Physical Zip Code", measure: "nominal", format: "text", sourceKey: "SUR_PZIP5" }),
    survivingMailingAddress: defineField({ type: "string", description: "Surviving Mailing Street Address", measure: "nominal", format: "text", sourceKey: "SUR_MADDR" }),
    survivingMailingAddress2: defineField({ type: "string", description: "Surviving Mailing Street Address Line 2", measure: "nominal", format: "text", sourceKey: "SUR_MADDR2" }),
    survivingMailingCity: defineField({ type: "string", description: "Surviving Mailing City", measure: "nominal", format: "text", sourceKey: "SUR_MCITY" }),
    survivingMailingStateAbbreviation: defineField({ type: "string", description: "Surviving Mailing State Alpha Code", measure: "nominal", format: "text", sourceKey: "SUR_MSTALP" }),
    survivingMailingZip: defineField({ type: "string", description: "Surviving Mailing Zip Code", measure: "nominal", format: "text", sourceKey: "SUR_MZIP5" }),
    survivingChangeCode: defineField({ type: "string", description: "Surviving Activity Event Code", measure: "nominal", format: "enum", sourceKey: "SUR_CHANGECODE" }),

    // -------------------------------------------------------------------------
    // Previous institution state (FRM_*)
    // -------------------------------------------------------------------------
    previousCertificate: defineField({
      type: "integer",
      description: "Previous FDIC Certificate #",
      measure: "nominal",
      format: "id",
      sourceKey: "FRM_CERT",
    }),
    previousInstitutionName: defineField({ type: "string", description: "Previous Institution Name", measure: "nominal", format: "text", sourceKey: "FRM_INSTNAME" }),
    previousClass: defineField({ type: "string", description: "Previous Bank Charter Class", measure: "nominal", format: "enum", enumValues: CLASS_ENUM, sourceKey: "FRM_CLASS" }),
    previousClassCode: defineField({ type: "integer", description: "Previous Numeric Code", measure: "nominal", format: "enum", sourceKey: "FRM_CLCODE" }),
    previousCharteringAgency: defineField({ type: "string", description: "Previous Chartering Agency", measure: "nominal", format: "enum", sourceKey: "FRM_CHARTAGENT" }),
    previousRegulator: defineField({ type: "string", description: "Previous Chartering Agency", measure: "nominal", format: "enum", sourceKey: "FRM_REGAGENT" }),
    previousTrustPowers: defineField({ type: "integer", description: "Previous Trust Power", measure: "nominal", format: "enum", sourceKey: "FRM_TRUST" }),
    previousCountyName: defineField({ type: "string", description: "Previous County", measure: "nominal", format: "text", sourceKey: "FRM_CNTYNAME" }),
    previousCountyNumber: defineField({ type: "integer", description: "Previous County Number — FIPS code.", measure: "nominal", format: "id", sourceKey: "FRM_CNTYNUM" }),
    previousPhysicalAddress: defineField({ type: "string", description: "Previous Physical Street Address", measure: "nominal", format: "text", sourceKey: "FRM_PADDR" }),
    previousPhysicalAddress2: defineField({ type: "string", description: "Previous Physical Street Address Line 2", measure: "nominal", format: "text", sourceKey: "FRM_PADDR2" }),
    previousPhysicalCity: defineField({ type: "string", description: "Previous Physical City", measure: "nominal", format: "text", sourceKey: "FRM_PCITY" }),
    previousPhysicalStateAbbreviation: defineField({ type: "string", description: "Previous State Alpha Code", measure: "nominal", format: "text", sourceKey: "FRM_PSTALP" }),
    previousPhysicalZip: defineField({ type: "string", description: "Previous Zip Code", measure: "nominal", format: "text", sourceKey: "FRM_PZIP5" }),
    previousOfficeName: defineField({ type: "string", description: "Previous Branch Name", measure: "nominal", format: "text", sourceKey: "FRM_OFFNAME" }),
    previousOfficeNumber: defineField({ type: "integer", description: "Previous Branch Number", measure: "nominal", format: "id", sourceKey: "FRM_OFFNUM" }),
    previousOfficeLegalName: defineField({ type: "string", description: "Previous Office Name", measure: "nominal", format: "text", sourceKey: "FRM_OFF_NAME" }),
    previousBranchNumber: defineField({ type: "integer", description: "Previous Office Number", measure: "nominal", format: "id", sourceKey: "FRM_OFF_NUM" }),
    previousOfficeCharteringAgency: defineField({ type: "string", description: "Previous Office Chartering Agency", measure: "nominal", format: "enum", sourceKey: "FRM_OFF_CHARTAGENT" }),
    previousOfficeClass: defineField({ type: "string", description: "Previous Office Class", measure: "nominal", format: "enum", enumValues: CLASS_ENUM, sourceKey: "FRM_OFF_CLASS" }),
    previousOfficeClassCode: defineField({ type: "integer", description: "Previous Office Numeric Code", measure: "nominal", format: "enum", sourceKey: "FRM_OFF_CLCODE" }),
    previousOfficeRegulator: defineField({ type: "string", description: "Previous Regulator", measure: "nominal", format: "enum", sourceKey: "FRM_OFF_REGAGENT" }),
    previousOfficeTrustPowers: defineField({ type: "integer", description: "Previous Trust Power", measure: "nominal", format: "enum", sourceKey: "FRM_OFF_TRUST" }),
    previousOfficeServiceType: defineField({ type: "integer", description: "Previous Service Type", measure: "nominal", format: "enum", enumValues: SERVTYPE_ENUM, sourceKey: "FRM_OFF_SERVTYPE" }),
    previousOfficeServiceTypeDescription: defineField({ type: "string", description: "Previous Service Type Description", measure: "nominal", format: "text", sourceKey: "FRM_OFF_SERVTYPE_DESC" }),
    previousOfficeCountyName: defineField({ type: "string", description: "Previous Office County", measure: "nominal", format: "text", sourceKey: "FRM_OFF_CNTYNAME" }),
    previousOfficeCountyNumber: defineField({ type: "integer", description: "Previous County Number — FIPS code.", measure: "nominal", format: "id", sourceKey: "FRM_OFF_CNTYNUM" }),
    previousOfficePhysicalAddress: defineField({ type: "string", description: "Previous Physical Street Address", measure: "nominal", format: "text", sourceKey: "FRM_OFF_PADDR" }),
    previousOfficePhysicalAddress2: defineField({ type: "string", description: "Previous Physical Street Address Line 2", measure: "nominal", format: "text", sourceKey: "FRM_OFF_PADDR2" }),
    previousOfficePhysicalCity: defineField({ type: "string", description: "Previous City", measure: "nominal", format: "text", sourceKey: "FRM_OFF_PCITY" }),
    previousOfficePhysicalStateAbbreviation: defineField({ type: "string", description: "Previous State Alpha Code", measure: "nominal", format: "text", sourceKey: "FRM_OFF_PSTALP" }),
    previousOfficePhysicalZip: defineField({ type: "string", description: "Previous Zip Code", measure: "nominal", format: "text", sourceKey: "FRM_OFF_PZIP5" }),
  },
});
