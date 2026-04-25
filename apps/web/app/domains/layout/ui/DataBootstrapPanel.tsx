import { Card, Progress, Stack, Text } from "@chakra-ui/react";
import type { DatasetLoadState } from "~/lib/datasetLoad";
import { useDatasetLoads } from "~/lib/datasetLoad";

export default function DataBootstrapPanel() {
  const loads = useDatasetLoads();
  if (loads.length === 0) return null;

  return (
    <Card.Root maxW="2xl" w="full" variant="subtle">
      <Card.Header>
        <Card.Title>Initializing BankQL</Card.Title>
        <Card.Description>
          Fetching FDIC and NCUA parquet files and loading them into an
          in-browser DuckDB-WASM instance. On return visits these come straight
          from your OPFS cache.
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <Stack direction="column" gap="5">
          {loads.map((state) => (
            <DatasetRow key={state.name} state={state} />
          ))}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}

function DatasetRow({ state }: { state: DatasetLoadState }) {
  const { name, phase, source, bytesLoaded, bytesTotal, rows, error, elapsedMs } = state;

  const isDone = phase === "ready";
  const isError = phase === "error";
  const hasTotal = typeof bytesTotal === "number" && bytesTotal > 0;

  let value: number | null;
  if (isDone) {
    value = 100;
  } else if (isError) {
    value = 0;
  } else if (phase === "fetching" && hasTotal && typeof bytesLoaded === "number") {
    value = Math.min(100, Math.round((bytesLoaded / bytesTotal) * 100));
  } else {
    value = null;
  }

  const colorPalette = isError ? "red" : isDone ? "green" : "blue";

  return (
    <Progress.Root value={value} colorPalette={colorPalette} variant="subtle" size="sm">
      <Stack direction="row" justify="space-between" mb="1" gap="4">
        <Progress.Label fontSize="sm" fontFamily="mono">
          {name}
        </Progress.Label>
        <Text fontSize="xs" color="fg.muted" textAlign="right">
          {renderStatus({ phase, source, bytesLoaded, bytesTotal, rows, error, elapsedMs })}
        </Text>
      </Stack>
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
  );
}

function renderStatus(state: Pick<DatasetLoadState,
  "phase" | "source" | "bytesLoaded" | "bytesTotal" | "rows" | "error" | "elapsedMs"
>): string {
  const { phase, source, bytesLoaded, bytesTotal, rows, error, elapsedMs } = state;
  switch (phase) {
    case "queued":
      return "Queued";
    case "fetching": {
      if (typeof bytesLoaded === "number" && typeof bytesTotal === "number") {
        return `Downloading · ${formatBytes(bytesLoaded)} / ${formatBytes(bytesTotal)}`;
      }
      if (typeof bytesLoaded === "number") {
        return `Downloading · ${formatBytes(bytesLoaded)}`;
      }
      return "Downloading";
    }
    case "loading":
      return source === "cache" ? "Loading from OPFS cache" : "Loading into DuckDB";
    case "ready": {
      const parts: string[] = [];
      if (typeof rows === "number") parts.push(`${rows.toLocaleString()} rows`);
      if (typeof bytesTotal === "number") parts.push(formatBytes(bytesTotal));
      if (typeof elapsedMs === "number") parts.push(`${(elapsedMs / 1000).toFixed(1)}s`);
      return `Ready · ${parts.join(" · ")}`;
    }
    case "error":
      return `Error · ${error ?? "unknown"}`;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
