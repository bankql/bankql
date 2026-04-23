import { createFileRoute, Outlet } from "@tanstack/react-router";
import Layout from "~/domains/layout/ui/Layout";

export const Route = createFileRoute("/_layout")({
  component: LayoutRoute,
});

function LayoutRoute() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
