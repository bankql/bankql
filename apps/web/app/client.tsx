import { StartClient } from "@tanstack/react-start/client";
import { hydrateRoot } from "react-dom/client";
import { bootstrapData } from "~/lib/datasets";

hydrateRoot(document, <StartClient />);

bootstrapData().catch((err) => {
  console.error("Dataset bootstrap failed", err);
});
