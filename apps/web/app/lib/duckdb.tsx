import * as duckdb from "@duckdb/duckdb-wasm";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  type DatasetName,
  type DatasetState,
  type SyncState,
  initialSyncState,
  syncAllDatasets,
} from "~/lib/parquet-sync";

interface DuckDBState {
  db: duckdb.AsyncDuckDB | null;
  conn: duckdb.AsyncDuckDBConnection | null;
  loading: boolean;
  error: Error | null;
  datasets: SyncState;
}

const INITIAL_STATE: DuckDBState = {
  db: null,
  conn: null,
  loading: true,
  error: null,
  datasets: initialSyncState(),
};

const DuckDBContext = createContext<DuckDBState>(INITIAL_STATE);

async function initDuckDB(): Promise<{
  db: duckdb.AsyncDuckDB;
  conn: duckdb.AsyncDuckDBConnection;
}> {
  const bundles = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(bundles);

  const worker = await duckdb.createWorker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
  const db = new duckdb.AsyncDuckDB(logger, worker);

  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  const conn = await db.connect();

  return { db, conn };
}

export function DuckDBProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DuckDBState>(INITIAL_STATE);
  const instanceRef = useRef<{ db: duckdb.AsyncDuckDB; conn: duckdb.AsyncDuckDBConnection } | null>(null);

  useEffect(() => {
    let cancelled = false;

    initDuckDB()
      .then(({ db, conn }) => {
        if (cancelled) {
          conn.close();
          db.terminate();
          return;
        }

        instanceRef.current = { db, conn };
        setState((s) => ({ ...s, db, conn, loading: false }));

        syncAllDatasets(db, duckdb.DuckDBDataProtocol, (name: DatasetName, datasetState: DatasetState) => {
          if (!cancelled) {
            setState((s) => ({
              ...s,
              datasets: { ...s.datasets, [name]: datasetState },
            }));
          }
        });
      })
      .catch((error) => {
        if (!cancelled) setState({ ...INITIAL_STATE, loading: false, error });
      });

    return () => {
      cancelled = true;
      if (instanceRef.current) {
        instanceRef.current.conn.close();
        instanceRef.current.db.terminate();
        instanceRef.current = null;
      }
    };
  }, []);

  return (
    <DuckDBContext.Provider value={state}>{children}</DuckDBContext.Provider>
  );
}

export function useDuckDB(): DuckDBState {
  return useContext(DuckDBContext);
}
