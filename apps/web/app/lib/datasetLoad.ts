import { useSyncExternalStore } from "react";

export type LoadPhase =
  | "queued"
  | "fetching"
  | "loading"
  | "ready"
  | "error";

export type LoadSource = "cache" | "network";

export interface DatasetLoadState {
  name: string;
  phase: LoadPhase;
  source?: LoadSource;
  bytesLoaded?: number;
  bytesTotal?: number;
  rows?: number;
  error?: string;
  elapsedMs?: number;
}

let state: Map<string, DatasetLoadState> = new Map();
const listeners = new Set<() => void>();

function notify() {
  state = new Map(state);
  listeners.forEach((l) => l());
}

export function initDatasetLoads(names: string[]): void {
  state = new Map();
  for (const name of names) {
    state.set(name, { name, phase: "queued" });
  }
  notify();
}

export function updateDatasetLoad(
  name: string,
  patch: Partial<DatasetLoadState>,
): void {
  const current = state.get(name);
  if (!current) return;
  state.set(name, { ...current, ...patch });
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Map<string, DatasetLoadState> {
  return state;
}

export function useDatasetLoads(): DatasetLoadState[] {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return Array.from(snap.values());
}
