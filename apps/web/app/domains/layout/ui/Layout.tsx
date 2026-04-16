import { Flex, IconButton, Input, Spacer, Splitter, Stack } from "@chakra-ui/react";
import { Outlet } from "@tanstack/react-router";
import { LuMenu, LuMessageSquare } from "react-icons/lu";

export default function Layout() {
  return (
    <Stack direction="column" w="100dvw" h="100dvh" gap="0">
      {/* Toolbar */}
      <Flex direction="row" align="center" px="2" py="1" gap="2" flexShrink="0" borderBottomWidth="1px">
        <IconButton aria-label="Open menu" variant="ghost" size="sm">
          <LuMenu />
        </IconButton>

        <Spacer />

        <Input placeholder="Search..." size="sm" maxW="md" />

        <Spacer />

        <IconButton aria-label="Open assistant" variant="ghost" size="sm">
          <LuMessageSquare />
        </IconButton>
      </Flex>

      {/* Main content */}
      <Flex direction="row" flex="1" minH="0">
        <Splitter.Root
          flex="1"
          defaultSize={[80, 20]}
          panels={[
            { id: "canvas", minSize: 40 },
            { id: "assistant", collapsible: true, collapsedSize: 0, minSize: 15 },
          ]}
        >
          <Splitter.Panel id="canvas">
            <Outlet />
          </Splitter.Panel>

          <Splitter.ResizeTrigger id="canvas:assistant" />

          <Splitter.Panel id="assistant" />
        </Splitter.Root>
      </Flex>
    </Stack>
  );
}
