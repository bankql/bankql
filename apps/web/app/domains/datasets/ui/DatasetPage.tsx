import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import type { DatasetDef } from "@bankql/schema";
import DatasetTable from "~/domains/datasets/ui/DatasetTable";
import { useDataStatus } from "~/lib/useDataStatus";
import DataBootstrapPanel from "~/domains/layout/ui/DataBootstrapPanel";

export default function DatasetPage({ dataset }: { dataset: DatasetDef }) {
  const status = useDataStatus();
  const fieldCount = Object.keys(dataset.fields).length;

  return (
    <Stack direction="column" h="full" w="full" gap="0">
      <Box px="6" py="4" borderBottomWidth="1px">
        <Flex direction="row" align="baseline" gap="3">
          <Heading size="lg" fontFamily="mono">
            {dataset.name}
          </Heading>
          <Text color="fg.muted" textStyle="sm">
            {fieldCount} columns
          </Text>
        </Flex>
        {dataset.description && (
          <Text color="fg.muted" textStyle="sm" mt="1">
            {dataset.description}
          </Text>
        )}
      </Box>

      <Box flex="1" minH="0" p="4">
        {status === "ready" ? (
          <DatasetTable dataset={dataset} />
        ) : status === "error" ? (
          <Flex align="center" justify="center" h="full">
            <Text color="fg.error" textStyle="sm">
              Dataset failed to load.
            </Text>
          </Flex>
        ) : (
          <Flex align="center" justify="center" h="full">
            <DataBootstrapPanel />
          </Flex>
        )}
      </Box>
    </Stack>
  );
}
