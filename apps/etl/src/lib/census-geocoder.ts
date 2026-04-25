/**
 * U.S. Census Bureau batch geocoder client.
 *
 * Endpoint: https://geocoding.geo.census.gov/geocoder/locations/addressbatch
 * Public, no API key. Hard cap of 10,000 addresses per request — we use 9k
 * to leave margin. Match rate on FDIC branch addresses is typically 70–85%.
 *
 * Response CSV columns (no header):
 *   id, input_address, match_status, match_quality, matched_address,
 *   lon_lat, tigerline_id, side
 *
 * `lon_lat` is `lon,lat` (REVERSED from the typical lat,lng order).
 * `match_status` is one of: Match | No_Match | Tie.
 */

const BATCH_URL =
  "https://geocoding.geo.census.gov/geocoder/locations/addressbatch";
const BENCHMARK = "Public_AR_Current";
const BATCH_SIZE = 9000;

export interface GeocodeAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export type GeocodeQuality = "exact" | "non_exact" | "tie" | "no_match";

export interface GeocodeResult {
  id: string;
  quality: GeocodeQuality;
  latitude: number | null;
  longitude: number | null;
  matchedAddress: string | null;
}

/**
 * Geocode an array of addresses, chunking automatically into 9k batches.
 * Returns one result per input address (matched by id).
 */
export async function geocodeAddresses(
  addresses: GeocodeAddress[],
): Promise<GeocodeResult[]> {
  const out: GeocodeResult[] = [];
  for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
    const chunk = addresses.slice(i, i + BATCH_SIZE);
    const batchNo = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(addresses.length / BATCH_SIZE);
    console.log(
      `[census] batch ${batchNo}/${totalBatches} — ${chunk.length} addresses`,
    );
    const results = await geocodeBatch(chunk);
    out.push(...results);
  }
  return out;
}

async function geocodeBatch(
  addresses: GeocodeAddress[],
): Promise<GeocodeResult[]> {
  const csv = addresses
    .map((a) =>
      [a.id, a.street, a.city, a.state, a.zip].map(csvEscape).join(","),
    )
    .join("\n");

  const form = new FormData();
  form.set(
    "addressFile",
    new Blob([csv], { type: "text/csv" }),
    "addresses.csv",
  );
  form.set("benchmark", BENCHMARK);

  const res = await fetch(BATCH_URL, { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(`Census batch geocoder ${res.status}: ${await res.text()}`);
  }
  const body = await res.text();
  return parseCensusBatchResponse(body);
}

export function parseCensusBatchResponse(body: string): GeocodeResult[] {
  const lines = splitCsvLines(body);
  const out: GeocodeResult[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    // Expect at least 6 columns: id, input_address, match_status,
    // match_quality, matched_address, lon_lat. tigerline_id and side may be absent.
    if (cols.length < 6) continue;
    const [id, , matchStatusRaw, matchQualityRaw, matchedAddress, lonLat] =
      cols;
    out.push({
      id,
      ...parseQualityAndCoords(
        matchStatusRaw,
        matchQualityRaw,
        matchedAddress,
        lonLat,
      ),
    });
  }
  return out;
}

function parseQualityAndCoords(
  matchStatus: string,
  matchQuality: string,
  matchedAddress: string,
  lonLat: string,
): Pick<GeocodeResult, "quality" | "latitude" | "longitude" | "matchedAddress"> {
  if (matchStatus === "Tie") {
    return {
      quality: "tie",
      latitude: null,
      longitude: null,
      matchedAddress: null,
    };
  }
  if (matchStatus !== "Match") {
    return {
      quality: "no_match",
      latitude: null,
      longitude: null,
      matchedAddress: null,
    };
  }
  // matchStatus === "Match"
  const [lonStr, latStr] = lonLat.split(",");
  const longitude = Number.parseFloat(lonStr);
  const latitude = Number.parseFloat(latStr);
  const quality: GeocodeQuality =
    matchQuality === "Exact" ? "exact" : "non_exact";
  return {
    quality,
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    matchedAddress: matchedAddress || null,
  };
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Split CSV body into logical lines, respecting quoted fields that contain newlines.
 * Census responses are normally single-line per row, but be defensive.
 */
function splitCsvLines(body: string): string[] {
  const lines: string[] = [];
  let buf = "";
  let inQuotes = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '"') {
      if (inQuotes && body[i + 1] === '"') {
        buf += '""';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      buf += ch;
      continue;
    }
    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (buf.length > 0) lines.push(buf);
      buf = "";
      if (ch === "\r" && body[i + 1] === "\n") i++;
      continue;
    }
    buf += ch;
  }
  if (buf.length > 0) lines.push(buf);
  return lines;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let buf = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        buf += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(buf);
      buf = "";
      continue;
    }
    buf += ch;
  }
  out.push(buf);
  return out;
}
