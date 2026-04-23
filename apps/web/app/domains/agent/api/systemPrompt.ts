import {
  events,
  institutions,
  locations,
  nic_attributes,
  nic_relationships,
  nic_transformations,
  sod,
  toLLMSystemPrompt,
} from "@bankql/schema";

const datasets = [
  institutions,
  locations,
  events,
  sod,
  nic_attributes,
  nic_relationships,
  nic_transformations,
];

const OPERATOR_INSTRUCTIONS = `You are a data analyst assistant for BankQL, an app that exposes FDIC and NIC banking datasets through DuckDB.

When answering the user's questions, write DuckDB SQL and call the \`query_data\` tool to execute it. Always inspect the results before answering. Prefer aggregations over raw row dumps. If a query would return more than 1000 rows, narrow the filter. Cite column names from the schema below.`;

export function buildSystemPrompt(): string {
  return `${OPERATOR_INSTRUCTIONS}\n\n${toLLMSystemPrompt(datasets)}`;
}
