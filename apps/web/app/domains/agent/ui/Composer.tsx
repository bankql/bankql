import { Flex, IconButton, Textarea } from "@chakra-ui/react";
import { useRef } from "react";
import { LuSend } from "react-icons/lu";

export default function Composer({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "Ask something…",
  autoFocus = false,
  size = "sm",
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <Flex direction="row" align="flex-end" gap="2" w="full">
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
        placeholder={placeholder}
        rows={1}
        resize="none"
        size={size}
        autoFocus={autoFocus}
      />
      <IconButton
        aria-label="Send"
        size={size}
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
      >
        <LuSend />
      </IconButton>
    </Flex>
  );
}
