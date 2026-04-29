/**
 * Shared browser launcher for Puppeteer-based providers.
 * Uses @sparticuz/chromium on Lambda/Render, local Chrome otherwise.
 */
import puppeteer, { Browser } from "puppeteer-core";

let _browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (_browser && _browser.connected) return _browser;

  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.RENDER;

  if (isLambda) {
    const chromium = await import("@sparticuz/chromium");
    _browser = await puppeteer.launch({
      args: chromium.default.args,
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
  } else {
    // Local dev: find system Chrome
    const paths = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
    ];
    const executablePath = paths.find((p) => {
      try { require("fs").accessSync(p); return true; } catch { return false; }
    });
    if (!executablePath) throw new Error("Chrome not found. Install Google Chrome to use Puppeteer providers.");
    _browser = await puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
  }

  _browser.on("disconnected", () => { _browser = null; });
  return _browser;
}

export async function fetchPageJson(url: string, waitFor?: string): Promise<unknown> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    await page.setExtraHTTPHeaders({ "Accept-Language": "zh-CN,zh;q=0.9" });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    if (waitFor) await page.waitForSelector(waitFor, { timeout: 10000 }).catch(() => {});

    // Try to extract JSON from the page's XHR responses by evaluating window.__INITIAL_STATE__ or similar
    const data = await page.evaluate(() => {
      // Common patterns Chinese SPAs use to embed data
      const w = window as unknown as Record<string, unknown>;
      return w.__INITIAL_STATE__ ?? w.__INITIAL_DATA__ ?? w.__SERVER_DATA__ ?? null;
    });
    return data;
  } finally {
    await page.close();
  }
}
