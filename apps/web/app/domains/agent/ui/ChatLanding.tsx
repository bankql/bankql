import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import Composer from "~/domains/agent/ui/Composer";
import MessageList from "~/domains/agent/ui/MessageList";
import { useAgent } from "~/domains/agent/hooks/useAgent";
import DataBootstrapPanel from "~/domains/layout/ui/DataBootstrapPanel";
import { useDataStatus } from "~/lib/useDataStatus";

const SUGGESTIONS = [
  "Which states have the most credit unions?",
  "Show me the largest banks in Texas by assets",
  "How many minority-owned depository institutions are in California?",
  "List bank mergers in 2023",
];

export default function ChatLanding() {
  const { messages, sendMessage, isLoading } = useAgent();
  const [input, setInput] = useState("");

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      setInput("");
      await sendMessage(trimmed);
    },
    [isLoading, sendMessage],
  );

  const onSubmit = useCallback(() => send(input), [input, send]);

  const dataStatus = useDataStatus();
  const isEmpty = messages.length === 0;

  if (isEmpty && dataStatus !== "ready") {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        h="full"
        w="full"
        px="6"
      >
        <DataBootstrapPanel />
      </Flex>
    );
  }

  if (isEmpty) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        h="full"
        w="full"
        px="6"
      >
        <Stack direction="column" gap="8" maxW="2xl" w="full" align="center">
          <Stack direction="column" gap="3" align="center" textAlign="center">
            <Heading size="3xl">BankQL</Heading>
            <Text color="fg.muted" textStyle="md">
              Ask anything about FDIC banks, NCUA credit unions, and federal
              depository institutions.
            </Text>
          </Stack>

          <Box w="full">
            <Composer
              value={input}
              onChange={setInput}
              onSubmit={onSubmit}
              disabled={isLoading}
              placeholder="Ask a question…"
              autoFocus
              size="md"
            />
          </Box>

          <Flex direction="row" wrap="wrap" gap="2" justify="center">
            {SUGGESTIONS.map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                onClick={() => send(s)}
                disabled={isLoading}
              >
                {s}
              </Button>
            ))}
          </Flex>
        </Stack>
      </Flex>
    );
  }

  return (
    <Stack direction="column" h="full" w="full" gap="0">
      <Box flex="1" overflow="auto" px="6" py="4">
        <Box maxW="3xl" mx="auto">
          <MessageList messages={messages} />
        </Box>
      </Box>

      <Box borderTopWidth="1px" px="6" py="3">
        <Box maxW="3xl" mx="auto">
          <Composer
            value={input}
            onChange={setInput}
            onSubmit={onSubmit}
            disabled={isLoading}
            size="md"
          />
        </Box>
      </Box>
    </Stack>
  );
}
