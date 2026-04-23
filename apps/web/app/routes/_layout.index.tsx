import { createFileRoute } from "@tanstack/react-router";
import { Box, Heading } from "@chakra-ui/react";

export const Route = createFileRoute("/_layout/")({
  component: Home,
});

function Home() {
  return (
    <Box p="8">
      <Heading size="3xl">BankQL</Heading>
    </Box>
  );
}
