import { defineDataset, defineField } from "../define.js";

export const location_coordinates = defineDataset({
  name: "location_coordinates",
  description:
    "Geocoded latitude/longitude for FDIC branch offices. Joined to " +
    "`locations` on `uninum` (1:1). Sourced from the U.S. Census Geocoder. " +
    "No-match results are stored too so the geocoder is not retried.",
  index: "uninum",
  fields: {
    uninum: defineField({
      type: "integer",
      label: "Branch UNINUM",
      description: "FDIC Branch UNINUM, the join key into `locations`.",
      measure: "nominal",
      format: "id",
      relation: { dataset: "locations", field: "uninum", cardinality: "1:1" },
    }),
    latitude: defineField({
      type: "float",
      label: "Latitude",
      description:
        "Geocoded latitude of the branch's address, NULL if no match.",
      measure: "quantitative",
      format: "coordinate",
    }),
    longitude: defineField({
      type: "float",
      label: "Longitude",
      description:
        "Geocoded longitude of the branch's address, NULL if no match.",
      measure: "quantitative",
      format: "coordinate",
    }),
    geocodeQuality: defineField({
      type: "string",
      label: "Geocode Quality",
      description:
        "Match quality from the Census batch geocoder: `exact` and " +
        "`non_exact` are matches with coords; `tie` and `no_match` have NULL " +
        "coords. Stored to short-circuit retries.",
      measure: "nominal",
      format: "enum",
      enumValues: ["exact", "non_exact", "tie", "no_match"],
    }),
    geocodedAddress: defineField({
      type: "string",
      label: "Matched Address",
      description:
        "Census-normalized matched address. NULL when geocodeQuality is " +
        "`tie` or `no_match`. Useful for debugging quality issues.",
      measure: "nominal",
      format: "text",
    }),
    geocodedAt: defineField({
      type: "date",
      label: "Geocoded At",
      description:
        "Date this row was geocoded. Used to age out stale results.",
      measure: "temporal",
      format: "date",
    }),
  },
});
