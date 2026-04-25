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
      label: "Transaction Number",
      description: "System Transaction Number — unique number identifying the change/event.",
      measure: "nominal",
      format: "id",
      sourceKey: "TRANSNUM",
    }),
    activityEventNumber: defineField({
      type: "integer",
      label: "Activity Event Number",
      description: "Activity Event Number — indicates a change/event to an institution's activities or ownership over time.",
      measure: "nominal",
      format: "id",
      sourceKey: "ACT_EVT_NUM",
    }),
    activityEventDescription: defineField({
      type: "string",
      label: "Activity Event Description",
      description: "Activity Event Description",
      measure: "nominal",
      format: "text",
      sourceKey: "ACT_EVT_DESC",
    }),
    changeCode: defineField({
      type: "string",
      label: "Change Code",
      description: "Activity Event Code",
      measure: "nominal",
      format: "enum",
      sourceKey: "CHANGECODE",
    }),
    changeCodeDescription: defineField({
      type: "string",
      label: "Change Code Description",
      description: "Activity Event Code Description",
      measure: "nominal",
      format: "text",
      sourceKey: "CHANGECODE_DESC",
    }),
    reportType: defineField({
      type: "string",
      label: "Report Type",
      description: "Report Type",
      measure: "nominal",
      format: "enum",
      sourceKey: "REPORT_TYPE",
    }),
    organizationRoleCode: defineField({
      type: "string",
      label: "Organization Role Code",
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
      label: "FDIC Certificate Number",
      description: "FDIC Certificate #",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "certificate", cardinality: "many:1" },
      sourceKey: "CERT",
    }),
    uninum: defineField({
      type: "integer",
      label: "FDIC UNINUM",
      description: "FDIC's unique number for holding companies, banks, branches and nondeposit subsidiaries.",
      measure: "nominal",
      format: "id",
      sourceKey: "UNINUM",
    }),
    name: defineField({
      type: "string",
      label: "Name",
      description: "Institution name",
      measure: "nominal",
      format: "text",
      sourceKey: "NAME",
    }),
    institutionName: defineField({
      type: "string",
      label: "Institution Name",
      description: "Institution Name — legal name of the institution.",
      measure: "nominal",
      format: "text",
      sourceKey: "INSTNAME",
    }),
    active: defineField({
      type: "integer",
      label: "Active",
      description: "Institution Status",
      measure: "nominal",
      format: "boolean",
      sourceKey: "ACTIVE",
    }),

    // -------------------------------------------------------------------------
    // Subject institution physical address
    // -------------------------------------------------------------------------
    address: defineField({ type: "string", label: "Street Address", description: "Street Address", measure: "nominal", format: "text", sourceKey: "ADDRESS" }),
    address2: defineField({ type: "string", label: "Street Address Line 2", description: "Street Address Line 2", measure: "nominal", format: "text", sourceKey: "ADDRESS2" }),
    city: defineField({ type: "string", label: "City", description: "City", measure: "nominal", format: "text", sourceKey: "CITY" }),
    stateAbbreviation: defineField({ type: "string", label: "State Abbreviation", description: "State Alpha code", measure: "nominal", format: "text", sourceKey: "STALP" }),
    stateName: defineField({ type: "string", label: "State Name", description: "State Name", measure: "nominal", format: "text", sourceKey: "STNAME" }),
    stateNumber: defineField({ type: "integer", label: "FIPS State Number", description: "State Number — FIPS state code.", measure: "nominal", format: "id", sourceKey: "STNUM" }),
    zip: defineField({ type: "string", label: "ZIP Code", description: "Zip Code", measure: "nominal", format: "text", sourceKey: "ZIP" }),
    countyName: defineField({ type: "string", label: "County", description: "County", measure: "nominal", format: "text", sourceKey: "CNTYNAME" }),
    countyNumber: defineField({ type: "integer", label: "FIPS County Number", description: "County Number — FIPS county code.", measure: "nominal", format: "id", sourceKey: "CNTYNUM" }),

    // -------------------------------------------------------------------------
    // Subject institution physical address (PADDR variant)
    // -------------------------------------------------------------------------
    physicalAddress: defineField({ type: "string", label: "Physical Street Address", description: "Physical Street Address", measure: "nominal", format: "text", sourceKey: "PADDR" }),
    physicalAddress2: defineField({ type: "string", label: "Physical Street Address Line 2", description: "Physical Street Address Line 2", measure: "nominal", format: "text", sourceKey: "PADDR2" }),
    physicalCity: defineField({ type: "string", label: "Physical City", description: "Physical City", measure: "nominal", format: "text", sourceKey: "PCITY" }),
    physicalStateAbbreviation: defineField({ type: "string", label: "Physical State Abbreviation", description: "Physical State Alpha Code", measure: "nominal", format: "text", sourceKey: "PSTALP" }),
    physicalZip: defineField({ type: "string", label: "Physical ZIP Code", description: "Physical Zip Code", measure: "nominal", format: "text", sourceKey: "PZIP5" }),

    // -------------------------------------------------------------------------
    // Subject institution mailing address
    // -------------------------------------------------------------------------
    mailingAddress: defineField({ type: "string", label: "Mailing Street Address", description: "Mailing Street Address", measure: "nominal", format: "text", sourceKey: "MADDR" }),
    mailingAddress2: defineField({ type: "string", label: "Mailing Street Address Line 2", description: "Mailing Street Address Line 2", measure: "nominal", format: "text", sourceKey: "MADDR2" }),
    mailingCity: defineField({ type: "string", label: "Mailing City", description: "Mailing City", measure: "nominal", format: "text", sourceKey: "MCITY" }),
    mailingStateAbbreviation: defineField({ type: "string", label: "Mailing State Abbreviation", description: "Mailing State Alpha Code", measure: "nominal", format: "text", sourceKey: "MSTALP" }),
    mailingZip: defineField({ type: "string", label: "Mailing ZIP Code", description: "Mailing Zip Code", measure: "nominal", format: "text", sourceKey: "MZIP5" }),

    // -------------------------------------------------------------------------
    // Subject institution classification
    // -------------------------------------------------------------------------
    institutionClass: defineField({
      type: "string",
      label: "Bank Charter Class",
      description: "Bank Charter Class",
      measure: "nominal",
      format: "enum",
      enumValues: CLASS_ENUM,
      sourceKey: "CLASS",
    }),
    classCode: defineField({
      type: "integer",
      label: "Class Code",
      description: "Numeric Code — two-digit identifying category of an institution.",
      measure: "nominal",
      format: "enum",
      sourceKey: "CLCODE",
    }),
    charteringAgency: defineField({
      type: "string",
      label: "Chartering Agency",
      description: "Chartering Agency",
      measure: "nominal",
      format: "enum",
      enumValues: ["OCC", "OTS", "State", "Sover"],
      sourceKey: "CHARTAGENT",
    }),
    occCharterNumber: defineField({ type: "string", label: "OCC Charter Number", description: "OCC Charter Number", measure: "nominal", format: "id", sourceKey: "CHARTER" }),
    primaryRegulator: defineField({ type: "string", label: "Primary Regulator", description: "Primary Regulator", measure: "nominal", format: "enum", enumValues: REGAGENT_ENUM, sourceKey: "REGAGENT" }),
    secondaryRegulator: defineField({ type: "string", label: "Secondary Regulator", description: "Secondary Regulator", measure: "nominal", format: "enum", enumValues: ["CFPB", "OTS"], sourceKey: "REGAGENT2" }),
    trustPowers: defineField({ type: "integer", label: "Trust Powers", description: "Trust Powers", measure: "nominal", format: "enum", sourceKey: "TRUST" }),
    primaryInsuranceAgency: defineField({ type: "string", label: "Primary Insurance Agency", description: "Insurance Fund Membership — DIF, BIF, or SAIF.", measure: "nominal", format: "enum", sourceKey: "INSAGENT1" }),
    secondaryInsuranceAgency: defineField({ type: "string", label: "Secondary Insurance Agency", description: "Secondary Insurance Fund.", measure: "nominal", format: "enum", sourceKey: "INSAGENT2" }),
    conservatorship: defineField({ type: "integer", label: "Conservatorship", description: "Conservatorship flag.", measure: "nominal", format: "boolean", sourceKey: "CONSERVE" }),
    otsDocketNumber: defineField({ type: "string", label: "OTS Docket Number", description: "OTS Docket Number", measure: "nominal", format: "id", sourceKey: "DOCKET" }),
    fdicRegion: defineField({ type: "string", label: "FDIC Supervisory Region", description: "Supervisory Region", measure: "nominal", format: "enum", enumValues: FDICREGION_ENUM, sourceKey: "FDICREGION" }),
    fdicRegionDescription: defineField({ type: "string", label: "FDIC Supervisory Region Description", description: "Supervisory Region Description", measure: "nominal", format: "text", sourceKey: "FDICREGION_DESC" }),
    supervisoryRegionNumber: defineField({ type: "integer", label: "Supervisory Region Number", description: "Supervisory Region Number", measure: "nominal", format: "enum", sourceKey: "SUPRV_FD" }),
    occDistrict: defineField({ type: "string", label: "OCC District", description: "Office of the Comptroller district.", measure: "nominal", format: "enum", sourceKey: "OCCDIST" }),

    // -------------------------------------------------------------------------
    // Dates
    // -------------------------------------------------------------------------
    effectiveDate: defineField({ type: "date", label: "Effective Date", description: "Last Structure Change Effective Date", measure: "temporal", format: "date", sourceKey: "EFFDATE" }),
    endEffectiveDate: defineField({ type: "date", label: "End Effective Date", description: "End Effective Date", measure: "temporal", format: "date", sourceKey: "ENDDATE" }),
    endDate: defineField({ type: "date", label: "End Date", description: "End date — date the institution became inactive.", measure: "temporal", format: "date", sourceKey: "ENDEFYMD" }),
    insuranceDate: defineField({ type: "date", label: "Insurance Date", description: "Date of Deposit Insurance", measure: "temporal", format: "date", sourceKey: "INSDATE" }),
    processDate: defineField({ type: "date", label: "Process Date", description: "Last Structure Change Process Date", measure: "temporal", format: "date", sourceKey: "PROCDATE" }),
    cfpbStartDate: defineField({ type: "date", label: "CFPB Start Date", description: "CFPB Effective Date", measure: "temporal", format: "date", sourceKey: "CFPBEFFDTE" }),
    cfpbEndDate: defineField({ type: "date", label: "CFPB End Date", description: "CFPB End Date", measure: "temporal", format: "date", sourceKey: "CFPBENDDTE" }),
    systemLastDatetime: defineField({ type: "datetime", label: "System Last Updated", description: "System Last Datetime — last update to a record.", measure: "temporal", format: "datetime", sourceKey: "SYS_LST_DTETME" }),

    // -------------------------------------------------------------------------
    // Office / branch fields
    // -------------------------------------------------------------------------
    officeName: defineField({ type: "string", label: "Office Name", description: "Office Name — branch office name.", measure: "nominal", format: "text", sourceKey: "OFFNAME" }),
    officeNumber: defineField({ type: "integer", label: "Office Number", description: "Branch Number", measure: "nominal", format: "id", sourceKey: "OFFNUM" }),
    officeLegalName: defineField({ type: "string", label: "Office Legal Name", description: "Office Name — legal name of the office.", measure: "nominal", format: "text", sourceKey: "OFF_NAME" }),
    branchNumber: defineField({ type: "integer", label: "Branch Number", description: "Branch Number", measure: "nominal", format: "id", sourceKey: "OFF_NUM" }),
    officeEffectiveDate: defineField({ type: "date", label: "Office Effective Date", description: "Office Structure Change Effective Date", measure: "temporal", format: "date", sourceKey: "OFF_EFFDATE" }),
    officeCountyName: defineField({ type: "string", label: "Office County Name", description: "Office County Name", measure: "nominal", format: "text", sourceKey: "OFF_CNTYNAME" }),
    officeCountyNumber: defineField({ type: "integer", label: "Office FIPS County Number", description: "Office County Number — FIPS code.", measure: "nominal", format: "id", sourceKey: "OFF_CNTYNUM" }),
    officePhysicalAddress: defineField({ type: "string", label: "Office Physical Street Address", description: "Office Physical Street Address", measure: "nominal", format: "text", sourceKey: "OFF_PADDR" }),
    officePhysicalAddress2: defineField({ type: "string", label: "Office Physical Street Address Line 2", description: "Office Physical Street Address Line 2", measure: "nominal", format: "text", sourceKey: "OFF_PADDR2" }),
    officePhysicalCity: defineField({ type: "string", label: "Office Physical City", description: "Office Physical City", measure: "nominal", format: "text", sourceKey: "OFF_PCITY" }),
    officePhysicalStateAbbreviation: defineField({ type: "string", label: "Office Physical State Abbreviation", description: "Office Physical State Alpha Code", measure: "nominal", format: "text", sourceKey: "OFF_PSTALP" }),
    officePhysicalZip: defineField({ type: "string", label: "Office Physical ZIP Code", description: "Office Physical Zip Code", measure: "nominal", format: "text", sourceKey: "OFF_PZIP5" }),
    officeServiceType: defineField({ type: "integer", label: "Office Service Type", description: "Office Service Type", measure: "nominal", format: "enum", enumValues: SERVTYPE_ENUM, sourceKey: "OFF_SERVTYPE" }),
    officeServiceTypeDescription: defineField({ type: "string", label: "Office Service Type Description", description: "Office Service Type Description", measure: "nominal", format: "text", sourceKey: "OFF_SERVTYPE_DESC" }),

    // -------------------------------------------------------------------------
    // Acquiring institution
    // -------------------------------------------------------------------------
    acquiringCertificate: defineField({
      type: "integer",
      label: "Acquiring FDIC Certificate Number",
      description: "Acquiring FDIC Certificate #",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "certificate", cardinality: "many:1" },
      sourceKey: "ACQ_CERT",
    }),
    acquiringUninum: defineField({ type: "integer", label: "Acquiring UNINUM", description: "Acquiring Unique FDIC Number", measure: "nominal", format: "id", sourceKey: "ACQ_UNINUM" }),
    acquiringInstitutionName: defineField({ type: "string", label: "Acquiring Institution Name", description: "Acquiring Institution Name", measure: "nominal", format: "text", sourceKey: "ACQ_INSTNAME" }),
    acquiringClass: defineField({ type: "string", label: "Acquiring Class", description: "Acquiring Class Designation", measure: "nominal", format: "enum", enumValues: CLASS_ENUM, sourceKey: "ACQ_CLASS" }),
    acquiringClassCode: defineField({ type: "integer", label: "Acquiring Class Code", description: "Acquiring Numeric Class Code", measure: "nominal", format: "enum", sourceKey: "ACQ_CLCODE" }),
    acquiringCharteringAgency: defineField({ type: "string", label: "Acquiring Chartering Agency", description: "Acquiring Chartering Agency", measure: "nominal", format: "enum", sourceKey: "ACQ_CHARTAGENT" }),
    acquiringOccCharterNumber: defineField({ type: "string", label: "Acquiring OCC Charter Number", description: "Acquiring OCC Charter Number", measure: "nominal", format: "id", sourceKey: "ACQ_CHARTER" }),
    acquiringRegulator: defineField({ type: "string", label: "Acquiring Regulator", description: "Acquiring Chartering Agency", measure: "nominal", format: "enum", sourceKey: "ACQ_REGAGENT" }),
    acquiringPrimaryInsuranceAgency: defineField({ type: "string", label: "Acquiring Primary Insurance Agency", description: "Acquiring Insurance Fund Membership", measure: "nominal", format: "enum", sourceKey: "ACQ_INSAGENT1" }),
    acquiringSecondaryInsuranceAgency: defineField({ type: "string", label: "Acquiring Secondary Insurance Agency", description: "Acquiring Secondary Insurance Fund", measure: "nominal", format: "enum", sourceKey: "ACQ_INSAGENT2" }),
    acquiringTrustPowers: defineField({ type: "integer", label: "Acquiring Trust Powers", description: "Acquiring Trust Power", measure: "nominal", format: "enum", sourceKey: "ACQ_TRUST" }),
    acquiringFdicRegion: defineField({ type: "string", label: "Acquiring FDIC Supervisory Region", description: "Acquiring Supervisory Region Number", measure: "nominal", format: "enum", enumValues: FDICREGION_ENUM, sourceKey: "ACQ_FDICREGION" }),
    acquiringFdicRegionDescription: defineField({ type: "string", label: "Acquiring FDIC Supervisory Region Description", description: "Acquiring Supervisory Region Description", measure: "nominal", format: "text", sourceKey: "ACQ_FDICREGION_DESC" }),
    acquiringCountyName: defineField({ type: "string", label: "Acquiring County Name", description: "Acquiring County Name", measure: "nominal", format: "text", sourceKey: "ACQ_CNTYNAME" }),
    acquiringCountyNumber: defineField({ type: "integer", label: "Acquiring FIPS County Number", description: "Acquiring County Number — FIPS code.", measure: "nominal", format: "id", sourceKey: "ACQ_CNTYNUM" }),
    acquiringPhysicalAddress: defineField({ type: "string", label: "Acquiring Physical Street Address", description: "Acquiring Physical Street Address", measure: "nominal", format: "text", sourceKey: "ACQ_PADDR" }),
    acquiringPhysicalAddress2: defineField({ type: "string", label: "Acquiring Physical Street Address Line 2", description: "Acquiring Physical Street Address Line 2", measure: "nominal", format: "text", sourceKey: "ACQ_PADDR2" }),
    acquiringPhysicalCity: defineField({ type: "string", label: "Acquiring Physical City", description: "Acquiring Physical City", measure: "nominal", format: "text", sourceKey: "ACQ_PCITY" }),
    acquiringPhysicalStateAbbreviation: defineField({ type: "string", label: "Acquiring Physical State Abbreviation", description: "Acquiring Physical State Alpha Code", measure: "nominal", format: "text", sourceKey: "ACQ_PSTALP" }),
    acquiringPhysicalZip: defineField({ type: "string", label: "Acquiring Physical ZIP Code", description: "Acquiring Zip Code", measure: "nominal", format: "text", sourceKey: "ACQ_PZIP5" }),
    acquiringMailingAddress: defineField({ type: "string", label: "Acquiring Mailing Street Address", description: "Acquiring Mailing Street Address", measure: "nominal", format: "text", sourceKey: "ACQ_MADDR" }),
    acquiringMailingAddress2: defineField({ type: "string", label: "Acquiring Mailing Street Address Line 2", description: "Acquiring Mailing Street Address Line 2", measure: "nominal", format: "text", sourceKey: "ACQ_MADDR2" }),
    acquiringMailingCity: defineField({ type: "string", label: "Acquiring Mailing City", description: "Acquiring Mailing City", measure: "nominal", format: "text", sourceKey: "ACQ_MCITY" }),
    acquiringMailingStateAbbreviation: defineField({ type: "string", label: "Acquiring Mailing State Abbreviation", description: "Acquiring Mailing State Abbreviation", measure: "nominal", format: "text", sourceKey: "ACQ_MSTALP" }),
    acquiringMailingZip: defineField({ type: "string", label: "Acquiring Mailing ZIP Code", description: "Acquiring Zip Code", measure: "nominal", format: "text", sourceKey: "ACQ_MZIP5" }),
    acquiringEffectiveDate: defineField({ type: "date", label: "Acquiring Effective Date", description: "Acquiring Institution's Effective Date", measure: "temporal", format: "date", sourceKey: "ACQ_ORG_EFF_DTE" }),

    // -------------------------------------------------------------------------
    // Outgoing institution
    // -------------------------------------------------------------------------
    outgoingCertificate: defineField({
      type: "integer",
      label: "Outgoing FDIC Certificate Number",
      description: "Outgoing FDIC Certificate #",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "certificate", cardinality: "many:1" },
      sourceKey: "OUT_CERT",
    }),
    outgoingUninum: defineField({ type: "integer", label: "Outgoing UNINUM", description: "Outgoing FDIC Unique Number", measure: "nominal", format: "id", sourceKey: "OUT_UNINUM" }),
    outgoingInstitutionName: defineField({ type: "string", label: "Outgoing Institution Name", description: "Outgoing Institution name", measure: "nominal", format: "text", sourceKey: "OUT_INSTNAME" }),
    outgoingClass: defineField({ type: "string", label: "Outgoing Class", description: "Outgoing Class", measure: "nominal", format: "enum", enumValues: CLASS_ENUM, sourceKey: "OUT_CLASS" }),
    outgoingClassCode: defineField({ type: "integer", label: "Outgoing Class Code", description: "Outgoing Class Code", measure: "nominal", format: "enum", sourceKey: "OUT_CLCODE" }),
    outgoingCharteringAgency: defineField({ type: "string", label: "Outgoing Chartering Agency", description: "Outgoing Chartering Agency", measure: "nominal", format: "enum", sourceKey: "OUT_CHARTAGENT" }),
    outgoingOccCharterNumber: defineField({ type: "string", label: "Outgoing OCC Charter Number", description: "Outgoing OCC Charter Number", measure: "nominal", format: "id", sourceKey: "OUT_CHARTER" }),
    outgoingRegulator: defineField({ type: "string", label: "Outgoing Regulator", description: "Outgoing Chartering Agency", measure: "nominal", format: "enum", sourceKey: "OUT_REGAGENT" }),
    outgoingPrimaryInsuranceAgency: defineField({ type: "string", label: "Outgoing Primary Insurance Agency", description: "Outgoing Insurance Fund Membership", measure: "nominal", format: "enum", sourceKey: "OUT_INSAGENT1" }),
    outgoingSecondaryInsuranceAgency: defineField({ type: "string", label: "Outgoing Secondary Insurance Agency", description: "Outgoing Secondary Insurance Fund", measure: "nominal", format: "enum", sourceKey: "OUT_INSAGENT2" }),
    outgoingTrustPowers: defineField({ type: "integer", label: "Outgoing Trust Powers", description: "Outgoing Trust Power", measure: "nominal", format: "enum", sourceKey: "OUT_TRUST" }),
    outgoingFdicRegion: defineField({ type: "string", label: "Outgoing FDIC Supervisory Region", description: "Outgoing FDIC Supervisory Region Number", measure: "nominal", format: "enum", enumValues: FDICREGION_ENUM, sourceKey: "OUT_FDICREGION" }),
    outgoingFdicRegionDescription: defineField({ type: "string", label: "Outgoing FDIC Supervisory Region Description", description: "Outgoing Supervisory Region Description", measure: "nominal", format: "text", sourceKey: "OUT_FDICREGION_DESC" }),
    outgoingCountyName: defineField({ type: "string", label: "Outgoing County Name", description: "Outgoing County Name", measure: "nominal", format: "text", sourceKey: "OUT_CNTYNAME" }),
    outgoingCountyNumber: defineField({ type: "integer", label: "Outgoing FIPS County Number", description: "Outgoing County Number — FIPS code.", measure: "nominal", format: "id", sourceKey: "OUT_CNTYNUM" }),
    outgoingPhysicalAddress: defineField({ type: "string", label: "Outgoing Physical Street Address", description: "Outgoing Physical Street Address", measure: "nominal", format: "text", sourceKey: "OUT_PADDR" }),
    outgoingPhysicalAddress2: defineField({ type: "string", label: "Outgoing Physical Street Address Line 2", description: "Outgoing Physical Street Address Line 2", measure: "nominal", format: "text", sourceKey: "OUT_PADDR2" }),
    outgoingPhysicalCity: defineField({ type: "string", label: "Outgoing Physical City", description: "Outgoing Physical City", measure: "nominal", format: "text", sourceKey: "OUT_PCITY" }),
    outgoingPhysicalStateAbbreviation: defineField({ type: "string", label: "Outgoing Physical State Abbreviation", description: "Outgoing Physical State Alpha Code", measure: "nominal", format: "text", sourceKey: "OUT_PSTALP" }),
    outgoingPhysicalZip: defineField({ type: "string", label: "Outgoing Physical ZIP Code", description: "Outgoing Physical Zip Code", measure: "nominal", format: "text", sourceKey: "OUT_PZIP5" }),
    outgoingMailingAddress: defineField({ type: "string", label: "Outgoing Mailing Street Address", description: "Outgoing Mailing Street Address", measure: "nominal", format: "text", sourceKey: "OUT_MADDR" }),
    outgoingMailingAddress2: defineField({ type: "string", label: "Outgoing Mailing Street Address Line 2", description: "Outgoing Mailing Street Address Line 2", measure: "nominal", format: "text", sourceKey: "OUT_MADDR2" }),
    outgoingMailingCity: defineField({ type: "string", label: "Outgoing Mailing City", description: "Outgoing Mailing City", measure: "nominal", format: "text", sourceKey: "OUT_MCITY" }),
    outgoingMailingStateAbbreviation: defineField({ type: "string", label: "Outgoing Mailing State Abbreviation", description: "Outgoing Mailing State Alpha Code", measure: "nominal", format: "text", sourceKey: "OUT_MSTALP" }),
    outgoingMailingZip: defineField({ type: "string", label: "Outgoing Mailing ZIP Code", description: "Outgoing Mailing Zip Code", measure: "nominal", format: "text", sourceKey: "OUT_MZIP5" }),

    // -------------------------------------------------------------------------
    // Surviving institution
    // -------------------------------------------------------------------------
    survivingCertificate: defineField({
      type: "integer",
      label: "Surviving FDIC Certificate Number",
      description: "Surviving FDIC Certificate #",
      measure: "nominal",
      format: "id",
      relation: { dataset: "institutions", field: "certificate", cardinality: "many:1" },
      sourceKey: "SUR_CERT",
    }),
    survivingInstitutionName: defineField({ type: "string", label: "Surviving Institution Name", description: "Surviving Institution Name", measure: "nominal", format: "text", sourceKey: "SUR_INSTNAME" }),
    survivingClass: defineField({ type: "string", label: "Surviving Class", description: "Surviving Class", measure: "nominal", format: "enum", enumValues: CLASS_ENUM, sourceKey: "SUR_CLASS" }),
    survivingClassCode: defineField({ type: "integer", label: "Surviving Class Code", description: "Surviving Class Code", measure: "nominal", format: "enum", sourceKey: "SUR_CLCODE" }),
    survivingCharteringAgency: defineField({ type: "string", label: "Surviving Chartering Agency", description: "Surviving Chartering Agency", measure: "nominal", format: "enum", sourceKey: "SUR_CHARTAGENT" }),
    survivingOccCharterNumber: defineField({ type: "string", label: "Surviving OCC Charter Number", description: "Surviving OCC Charter Number", measure: "nominal", format: "id", sourceKey: "SUR_CHARTER" }),
    survivingRegulator: defineField({ type: "string", label: "Surviving Regulator", description: "Surviving Chartering Agency", measure: "nominal", format: "enum", sourceKey: "SUR_REGAGENT" }),
    survivingPrimaryInsuranceAgency: defineField({ type: "string", label: "Surviving Primary Insurance Agency", description: "Surviving Insurance Fund Membership", measure: "nominal", format: "enum", sourceKey: "SUR_INSAGENT1" }),
    survivingSecondaryInsuranceAgency: defineField({ type: "string", label: "Surviving Secondary Insurance Agency", description: "Surviving Secondary Insurance Fund", measure: "nominal", format: "enum", sourceKey: "SUR_INSAGENT2" }),
    survivingTrustPowers: defineField({ type: "integer", label: "Surviving Trust Powers", description: "Surviving Trust Power", measure: "nominal", format: "enum", sourceKey: "SUR_TRUST" }),
    survivingFdicRegion: defineField({ type: "string", label: "Surviving FDIC Supervisory Region", description: "Surviving Supervisory Region Number", measure: "nominal", format: "enum", enumValues: FDICREGION_ENUM, sourceKey: "SUR_FDICREGION" }),
    survivingFdicRegionDescription: defineField({ type: "string", label: "Surviving FDIC Supervisory Region Description", description: "Surviving Supervisory Region Description", measure: "nominal", format: "text", sourceKey: "SUR_FDICREGION_DESC" }),
    survivingCountyName: defineField({ type: "string", label: "Surviving County", description: "Surviving County", measure: "nominal", format: "text", sourceKey: "SUR_CNTYNAME" }),
    survivingCountyNumber: defineField({ type: "integer", label: "Surviving FIPS County Number", description: "Surviving County Number — FIPS code.", measure: "nominal", format: "id", sourceKey: "SUR_CNTYNUM" }),
    survivingPhysicalAddress: defineField({ type: "string", label: "Surviving Physical Street Address", description: "Surviving Physical Street Address", measure: "nominal", format: "text", sourceKey: "SUR_PADDR" }),
    survivingPhysicalAddress2: defineField({ type: "string", label: "Surviving Physical Street Address Line 2", description: "Surviving Physical Street Address Line 2", measure: "nominal", format: "text", sourceKey: "SUR_PADDR2" }),
    survivingPhysicalCity: defineField({ type: "string", label: "Surviving Physical City", description: "Surviving Physical City", measure: "nominal", format: "text", sourceKey: "SUR_PCITY" }),
    survivingPhysicalStateAbbreviation: defineField({ type: "string", label: "Surviving Physical State Abbreviation", description: "Surviving Physical State Alpha Code", measure: "nominal", format: "text", sourceKey: "SUR_PSTALP" }),
    survivingPhysicalZip: defineField({ type: "string", label: "Surviving Physical ZIP Code", description: "Surviving Physical Zip Code", measure: "nominal", format: "text", sourceKey: "SUR_PZIP5" }),
    survivingMailingAddress: defineField({ type: "string", label: "Surviving Mailing Street Address", description: "Surviving Mailing Street Address", measure: "nominal", format: "text", sourceKey: "SUR_MADDR" }),
    survivingMailingAddress2: defineField({ type: "string", label: "Surviving Mailing Street Address Line 2", description: "Surviving Mailing Street Address Line 2", measure: "nominal", format: "text", sourceKey: "SUR_MADDR2" }),
    survivingMailingCity: defineField({ type: "string", label: "Surviving Mailing City", description: "Surviving Mailing City", measure: "nominal", format: "text", sourceKey: "SUR_MCITY" }),
    survivingMailingStateAbbreviation: defineField({ type: "string", label: "Surviving Mailing State Abbreviation", description: "Surviving Mailing State Alpha Code", measure: "nominal", format: "text", sourceKey: "SUR_MSTALP" }),
    survivingMailingZip: defineField({ type: "string", label: "Surviving Mailing ZIP Code", description: "Surviving Mailing Zip Code", measure: "nominal", format: "text", sourceKey: "SUR_MZIP5" }),
    survivingChangeCode: defineField({ type: "string", label: "Surviving Change Code", description: "Surviving Activity Event Code", measure: "nominal", format: "enum", sourceKey: "SUR_CHANGECODE" }),

    // -------------------------------------------------------------------------
    // Previous institution state (FRM_*)
    // -------------------------------------------------------------------------
    previousCertificate: defineField({
      type: "integer",
      label: "Previous FDIC Certificate Number",
      description: "Previous FDIC Certificate #",
      measure: "nominal",
      format: "id",
      sourceKey: "FRM_CERT",
    }),
    previousInstitutionName: defineField({ type: "string", label: "Previous Institution Name", description: "Previous Institution Name", measure: "nominal", format: "text", sourceKey: "FRM_INSTNAME" }),
    previousClass: defineField({ type: "string", label: "Previous Bank Charter Class", description: "Previous Bank Charter Class", measure: "nominal", format: "enum", enumValues: CLASS_ENUM, sourceKey: "FRM_CLASS" }),
    previousClassCode: defineField({ type: "integer", label: "Previous Class Code", description: "Previous Numeric Code", measure: "nominal", format: "enum", sourceKey: "FRM_CLCODE" }),
    previousCharteringAgency: defineField({ type: "string", label: "Previous Chartering Agency", description: "Previous Chartering Agency", measure: "nominal", format: "enum", sourceKey: "FRM_CHARTAGENT" }),
    previousRegulator: defineField({ type: "string", label: "Previous Regulator", description: "Previous Chartering Agency", measure: "nominal", format: "enum", sourceKey: "FRM_REGAGENT" }),
    previousTrustPowers: defineField({ type: "integer", label: "Previous Trust Powers", description: "Previous Trust Power", measure: "nominal", format: "enum", sourceKey: "FRM_TRUST" }),
    previousCountyName: defineField({ type: "string", label: "Previous County", description: "Previous County", measure: "nominal", format: "text", sourceKey: "FRM_CNTYNAME" }),
    previousCountyNumber: defineField({ type: "integer", label: "Previous FIPS County Number", description: "Previous County Number — FIPS code.", measure: "nominal", format: "id", sourceKey: "FRM_CNTYNUM" }),
    previousPhysicalAddress: defineField({ type: "string", label: "Previous Physical Street Address", description: "Previous Physical Street Address", measure: "nominal", format: "text", sourceKey: "FRM_PADDR" }),
    previousPhysicalAddress2: defineField({ type: "string", label: "Previous Physical Street Address Line 2", description: "Previous Physical Street Address Line 2", measure: "nominal", format: "text", sourceKey: "FRM_PADDR2" }),
    previousPhysicalCity: defineField({ type: "string", label: "Previous Physical City", description: "Previous Physical City", measure: "nominal", format: "text", sourceKey: "FRM_PCITY" }),
    previousPhysicalStateAbbreviation: defineField({ type: "string", label: "Previous Physical State Abbreviation", description: "Previous State Alpha Code", measure: "nominal", format: "text", sourceKey: "FRM_PSTALP" }),
    previousPhysicalZip: defineField({ type: "string", label: "Previous Physical ZIP Code", description: "Previous Zip Code", measure: "nominal", format: "text", sourceKey: "FRM_PZIP5" }),
    previousOfficeName: defineField({ type: "string", label: "Previous Branch Name", description: "Previous Branch Name", measure: "nominal", format: "text", sourceKey: "FRM_OFFNAME" }),
    previousOfficeNumber: defineField({ type: "integer", label: "Previous Branch Number", description: "Previous Branch Number", measure: "nominal", format: "id", sourceKey: "FRM_OFFNUM" }),
    previousOfficeLegalName: defineField({ type: "string", label: "Previous Office Name", description: "Previous Office Name", measure: "nominal", format: "text", sourceKey: "FRM_OFF_NAME" }),
    previousBranchNumber: defineField({ type: "integer", label: "Previous Office Number", description: "Previous Office Number", measure: "nominal", format: "id", sourceKey: "FRM_OFF_NUM" }),
    previousOfficeCharteringAgency: defineField({ type: "string", label: "Previous Office Chartering Agency", description: "Previous Office Chartering Agency", measure: "nominal", format: "enum", sourceKey: "FRM_OFF_CHARTAGENT" }),
    previousOfficeClass: defineField({ type: "string", label: "Previous Office Class", description: "Previous Office Class", measure: "nominal", format: "enum", enumValues: CLASS_ENUM, sourceKey: "FRM_OFF_CLASS" }),
    previousOfficeClassCode: defineField({ type: "integer", label: "Previous Office Class Code", description: "Previous Office Numeric Code", measure: "nominal", format: "enum", sourceKey: "FRM_OFF_CLCODE" }),
    previousOfficeRegulator: defineField({ type: "string", label: "Previous Office Regulator", description: "Previous Regulator", measure: "nominal", format: "enum", sourceKey: "FRM_OFF_REGAGENT" }),
    previousOfficeTrustPowers: defineField({ type: "integer", label: "Previous Office Trust Powers", description: "Previous Trust Power", measure: "nominal", format: "enum", sourceKey: "FRM_OFF_TRUST" }),
    previousOfficeServiceType: defineField({ type: "integer", label: "Previous Office Service Type", description: "Previous Service Type", measure: "nominal", format: "enum", enumValues: SERVTYPE_ENUM, sourceKey: "FRM_OFF_SERVTYPE" }),
    previousOfficeServiceTypeDescription: defineField({ type: "string", label: "Previous Office Service Type Description", description: "Previous Service Type Description", measure: "nominal", format: "text", sourceKey: "FRM_OFF_SERVTYPE_DESC" }),
    previousOfficeCountyName: defineField({ type: "string", label: "Previous Office County", description: "Previous Office County", measure: "nominal", format: "text", sourceKey: "FRM_OFF_CNTYNAME" }),
    previousOfficeCountyNumber: defineField({ type: "integer", label: "Previous Office FIPS County Number", description: "Previous County Number — FIPS code.", measure: "nominal", format: "id", sourceKey: "FRM_OFF_CNTYNUM" }),
    previousOfficePhysicalAddress: defineField({ type: "string", label: "Previous Office Physical Street Address", description: "Previous Physical Street Address", measure: "nominal", format: "text", sourceKey: "FRM_OFF_PADDR" }),
    previousOfficePhysicalAddress2: defineField({ type: "string", label: "Previous Office Physical Street Address Line 2", description: "Previous Physical Street Address Line 2", measure: "nominal", format: "text", sourceKey: "FRM_OFF_PADDR2" }),
    previousOfficePhysicalCity: defineField({ type: "string", label: "Previous Office City", description: "Previous City", measure: "nominal", format: "text", sourceKey: "FRM_OFF_PCITY" }),
    previousOfficePhysicalStateAbbreviation: defineField({ type: "string", label: "Previous Office State Abbreviation", description: "Previous State Alpha Code", measure: "nominal", format: "text", sourceKey: "FRM_OFF_PSTALP" }),
    previousOfficePhysicalZip: defineField({ type: "string", label: "Previous Office ZIP Code", description: "Previous Zip Code", measure: "nominal", format: "text", sourceKey: "FRM_OFF_PZIP5" }),
  },
});
