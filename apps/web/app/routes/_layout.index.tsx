import { createFileRoute } from "@tanstack/react-router";
import ChatLanding from "~/domains/agent/ui/ChatLanding";

export const Route = createFileRoute("/_layout/")({
  component: Home,
});

function Home() {
  return <ChatLanding />;
}
