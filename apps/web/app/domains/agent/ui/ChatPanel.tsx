import { Box, Stack, Text } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import Composer from "~/domains/agent/ui/Composer";
import MessageList from "~/domains/agent/ui/MessageList";
import { useAgent } from "~/domains/agent/hooks/useAgent";

export default function ChatPanel() {
  const { messages, sendMessage, isLoading } = useAgent();
  const [input, setInput] = useState("");

  const onSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage(text);
  }, [input, isLoading, sendMessage]);

  return (
    <Stack direction="column" h="full" w="full" gap="0">
      <Box flex="1" overflow="auto" p="4">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <MessageList messages={messages} />
        )}
      </Box>

      <Box borderTopWidth="1px" p="2">
        <Composer
          value={input}
          onChange={setInput}
          onSubmit={onSubmit}
          disabled={isLoading}
        />
      </Box>
    </Stack>
  );
}

function EmptyState() {
  return (
    <Stack direction="column" gap="2" align="center" pt="12" color="fg.muted">
      <Text textStyle="sm">
        Ask about FDIC institutions, deposits, or mergers.
      </Text>
      <Text textStyle="xs">
        The agent writes DuckDB SQL and runs it in your browser.
      </Text>
    </Stack>
  );
}
