import {
  credit_unions,
  depositoryInstitutionsView,
  events,
  institutions,
  locations,
  toLLMSystemPrompt,
} from "@bankql/schema";

// Only advertise datasets whose parquets are actually published + loadable
// in the browser. Keep this list in sync with apps/web/app/lib/datasets.ts
// `UNPUBLISHED`. See apps/etl/CLAUDE.md "Known Issues" for current status.
// `depository_institutions` is a DuckDB view over institutions + credit_unions
// — created in the browser, not parquet-backed, but the agent should know it
// exists as a cross-type convenience.
const datasets = [
  institutions,
  locations,
  events,
  credit_unions,
  depositoryInstitutionsView,
];

const OPERATOR_INSTRUCTIONS = `You are a data analyst assistant for BankQL, an app that exposes FDIC and NIC banking datasets through DuckDB.

When answering the user's questions, write DuckDB SQL and call the \`query_data\` tool to execute it. Always inspect the results before answering. Prefer aggregations over raw row dumps. If a query would return more than 1000 rows, narrow the filter. Cite column names from the schema below.

When the user asks for a chart, plot, or visualization, call \`render_tile\` instead of \`query_data\`. Pass a \`config\` object describing the tile:
- For charts: \`{ type: "chart", title, sql, chartType: "bar"|"line"|"area"|"dot", xAxis, yAxis }\`. The \`xAxis\` and \`yAxis\` must be column aliases that the SQL actually returns.
- For single-number stats: \`{ type: "stat", title, sql, format?: "number"|"currency"|"percent" }\`. The SQL should return a single row with one numeric column.
- For tables: \`{ type: "table", title, sql, columns?: [...] }\`.

Keep chart SQL aggregated to <= 50 rows so the chart is readable. Use \`render_tile\` for visual answers; use \`query_data\` for follow-up exploration that doesn't need a chart.`;

export function buildSystemPrompt(): string {
  return `${OPERATOR_INSTRUCTIONS}\n\n${toLLMSystemPrompt(datasets)}`;
}
