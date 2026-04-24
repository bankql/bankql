import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AgentProvider } from "~/domains/agent/hooks/useAgent";
import Layout from "~/domains/layout/ui/Layout";

export const Route = createFileRoute("/_layout")({
  component: LayoutRoute,
});

function LayoutRoute() {
  return (
    <AgentProvider>
      <Layout>
        <Outlet />
      </Layout>
    </AgentProvider>
  );
}
