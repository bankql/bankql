import { createFileRoute } from "@tanstack/react-router";
import AboutPage from "~/domains/about/ui/AboutPage";

export const Route = createFileRoute("/_layout/about")({
  component: AboutPage,
});
