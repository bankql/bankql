import {
  Box,
  Code,
  Collapsible,
  Flex,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prose } from "~/lib/prose";
import type { MessagePart, UIMessage } from "@tanstack/ai-client";
import type { RenderTileOutput, TileConfig } from "@bankql/schema";
import TileRenderer from "~/domains/agent/ui/TileRenderer";

export default function MessageList({ messages }: { messages: UIMessage[] }) {
  return (
    <Stack direction="column" gap="4">
      {messages.map((m) => (
        <MessageView key={m.id} message={m} />
      ))}
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
    case "tool-call": {
      const toolName = (part as { toolName?: string }).toolName ?? "";
      const input = part.input as Record<string, unknown> | undefined;
      if (toolName === "render_tile") {
        const config = input?.config as TileConfig | undefined;
        const preview = config?.title ?? "";
        const body = JSON.stringify(config ?? {}, null, 2);
        return (
          <ToolPartCollapsible
            label="render_tile"
            preview={preview}
            body={body}
          />
        );
      }
      const sql =
        input && "sql" in input
          ? String((input as { sql: unknown }).sql)
          : String(part.arguments ?? "");
      return (
        <ToolPartCollapsible label="query_data" preview={sql} body={sql} />
      );
    }
    case "tool-result": {
      const toolName = (part as { toolName?: string }).toolName ?? "";
      if (
        toolName === "render_tile" &&
        part.state !== "error" &&
        part.content
      ) {
        const tile = parseRenderTileResult(part.content);
        if (tile) {
          return <TileRenderer config={tile.config} rows={tile.rows} />;
        }
      }
      const body = String(part.error ?? part.content ?? "");
      const label = part.state === "error" ? "error" : "result";
      return <ToolPartCollapsible label={label} preview={body} body={body} />;
    }
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

function parseRenderTileResult(content: unknown): RenderTileOutput | null {
  try {
    const parsed =
      typeof content === "string" ? JSON.parse(content) : content;
    if (
      parsed &&
      typeof parsed === "object" &&
      "config" in parsed &&
      "rows" in parsed
    ) {
      return parsed as RenderTileOutput;
    }
  } catch {
    return null;
  }
  return null;
}

function ToolPartCollapsible({
  label,
  preview,
  body,
}: {
  label: string;
  preview: string;
  body: string;
}) {
  const summary = preview.replace(/\s+/g, " ").trim().slice(0, 80);
  return (
    <Collapsible.Root>
      <Box borderWidth="1px" rounded="sm" bg="bg" overflow="hidden">
        <Collapsible.Trigger asChild>
          <Flex
            as="button"
            direction="row"
            align="center"
            gap="2"
            px="2"
            py="1"
            w="full"
            textAlign="left"
            cursor="pointer"
            _hover={{ bg: "bg.muted" }}
            _open={{ "& .chevron": { transform: "rotate(90deg)" } }}
          >
            <Box
              className="chevron"
              display="inline-flex"
              transition="transform 0.15s"
              color="fg.muted"
            >
              <LuChevronRight />
            </Box>
            <Text textStyle="xs" color="fg.muted" flexShrink="0">
              {label}
            </Text>
            <Text textStyle="xs" color="fg.subtle" truncate flex="1">
              {summary}
            </Text>
          </Flex>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Code
            display="block"
            whiteSpace="pre-wrap"
            fontSize="xs"
            p="2"
            bg="transparent"
            borderTopWidth="1px"
          >
            {body}
          </Code>
        </Collapsible.Content>
      </Box>
    </Collapsible.Root>
  );
}
