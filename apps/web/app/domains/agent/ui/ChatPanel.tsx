import {
  Box,
  Code,
  Flex,
  IconButton,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { LuSend } from "react-icons/lu";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAgent } from "~/domains/agent/hooks/useAgent";
import { Prose } from "~/lib/prose";
import type {
  MessagePart,
  UIMessage,
} from "@tanstack/ai-client";

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
          <Stack direction="column" gap="4">
            {messages.map((m) => (
              <MessageView key={m.id} message={m} />
            ))}
          </Stack>
        )}
      </Box>

      <Composer
        value={input}
        onChange={setInput}
        onSubmit={onSubmit}
        disabled={isLoading}
      />
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

function MessageView({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  return (
    <Box
      alignSelf={isUser ? "flex-end" : "flex-start"}
      maxW="90%"
      bg={isUser ? "bg.emphasized" : "bg.subtle"}
      rounded="md"
      px="3"
      py="2"
    >
      <Stack direction="column" gap="2">
        {message.parts.map((part, i) => (
          <PartView key={i} part={part} isUser={isUser} />
        ))}
      </Stack>
    </Box>
  );
}

function PartView({ part, isUser }: { part: MessagePart; isUser: boolean }) {
  switch (part.type) {
    case "text":
      if (isUser) {
        return (
          <Text textStyle="sm" whiteSpace="pre-wrap">
            {part.content}
          </Text>
        );
      }
      return (
        <Prose maxWidth="full">
          <Markdown remarkPlugins={[remarkGfm]}>{part.content}</Markdown>
        </Prose>
      );
    case "tool-call":
      return (
        <Box borderWidth="1px" rounded="sm" p="2" bg="bg">
          <Text textStyle="xs" color="fg.muted" mb="1">
            query_data
          </Text>
          <Code
            display="block"
            whiteSpace="pre-wrap"
            fontSize="xs"
            p="1"
            bg="transparent"
          >
            {part.input && typeof part.input === "object" && "sql" in part.input
              ? String((part.input as { sql: unknown }).sql)
              : part.arguments}
          </Code>
        </Box>
      );
    case "tool-result":
      return (
        <Box borderWidth="1px" rounded="sm" p="2" bg="bg">
          <Text textStyle="xs" color="fg.muted" mb="1">
            {part.state === "error" ? "error" : "result"}
          </Text>
          <Code
            display="block"
            whiteSpace="pre-wrap"
            fontSize="xs"
            p="1"
            bg="transparent"
          >
            {part.error ?? part.content}
          </Code>
        </Box>
      );
    case "thinking":
      return (
        <Text textStyle="xs" color="fg.muted" fontStyle="italic">
          {part.content}
        </Text>
      );
    default:
      return null;
  }
}

function Composer({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <Flex
      direction="row"
      align="flex-end"
      gap="2"
      p="2"
      borderTopWidth="1px"
    >
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Ask something…"
        rows={1}
        resize="none"
        size="sm"
      />
      <IconButton
        aria-label="Send"
        size="sm"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
      >
        <LuSend />
      </IconButton>
    </Flex>
  );
}
