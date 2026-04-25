import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import type { DatasetDef, FieldDef } from "@bankql/schema";
import { useNavigate } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useMemo, useRef, type UIEvent } from "react";
import { fetchDatasetPage } from "~/domains/datasets/api/fetchDatasetPage";

const PAGE_SIZE = 100;
const ROW_HEIGHT = 36;
const PREFETCH_THRESHOLD_PX = 400;

type Row = Record<string, unknown>;

export default function DatasetTable({ dataset }: { dataset: DatasetDef }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fieldKeys = useMemo(() => Object.keys(dataset.fields), [dataset]);

  const columns = useMemo(() => {
    const ch = createColumnHelper<Row>();
    return Object.entries(dataset.fields).map(([key, field]) =>
      ch.accessor((row) => row[key], {
        id: key,
        header: field.label,
        size: columnWidth(field as FieldDef),
        cell: (info) => formatCell(info.getValue(), field as FieldDef),
      }),
    );
  }, [dataset]);

  const query = useInfiniteQuery({
    queryKey: ["dataset", dataset.name, fieldKeys, dataset.index],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchDatasetPage({
        name: dataset.name,
        fields: fieldKeys,
        orderBy: dataset.index,
        limit: PAGE_SIZE,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.reduce((sum, p) => sum + p.length, 0);
    },
  });

  const flatData = useMemo(
    () => query.data?.pages.flat() ?? [],
    [query.data],
  );

  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const virtualizer = useVirtualizer({
    count: flatData.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const onScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => {
      const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      if (
        distanceToBottom < PREFETCH_THRESHOLD_PX &&
        query.hasNextPage &&
        !query.isFetchingNextPage
      ) {
        query.fetchNextPage();
      }
    },
    [query],
  );

  const totalWidth = table
    .getHeaderGroups()[0]
    .headers.reduce((w, h) => w + h.getSize(), 0);

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
          Failed to load rows: {String(query.error)}
        </Text>
      </Flex>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <Box
      ref={containerRef}
      onScroll={onScroll}
      h="full"
      w="full"
      overflow="auto"
      borderWidth="1px"
      rounded="md"
    >
      <Box minW={`${totalWidth}px`} position="relative">
        <Flex
          direction="row"
          position="sticky"
          top="0"
          zIndex="1"
          bg="bg"
          borderBottomWidth="1px"
        >
          {table.getHeaderGroups()[0].headers.map((header) => (
            <Box
              key={header.id}
              flexShrink="0"
              w={`${header.getSize()}px`}
              px="3"
              py="2"
              borderRightWidth="1px"
              fontWeight="semibold"
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
              color="fg.muted"
              truncate
            >
              {flexRender(
                header.column.columnDef.header,
                header.getContext(),
              )}
            </Box>
          ))}
        </Flex>

        <Box
          position="relative"
          h={`${virtualizer.getTotalSize()}px`}
        >
          {virtualItems.map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index];
            const indexField = dataset.index;
            const pk = indexField ? row.original[indexField] : null;
            const pkStr =
              pk === null || pk === undefined ? null : String(pk);
            return (
              <Flex
                key={virtualRow.key}
                direction="row"
                position="absolute"
                top="0"
                left="0"
                w="full"
                h={`${virtualRow.size}px`}
                transform={`translateY(${virtualRow.start}px)`}
                borderBottomWidth="1px"
                cursor={pkStr ? "pointer" : undefined}
                _hover={{ bg: "bg.subtle" }}
                onClick={
                  pkStr
                    ? () =>
                        navigate({
                          to: "/datasets/$name/$id",
                          params: { name: dataset.name, id: pkStr },
                        })
                    : undefined
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <Box
                    key={cell.id}
                    flexShrink="0"
                    w={`${cell.column.getSize()}px`}
                    px="3"
                    py="2"
                    borderRightWidth="1px"
                    fontSize="sm"
                    truncate
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </Box>
                ))}
              </Flex>
            );
          })}
        </Box>

        {query.isFetchingNextPage && (
          <Flex align="center" justify="center" py="3" color="fg.muted">
            <Spinner size="xs" />
          </Flex>
        )}
      </Box>
    </Box>
  );
}

function columnWidth(field: FieldDef): number {
  switch (field.type) {
    case "boolean":
      return 90;
    case "date":
      return 120;
    case "datetime":
      return 180;
    case "integer":
    case "float":
      return field.format === "id" ? 140 : 130;
    case "string":
      return field.format === "url" || field.format === "email" ? 260 : 200;
    default:
      return 180;
  }
}

function formatCell(value: unknown, field: FieldDef): string {
  if (value === null || value === undefined) return "";
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
