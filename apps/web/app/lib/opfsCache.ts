const ROOT_DIR = "bankql-parquet-cache";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

export interface CacheMeta {
  cachedAt: number;
  size: number;
}

let opfsSupported: boolean | null = null;

export async function isOPFSAvailable(): Promise<boolean> {
  if (opfsSupported !== null) return opfsSupported;
  try {
    await navigator.storage.getDirectory();
    opfsSupported = true;
  } catch {
    opfsSupported = false;
  }
  return opfsSupported;
}

async function getCacheDir(): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(ROOT_DIR, { create: true });
}

const dataFile = (name: string) => `${name}.parquet`;
const metaFile = (name: string) => `${name}.meta.json`;

async function readBytes(
  dir: FileSystemDirectoryHandle,
  fileName: string,
): Promise<Uint8Array | null> {
  try {
    const handle = await dir.getFileHandle(fileName);
    const file = await handle.getFile();
    return new Uint8Array(await file.arrayBuffer());
  } catch {
    return null;
  }
}

async function readText(
  dir: FileSystemDirectoryHandle,
  fileName: string,
): Promise<string | null> {
  try {
    const handle = await dir.getFileHandle(fileName);
    const file = await handle.getFile();
    return file.text();
  } catch {
    return null;
  }
}

async function writeFile(
  dir: FileSystemDirectoryHandle,
  fileName: string,
  data: Uint8Array | string,
) {
  const handle = await dir.getFileHandle(fileName, { create: true });
  const writable = await handle.createWritable();
  await writable.write(data as FileSystemWriteChunkType);
  await writable.close();
}

export async function readCache(name: string): Promise<Uint8Array | null> {
  if (!(await isOPFSAvailable())) return null;
  try {
    return readBytes(await getCacheDir(), dataFile(name));
  } catch {
    return null;
  }
}

export async function readMeta(name: string): Promise<CacheMeta | null> {
  if (!(await isOPFSAvailable())) return null;
  try {
    const text = await readText(await getCacheDir(), metaFile(name));
    return text ? (JSON.parse(text) as CacheMeta) : null;
  } catch {
    return null;
  }
}

export async function writeCache(
  name: string,
  buffer: Uint8Array,
): Promise<void> {
  if (!(await isOPFSAvailable())) return;
  try {
    const dir = await getCacheDir();
    const meta: CacheMeta = { cachedAt: Date.now(), size: buffer.byteLength };
    await writeFile(dir, dataFile(name), buffer);
    await writeFile(dir, metaFile(name), JSON.stringify(meta));
  } catch (err) {
    console.warn(`OPFS: writeCache(${name}) failed`, err);
  }
}

export async function deleteEntry(name: string): Promise<void> {
  if (!(await isOPFSAvailable())) return;
  try {
    const dir = await getCacheDir();
    await dir.removeEntry(dataFile(name)).catch(() => {});
    await dir.removeEntry(metaFile(name)).catch(() => {});
  } catch {
    // best-effort
  }
}

export async function clearCache(): Promise<void> {
  if (!(await isOPFSAvailable())) return;
  try {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(ROOT_DIR, { recursive: true });
  } catch {
    // cache may not exist yet
  }
}

export function isFresh(meta: CacheMeta, ttlMs = DEFAULT_TTL_MS): boolean {
  return Date.now() - meta.cachedAt < ttlMs;
}
