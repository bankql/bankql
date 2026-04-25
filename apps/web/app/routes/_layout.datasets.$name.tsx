import { createFileRoute, notFound } from "@tanstack/react-router";
import DatasetPage from "~/domains/datasets/ui/DatasetPage";
import { publishedDatasets } from "~/lib/datasets";

export const Route = createFileRoute("/_layout/datasets/$name")({
  loader: ({ params }) => {
    const dataset = publishedDatasets.find((d) => d.name === params.name);
    if (!dataset) throw notFound();
    return { dataset };
  },
  component: DatasetRoute,
});

function DatasetRoute() {
  const { dataset } = Route.useLoaderData();
  return <DatasetPage dataset={dataset} />;
}
