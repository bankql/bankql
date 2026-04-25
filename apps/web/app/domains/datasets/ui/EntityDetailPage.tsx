import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  Spinner,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import type { DatasetDef, FieldDef } from "@bankql/schema";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import DataBootstrapPanel from "~/domains/layout/ui/DataBootstrapPanel";
import { fetchEntity } from "~/domains/datasets/api/fetchEntity";
import { fetchRelated } from "~/domains/datasets/api/fetchEntityRefs";
import { useDataStatus } from "~/lib/useDataStatus";

const RELATED_LIMIT = 25;

type Row = Record<string, unknown>;

interface RelatedSection {
  dataset: DatasetDef;
  whereField: string;
  preview: string[];
}

interface EntityDetailPageProps {
  dataset: DatasetDef;
  indexField: string;
  id: string;
  related?: RelatedSection[];
}

export default function EntityDetailPage({
  dataset,
  indexField,
  id,
  related = [],
}: EntityDetailPageProps) {
  const status = useDataStatus();
  if (status !== "ready") {
    return (
      <Flex align="center" justify="center" h="full">
        {status === "error" ? (
          <Text color="fg.error" textStyle="sm">
            Dataset failed to load.
          </Text>
        ) : (
          <DataBootstrapPanel />
        )}
      </Flex>
    );
  }

  return (
    <Loaded
      dataset={dataset}
      indexField={indexField}
      id={id}
      related={related ?? []}
    />
  );
}

function Loaded({
  dataset,
  indexField,
  id,
  related,
}: Required<EntityDetailPageProps>) {
  const fields = Object.keys(dataset.fields);
  const query = useQuery({
    queryKey: ["entity", dataset.name, id],
    queryFn: () =>
      fetchEntity({
        name: dataset.name,
        fields,
        indexField,
        id,
      }),
  });

  if (query.isPending) {
    return (
      <Flex align="center" justify="center" h="full" color="fg.muted">
        <Spinner size="sm" />
      </Flex>
    );
  }

  if (query.isError) {
    return (
      <Flex align="center" justify="center" h="full">
        <Text color="fg.error" textStyle="sm">
          Failed to load entity: {String(query.error)}
        </Text>
      </Flex>
    );
  }

  const row = query.data;
  if (!row) {
    return (
      <Flex align="center" justify="center" h="full">
        <Text color="fg.muted" textStyle="sm">
          No record found in {dataset.name} with {dataset.index} = {id}.
        </Text>
      </Flex>
    );
  }

  const title = pickTitle(row);

  return (
    <Box h="full" w="full" overflow="auto">
      <Stack
        direction="column"
        maxW="5xl"
        mx="auto"
        px={{ base: "4", md: "8" }}
        py={{ base: "6", md: "8" }}
        gap="8"
      >
        <Header dataset={dataset} indexField={indexField} id={id} title={title} />
        <FieldList dataset={dataset} row={row} />
        {related.map((section) => (
          <RelatedTable
            key={section.dataset.name}
            section={section}
            id={id}
          />
        ))}
      </Stack>
    </Box>
  );
}

function Header({
  dataset,
  indexField,
  id,
  title,
}: {
  dataset: DatasetDef;
  indexField: string;
  id: string;
  title: string | null;
}) {
  return (
    <Stack direction="column" gap="2">
      <Stack direction="row" align="center" gap="2">
        <Link to="/datasets/$name" params={{ name: dataset.name }}>
          <Badge variant="subtle" fontFamily="mono">
            {dataset.name}
          </Badge>
        </Link>
        <Badge variant="outline" fontFamily="mono">
          {indexField}: {id}
        </Badge>
      </Stack>
      <Heading size="xl">{title ?? `${dataset.name} #${id}`}</Heading>
      {dataset.description && (
        <Text color="fg.muted" textStyle="sm">
          {dataset.description}
        </Text>
      )}
    </Stack>
  );
}

function FieldList({ dataset, row }: { dataset: DatasetDef; row: Row }) {
  return (
    <Card.Root variant="outline">
      <Card.Body>
        <Stack direction="column" gap="0">
          {Object.entries(dataset.fields).map(([key, field], i) => {
            const value = row[key];
            return (
              <Flex
                key={key}
                direction={{ base: "column", md: "row" }}
                gap={{ base: "0", md: "4" }}
                py="2"
                borderTopWidth={i === 0 ? "0" : "1px"}
              >
                <Box minW="240px" color="fg.muted" textStyle="sm">
                  {(field as FieldDef).label}
                </Box>
                <Box flex="1" textStyle="sm" wordBreak="break-word">
                  {formatValue(value, field as FieldDef)}
                </Box>
              </Flex>
            );
          })}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}

function RelatedTable({
  section,
  id,
}: {
  section: RelatedSection;
  id: string;
}) {
  const { dataset, whereField, preview } = section;
  const relatedIndex = dataset.index;
  const query = useQuery({
    queryKey: ["entity-related", dataset.name, whereField, id],
    queryFn: () =>
      fetchRelated({
        name: dataset.name,
        fields: preview,
        whereField,
        whereId: id,
        orderBy: relatedIndex,
        limit: RELATED_LIMIT,
      }),
  });

  return (
    <Stack direction="column" gap="3">
      <Stack direction="row" align="baseline" gap="3">
        <Heading size="md" fontFamily="mono">
          {dataset.name}
        </Heading>
        <Text color="fg.muted" textStyle="sm">
          {query.data
            ? `${query.data.length}${query.data.length === RELATED_LIMIT ? "+" : ""} matching`
            : "loading…"}
        </Text>
      </Stack>

      {query.isError && (
        <Text color="fg.error" textStyle="sm">
          Failed to load: {String(query.error)}
        </Text>
      )}

      {query.data && query.data.length > 0 && (
        <Box overflowX="auto" borderWidth="1px" rounded="md">
          <Table.Root size="sm" variant="outline">
            <Table.Header>
              <Table.Row>
                {preview.map((key) => (
                  <Table.ColumnHeader key={key}>
                    {(dataset.fields[key] as FieldDef).label}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {query.data.map((row, i) => {
                const pk = relatedIndex
                  ? String(row[relatedIndex] ?? "")
                  : "";
                return (
                  <Table.Row key={pk || i}>
                    {preview.map((key) => (
                      <Table.Cell key={key}>
                        {relatedIndex && key === relatedIndex && pk ? (
                          <Link
                            to="/datasets/$name/$id"
                            params={{ name: dataset.name, id: pk }}
                            style={{ textDecoration: "underline" }}
                          >
                            {formatValue(
                              row[key],
                              dataset.fields[key] as FieldDef,
                            )}
                          </Link>
                        ) : (
                          formatValue(
                            row[key],
                            dataset.fields[key] as FieldDef,
                          )
                        )}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {query.data && query.data.length === 0 && (
        <Text color="fg.muted" textStyle="sm">
          No related records.
        </Text>
      )}
    </Stack>
  );
}

function pickTitle(row: Row): string | null {
  for (const key of ["name", "institutionName", "shortName"]) {
    const v = row[key];
    if (typeof v === "string" && v.trim().length > 0) return v;
  }
  return null;
}

function formatValue(value: unknown, field: FieldDef): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (field.type === "date" && typeof value === "string") {
    return value.slice(0, 10);
  }
  if (field.type === "datetime" && typeof value === "string") {
    return value.replace("T", " ").replace(/\.\d+Z$/, "Z");
  }
  if (typeof value === "number" || typeof value === "bigint") {
    if (
      field.format === "currency-cents" ||
      field.format === "currency-dollars" ||
      (field.measure === "quantitative" && field.format !== "id")
    ) {
      const n =
        field.format === "currency-cents"
          ? Number(value) / 100
          : Number(value);
      return n.toLocaleString();
    }
    return String(value);
  }
  return String(value);
}
