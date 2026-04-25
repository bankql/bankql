import { Chart, useChart } from "@chakra-ui/charts";
import { Box, Stack, Stat, Table, Text } from "@chakra-ui/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TileConfig } from "@bankql/schema";

type Row = Record<string, unknown>;

export default function TileRenderer({
  config,
  rows,
}: {
  config: TileConfig;
  rows: Row[];
}) {
  return (
    <Stack
      direction="column"
      gap="2"
      borderWidth="1px"
      rounded="md"
      bg="bg"
      p="3"
    >
      <Text textStyle="sm" fontWeight="semibold">
        {config.title}
      </Text>
      <Body config={config} rows={rows} />
    </Stack>
  );
}

function Body({ config, rows }: { config: TileConfig; rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <Text textStyle="xs" color="fg.muted">
        No rows returned.
      </Text>
    );
  }
  switch (config.type) {
    case "stat":
      return <StatTile config={config} rows={rows} />;
    case "chart":
      return <ChartTile config={config} rows={rows} />;
    case "table":
      return <TableTile config={config} rows={rows} />;
  }
}

function StatTile({
  config,
  rows,
}: {
  config: Extract<TileConfig, { type: "stat" }>;
  rows: Row[];
}) {
  const first = rows[0] ?? {};
  const value = Object.values(first)[0];
  return (
    <Stat.Root>
      <Stat.ValueText>{formatStat(value, config.format)}</Stat.ValueText>
    </Stat.Root>
  );
}

function ChartTile({
  config,
  rows,
}: {
  config: Extract<TileConfig, { type: "chart" }>;
  rows: Row[];
}) {
  const data = rows.map((row) => ({
    ...row,
    [config.yAxis]: toNumber(row[config.yAxis]),
  }));
  const color = config.color ?? "teal.solid";
  const chart = useChart({
    data,
    series: [{ name: config.yAxis, color }],
  });

  switch (config.chartType) {
    case "bar":
      return (
        <Chart.Root maxH="sm" chart={chart}>
          <BarChart data={chart.data} responsive>
            <CartesianGrid
              stroke={chart.color("border.muted")}
              vertical={false}
            />
            <XAxis
              axisLine={false}
              tickLine={false}
              dataKey={chart.key(config.xAxis)}
            />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: chart.color("bg.muted") }}
              animationDuration={100}
              content={<Chart.Tooltip />}
            />
            <Bar
              isAnimationActive={false}
              dataKey={chart.key(config.yAxis)}
              fill={chart.color(color)}
            />
          </BarChart>
        </Chart.Root>
      );
    case "line":
      return (
        <Chart.Root maxH="sm" chart={chart}>
          <LineChart data={chart.data} responsive>
            <CartesianGrid
              stroke={chart.color("border.muted")}
              vertical={false}
            />
            <XAxis
              axisLine={false}
              tickLine={false}
              dataKey={chart.key(config.xAxis)}
            />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip animationDuration={100} content={<Chart.Tooltip />} />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey={chart.key(config.yAxis)}
              stroke={chart.color(color)}
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </Chart.Root>
      );
    case "area":
      return (
        <Chart.Root maxH="sm" chart={chart}>
          <AreaChart data={chart.data} responsive>
            <CartesianGrid
              stroke={chart.color("border.muted")}
              vertical={false}
            />
            <XAxis
              axisLine={false}
              tickLine={false}
              dataKey={chart.key(config.xAxis)}
            />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip animationDuration={100} content={<Chart.Tooltip />} />
            <Area
              isAnimationActive={false}
              type="monotone"
              dataKey={chart.key(config.yAxis)}
              stroke={chart.color(color)}
              fill={chart.color(color)}
              fillOpacity={0.3}
            />
          </AreaChart>
        </Chart.Root>
      );
    case "dot":
      return (
        <Chart.Root maxH="sm" chart={chart}>
          <ScatterChart data={chart.data} responsive>
            <CartesianGrid stroke={chart.color("border.muted")} />
            <XAxis
              dataKey={chart.key(config.xAxis)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey={chart.key(config.yAxis)}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip animationDuration={100} content={<Chart.Tooltip />} />
            <Scatter
              isAnimationActive={false}
              data={chart.data}
              fill={chart.color(color)}
            />
          </ScatterChart>
        </Chart.Root>
      );
  }
}

function TableTile({
  config,
  rows,
}: {
  config: Extract<TileConfig, { type: "table" }>;
  rows: Row[];
}) {
  const columns = config.columns ?? Object.keys(rows[0] ?? {});
  return (
    <Box overflowX="auto" maxH="sm" overflowY="auto">
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row>
            {columns.map((col) => (
              <Table.ColumnHeader key={col}>{col}</Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row, i) => (
            <Table.Row key={i}>
              {columns.map((col) => (
                <Table.Cell key={col}>{formatCell(row[col])}</Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function formatStat(value: unknown, format?: "number" | "currency" | "percent") {
  const n = toNumber(value);
  if (format === "currency") {
    return n.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }
  if (format === "percent") {
    return n.toLocaleString(undefined, {
      style: "percent",
      maximumFractionDigits: 1,
    });
  }
  return n.toLocaleString();
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number" || typeof value === "bigint") {
    return Number(value).toLocaleString();
  }
  return String(value);
}
