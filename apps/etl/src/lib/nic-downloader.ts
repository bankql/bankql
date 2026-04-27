import path from "node:path";
import fs from "node:fs/promises";
import { chromium, type BrowserContext } from "playwright";

const FFIEC_BASE = "https://www.ffiec.gov";
const DATA_DOWNLOAD_URL = `${FFIEC_BASE}/npw/FinancialReport/DataDownload`;

export interface NicDownload {
  endpoint: string;
  outPath: string;
}

// FFIEC's NIC bulk-download URLs sit behind a Cloudflare bot challenge that
// requires running the JS challenge to mint a __cf_bm cookie. Playwright's
// real Chromium does this automatically; the listing page also exposes
// onclick=fnName() handlers that just `window.location.href = '/npw/...'`,
// which we trigger from the same context so the cookie is reused.
export async function downloadNicZips(downloads: NicDownload[]): Promise<void> {
  if (downloads.length === 0) return;
  // Cloudflare's bot detection flags headless Chromium via the
  // `navigator.webdriver` flag and the AutomationControlled blink feature.
  // Disabling those + using a real-ish UA gets us past the challenge.
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });
  try {
    const ctx = await browser.newContext({
      acceptDownloads: true,
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
    });
    await ctx.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });
    await primeCloudflare(ctx);
    // Use a fresh page per download. After a download response (HTTP 200 +
    // Content-Disposition: attachment), the page sits in a transient state
    // that breaks subsequent page.goto / evaluate calls — opening a new
    // page each time sidesteps that. The context's __cf_bm cookie is
    // shared, so we don't re-trigger the Cloudflare challenge.
    for (const { endpoint, outPath } of downloads) {
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      console.log(`[nic] Downloading ${endpoint} → ${outPath}`);
      const page = await ctx.newPage();
      try {
        const downloadPromise = page.waitForEvent("download", { timeout: 120_000 });
        // page.goto throws "net::ERR_ABORTED" on a download response since
        // no document loads — ignore that error and rely on the download
        // event firing.
        await page.goto(endpoint, { timeout: 120_000 }).catch(() => {});
        const download = await downloadPromise;
        await download.saveAs(outPath);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

async function primeCloudflare(ctx: BrowserContext): Promise<void> {
  const page = await ctx.newPage();
  console.log(`[nic] Visiting ${DATA_DOWNLOAD_URL} to clear Cloudflare...`);
  await page.goto(DATA_DOWNLOAD_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
  // Cloudflare's interstitial uses the title "Just a moment..." until the
  // JS challenge resolves. Wait until the real page title shows up.
  await page.waitForFunction(
    () => !/Just a moment/i.test(document.title) && document.title.length > 0,
    undefined,
    { timeout: 30_000 },
  );
  await page.close();
}

export const NIC_ENDPOINTS = {
  attributesActive: `${FFIEC_BASE}/npw/FinancialReport/ReturnAttributesActiveZipFileCSV`,
  attributesClosed: `${FFIEC_BASE}/npw/FinancialReport/ReturnAttributesClosedZipFileCSV`,
  attributesBranches: `${FFIEC_BASE}/npw/FinancialReport/ReturnAttributesBranchesZipFileCSV`,
  relationships: `${FFIEC_BASE}/npw/FinancialReport/ReturnRelationshipsZipFileCSV`,
  transformations: `${FFIEC_BASE}/npw/FinancialReport/ReturnTransformationZipFileCSV`,
} as const;
