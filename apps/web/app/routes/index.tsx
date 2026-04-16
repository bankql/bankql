import { createFileRoute } from "@tanstack/react-router";
import { Container, Stack, Box, Center, Heading } from "@chakra-ui/react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <Box h={"100dvh"} w="100dvw">
      <Center h="full" w="full">
        <Container maxW={"8xl"}>
          <Heading textAlign={"center"} size={"7xl"}>
            Welcome to BankQL
          </Heading>
          <Heading textAlign={"center"} size={"3xl"}>
            Like the FDIC, but fun!
          </Heading>
        </Container>
      </Center>
    </Box>
  );
}
