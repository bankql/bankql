import { institutions } from "./institutions.js";
import { locations } from "./locations.js";
import { events } from "./events.js";
import { sod } from "./sod.js";
import { nic_attributes } from "./nic_attributes.js";
import { nic_relationships } from "./nic_relationships.js";
import { nic_transformations } from "./nic_transformations.js";
import { credit_unions } from "./credit_unions.js";

export { institutions } from "./institutions.js";
export { locations } from "./locations.js";
export { events } from "./events.js";
export { sod } from "./sod.js";
export { nic_attributes } from "./nic_attributes.js";
export { nic_relationships } from "./nic_relationships.js";
export { nic_transformations } from "./nic_transformations.js";
export { credit_unions } from "./credit_unions.js";

export const allDatasets = [
  institutions,
  locations,
  events,
  sod,
  nic_attributes,
  nic_relationships,
  nic_transformations,
  credit_unions,
] as const;
