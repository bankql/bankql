import { createFileRoute, notFound } from "@tanstack/react-router";
import { allDatasets, type DatasetDef } from "@bankql/schema";
import DatasetPage from "~/domains/datasets/ui/DatasetPage";

export const Route = createFileRoute("/_layout/datasets/$name")({
  loader: ({ params }) => {
    const dataset = (allDatasets as unknown as DatasetDef[]).find(
      (d) => d.name === params.name,
    );
    if (!dataset) throw notFound();
    return { dataset };
  },
  component: DatasetRoute,
});

function DatasetRoute() {
  const { dataset } = Route.useLoaderData();
  return <DatasetPage dataset={dataset} />;
}
