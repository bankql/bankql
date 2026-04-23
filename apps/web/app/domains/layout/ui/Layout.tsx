import {
  Box,
  Flex,
  IconButton,
  Input,
  Spinner,
  Splitter,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { LuMenu, LuMessageSquare } from "react-icons/lu";
import { LayoutProvider, useLayout } from "~/domains/layout/hooks/useLayout";
import ChatPanel from "~/domains/agent/ui/ChatPanel";
import Sidebar from "~/domains/menu/ui/Sidebar";
import { ColorModeButton } from "~/lib/colorMode";
import { useDataStatus } from "~/lib/useDataStatus";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <LayoutShell>{children}</LayoutShell>
    </LayoutProvider>
  );
}

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { sidebar, assistant } = useLayout();
  const [openSize, setOpenSize] = useState<number[]>([70, 30]);
  const dataStatus = useDataStatus();

  const onResize = useCallback(
    (details: { size: number[] }) => {
      if (assistant.open) setOpenSize(details.size);
    },
    [assistant.open],
  );

  const size = assistant.open ? openSize : [100, 0];

  return (
    <Stack direction="column" w="100dvw" h="100dvh" gap="0">
      {/* Toolbar */}
      <Flex
        direction="row"
        align="center"
        px="2"
        py="1"
        gap="2"
        flexShrink="0"
        borderBottomWidth="1px"
      >
        <IconButton
          aria-label="Toggle menu"
          variant="ghost"
          size="sm"
          onClick={sidebar.onToggle}
        >
          <LuMenu />
        </IconButton>

        <Flex flex="1" justify="center">
          <Input placeholder="Search..." size="sm" maxW="md" />
        </Flex>

        {dataStatus === "loading" && (
          <Flex align="center" gap="2" color="fg.muted">
            <Spinner size="xs" />
            <Text fontSize="xs">Loading data…</Text>
          </Flex>
        )}
        {dataStatus === "error" && (
          <Text fontSize="xs" color="fg.error">
            Data failed to load
          </Text>
        )}

        <ColorModeButton />

        <IconButton
          aria-label="Toggle assistant"
          variant="ghost"
          size="sm"
          onClick={assistant.onToggle}
        >
          <LuMessageSquare />
        </IconButton>
      </Flex>

      {/* Main content */}
      <Flex direction="row" flex="1" minH="0">
        <Sidebar />

        <Splitter.Root
          flex="1"
          size={size}
          onResize={onResize}
          panels={[
            { id: "canvas", minSize: 40 },
            { id: "assistant", collapsible: true, collapsedSize: 0, minSize: 15 },
          ]}
        >
          <Splitter.Panel id="canvas">
            <Box h="full" w="full" overflow="auto">
              {children}
            </Box>
          </Splitter.Panel>

          <Splitter.ResizeTrigger id="canvas:assistant" />

          <Splitter.Panel id="assistant">
            <ChatPanel />
          </Splitter.Panel>
        </Splitter.Root>
      </Flex>
    </Stack>
  );
}
