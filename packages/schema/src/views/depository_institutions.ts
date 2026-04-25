import { defineDataset, defineField } from "../define.js";

/**
 * Unified view over `institutions` (FDIC banks) and `credit_unions` (NCUA)
 * exposing the columns both sources share. Use for cross-type queries like
 * "all federally-insured depository institutions in Texas."
 *
 * This is a SQL view, not a parquet-backed dataset — intentionally excluded
 * from `allDatasets`, which drives ETL publishing and client bootstrap.
 * Consumers create the view by executing `depositoryInstitutionsViewSql`
 * against DuckDB after both source tables are loaded.
 */
export const depositoryInstitutionsView = defineDataset({
  name: "depository_institutions",
  description:
    "Union view over `institutions` (FDIC banks) and `credit_unions` (NCUA). Filter by `entityType` to isolate one source; query directly for cross-type analysis.",
  index: "entityId",
  fields: {
    entityType: defineField({
      type: "string",
      label: "Entity Type",
      description: "Source discriminator: 'bank' (FDIC institutions) or 'credit_union' (NCUA credit unions).",
      measure: "nominal",
      format: "enum",
      enumValues: ["bank", "credit_union"],
    }),
    entityId: defineField({
      type: "string",
      label: "Entity ID",
      description: "Type-prefixed canonical identifier: 'bank:{FDIC cert}' or 'cu:{NCUA charter}'. Unique across types.",
      measure: "nominal",
      format: "id",
    }),
    fedRssdId: defineField({
      type: "integer",
      label: "Federal Reserve RSSD ID",
      description: "Federal Reserve RSSD identifier. Joins to `nic_attributes.rssdId` for Fed entity details.",
      measure: "nominal",
      format: "id",
    }),
    legalName: defineField({
      type: "string",
      label: "Legal Name",
      description: "Legal institution name.",
      measure: "nominal",
      format: "text",
    }),
    streetAddress: defineField({
      type: "string",
      label: "Street Address",
      description: "Street address of the headquarters / main office.",
      measure: "nominal",
      format: "text",
    }),
    city: defineField({
      type: "string",
      label: "City",
      description: "City of the headquarters / main office.",
      measure: "nominal",
      format: "text",
    }),
    stateAbbr: defineField({
      type: "string",
      label: "State Abbreviation",
      description: "Two-letter US state abbreviation.",
      measure: "nominal",
      format: "text",
    }),
    stateFips: defineField({
      type: "integer",
      label: "FIPS State Code",
      description: "FIPS state numeric code.",
      measure: "nominal",
      format: "id",
    }),
    stateCountyFips: defineField({
      type: "string",
      label: "FIPS State/County Code",
      description: "Five-digit FIPS state+county code (e.g. '23031').",
      measure: "nominal",
      format: "id",
    }),
    zipCode: defineField({
      type: "string",
      label: "ZIP Code",
      description: "Mailing address ZIP code.",
      measure: "nominal",
      format: "text",
    }),
    establishedDate: defineField({
      type: "date",
      label: "Established Date",
      description: "Date the entity began operations. Credit unions fall back to January 1 of `creditUnionYearOpened` when no charter issue date is recorded.",
      measure: "temporal",
      format: "date",
    }),
    federalInsuranceDate: defineField({
      type: "date",
      label: "Federal Insurance Date",
      description: "Date the entity first obtained federal deposit/share insurance (FDIC for banks, NCUA for credit unions).",
      measure: "temporal",
      format: "date",
    }),
    reportDate: defineField({
      type: "date",
      label: "Report Date",
      description: "Last day of the reporting period the row reflects (FDIC `reportDate` or NCUA `callReportCycleEndDate`).",
      measure: "temporal",
      format: "date",
    }),
    primaryRegulator: defineField({
      type: "string",
      label: "Primary Regulator",
      description: "Primary federal regulator. Banks: OCC/FDIC/OTS/STATE/FED. Credit unions: always NCUA.",
      measure: "nominal",
      format: "enum",
      enumValues: ["OCC", "FDIC", "OTS", "STATE", "FED", "NCUA"],
    }),
    isMinorityDepository: defineField({
      type: "boolean",
      label: "Minority Depository Institution",
      description: "Flag indicating Minority Depository Institution status.",
      measure: "nominal",
      format: "boolean",
    }),
    isFederalCharter: defineField({
      type: "boolean",
      label: "Federal Charter",
      description: "Federally chartered (OCC for banks, NCUA type 1 for credit unions).",
      measure: "nominal",
      format: "boolean",
    }),
    isStateCharter: defineField({
      type: "boolean",
      label: "State Charter",
      description: "State chartered. For credit unions, NCUA type 2 and 3 are treated as state-chartered.",
      measure: "nominal",
      format: "boolean",
    }),
  },
});

/**
 * CREATE OR REPLACE VIEW DDL. Run against a DuckDB connection after both
 * `institutions` and `credit_unions` tables exist (data may still be empty —
 * the view binds lazily).
 */
export const depositoryInstitutionsViewSql = `
CREATE OR REPLACE VIEW depository_institutions AS

-- FDIC banks
SELECT
  'bank'                                              AS entityType,
  'bank:' || CAST(certificate AS VARCHAR)             AS entityId,
  fedRssdId                                           AS fedRssdId,
  name                                                AS legalName,
  address                                             AS streetAddress,
  city                                                AS city,
  stateAbbreviation                                   AS stateAbbr,
  stateNumber                                         AS stateFips,
  stateCountyCode                                     AS stateCountyFips,
  zip                                                 AS zipCode,
  establishedDate                                     AS establishedDate,
  insuranceDate                                       AS federalInsuranceDate,
  reportDate                                          AS reportDate,
  primaryRegulator                                    AS primaryRegulator,
  (minorityStatusCode IS NOT NULL AND minorityStatusCode > 0)
                                                      AS isMinorityDepository,
  CAST(federalCharter AS BOOLEAN)                     AS isFederalCharter,
  CAST(stateCharter   AS BOOLEAN)                     AS isStateCharter
FROM institutions

UNION ALL

-- NCUA credit unions
SELECT
  'credit_union'                                      AS entityType,
  'cu:' || CAST(ncuaCharterNumber AS VARCHAR)         AS entityId,
  TRY_CAST(rssdId AS INTEGER)                         AS fedRssdId,
  creditUnionName                                     AS legalName,
  street                                              AS streetAddress,
  city                                                AS city,
  state                                               AS stateAbbr,
  stateCode                                           AS stateFips,
  LPAD(CAST(stateCode  AS VARCHAR), 2, '0')
    || LPAD(CAST(countyCode AS VARCHAR), 3, '0')      AS stateCountyFips,
  zipCode                                             AS zipCode,
  COALESCE(
    creditUnionCharterIssueDate,
    MAKE_DATE(creditUnionYearOpened, 1, 1)
  )                                                   AS establishedDate,
  ncuaFirstInsuredDate                                AS federalInsuranceDate,
  callReportCycleEndDate                              AS reportDate,
  'NCUA'                                              AS primaryRegulator,
  isMinorityDepositoryInstitution                     AS isMinorityDepository,
  (creditUnionType = '1')                             AS isFederalCharter,
  (creditUnionType IN ('2', '3'))                     AS isStateCharter
FROM credit_unions
`;
