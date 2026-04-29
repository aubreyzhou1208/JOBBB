/**
 * Shared browser launcher for Puppeteer-based providers.
 * Uses @sparticuz/chromium on Lambda/Render, local Chrome otherwise.
 * Both puppeteer-core and @sparticuz/chromium are optional dependencies.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _browser: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getBrowser(): Promise<any> {
  if (_browser && _browser.connected) return _browser;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const puppeteer = await import("puppeteer-core").then((m) => m.default ?? m).catch(() => {
    throw new Error("puppeteer-core is not installed. Add it as a dependency.");
  });

  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.RENDER;

  if (isLambda) {
    const chromium = await import("@sparticuz/chromium").then((m) => m.default ?? m).catch(() => {
      throw new Error("@sparticuz/chromium is not installed on this server.");
    });
    _browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } else {
    const paths = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
    ];
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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

    const data = await page.evaluate(() => {
      const w = window as unknown as Record<string, unknown>;
      return w.__INITIAL_STATE__ ?? w.__INITIAL_DATA__ ?? w.__SERVER_DATA__ ?? null;
    });
    return data;
  } finally {
    await page.close();
  }
}
