import {
  credit_unions,
  events,
  institutions,
  locations,
  toLLMSystemPrompt,
} from "@bankql/schema";

// Only advertise datasets whose parquets are actually published + loadable
// in the browser. Keep this list in sync with apps/web/app/lib/datasets.ts
// `UNPUBLISHED`. See apps/etl/CLAUDE.md "Known Issues" for current status.
const datasets = [institutions, locations, events, credit_unions];

const OPERATOR_INSTRUCTIONS = `You are a data analyst assistant for BankQL, an app that exposes FDIC and NIC banking datasets through DuckDB.

When answering the user's questions, write DuckDB SQL and call the \`query_data\` tool to execute it. Always inspect the results before answering. Prefer aggregations over raw row dumps. If a query would return more than 1000 rows, narrow the filter. Cite column names from the schema below.`;

export function buildSystemPrompt(): string {
  return `${OPERATOR_INSTRUCTIONS}\n\n${toLLMSystemPrompt(datasets)}`;
}
