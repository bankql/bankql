import { createFileRoute, notFound } from "@tanstack/react-router";
import { events, locations } from "@bankql/schema";
import EntityDetailPage from "~/domains/datasets/ui/EntityDetailPage";
import { publishedDatasets } from "~/lib/datasets";

export const Route = createFileRoute("/_layout/datasets/$name/$id")({
  loader: ({ params }) => {
    const dataset = publishedDatasets.find((d) => d.name === params.name);
    if (!dataset || !dataset.index) throw notFound();
    if (!/^-?\d+$/.test(params.id)) throw notFound();
    return { dataset, indexField: dataset.index };
  },
  component: EntityDetailRoute,
});

function EntityDetailRoute() {
  const { dataset, indexField } = Route.useLoaderData();
  const { id } = Route.useParams();

  const related =
    dataset.name === "institutions"
      ? [
          {
            dataset: locations,
            whereField: "certificate",
            preview: ["uninum", "address", "city", "state"] as string[],
          },
          {
            dataset: events,
            whereField: "certificate",
            preview: [
              "transactionNumber",
              "changeCodeDescription",
              "city",
              "state",
            ] as string[],
          },
        ]
      : [];

  return (
    <EntityDetailPage
      dataset={dataset}
      indexField={indexField}
      id={id}
      related={related}
    />
  );
}
