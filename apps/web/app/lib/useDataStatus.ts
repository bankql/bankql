import { useEffect, useState } from "react";
import { dataReady } from "~/lib/datasets";

export type DataStatus = "loading" | "ready" | "error";

export function useDataStatus(): DataStatus {
  const [status, setStatus] = useState<DataStatus>("loading");
  useEffect(() => {
    let cancelled = false;
    dataReady
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return status;
}
