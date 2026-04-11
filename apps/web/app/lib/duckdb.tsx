import * as duckdb from "@duckdb/duckdb-wasm";
import { createContext, useContext, useEffect, useState } from "react";

interface DuckDBState {
  db: duckdb.AsyncDuckDB | null;
  conn: duckdb.AsyncDuckDBConnection | null;
  loading: boolean;
  error: Error | null;
}

const DuckDBContext = createContext<DuckDBState>({
  db: null,
  conn: null,
  loading: true,
  error: null,
});

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
  const [state, setState] = useState<DuckDBState>({
    db: null,
    conn: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    initDuckDB()
      .then(({ db, conn }) => {
        if (!cancelled) setState({ db, conn, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ db: null, conn: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DuckDBContext.Provider value={state}>{children}</DuckDBContext.Provider>
  );
}

export function useDuckDB(): DuckDBState {
  return useContext(DuckDBContext);
}
