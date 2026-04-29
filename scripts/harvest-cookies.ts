/**
 * Cookie Harvester – one-time setup for Chinese campus recruitment sites.
 *
 * Usage:
 *   npx ts-node scripts/harvest-cookies.ts
 *
 * Opens each company's login page in a real (visible) Chrome window.
 * YOU log in manually (handles SMS codes, CAPTCHA etc.).
 * The script detects when you're logged in, extracts session cookies,
 * and writes them to .env automatically.
 */

import puppeteer, { Browser, Page, Protocol } from "puppeteer-core";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const ENV_PATH = path.join(__dirname, "../.env");

const SITES: {
  key: string;
  company: string;
  loginUrl: string;
  successCookies: string[];  // cookie names that appear after successful login
  postLoginUrl?: string;
}[] = [
  {
    key: "BYTEDANCE",
    company: "字节跳动",
    loginUrl: "https://campus.bytedance.com/",
    successCookies: ["passport_csrf_token", "sid_ucp_v1", "sso_uid_tt"],
    postLoginUrl: "https://campus.bytedance.com/",
  },
  {
    key: "MEITUAN",
    company: "美团",
    loginUrl: "https://campus.meituan.com/",
    successCookies: ["userid", "token", "auth_token", "session"],
  },
  {
    key: "BAIDU",
    company: "百度",
    loginUrl: "https://talent.baidu.com/external/baidu/campus.html",
    successCookies: ["BDUSS", "BAIDUID_BFESS", "userInfo"],
  },
  {
    key: "ALIBABA",
    company: "阿里巴巴",
    loginUrl: "https://talent.alibaba.com/campus/",
    successCookies: ["login_aliyunid_ticket", "cookie2", "t"],
  },
  {
    key: "JD",
    company: "京东",
    loginUrl: "https://campus.jd.com/",
    successCookies: ["pin", "thor", "3AB9D23F7A4B3C9B"],
  },
  {
    key: "KUAISHOU",
    company: "快手",
    loginUrl: "https://campus.kuaishou.com/recruit/campus",
    successCookies: ["userId", "kuaishou.server.webtoken", "kpf"],
  },
  {
    key: "XIAOHONGSHU",
    company: "小红书",
    loginUrl: "https://job.xiaohongshu.com/",
    successCookies: ["customer-app-user-id", "access_token", "userId"],
  },
  {
    key: "DIDI",
    company: "滴滴",
    loginUrl: "https://campus.didiglobal.com/campus/",
    successCookies: ["ums_token", "userId", "sessionId"],
  },
];

function findChrome(): string {
  const paths = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("找不到 Chrome，请先安装 Google Chrome。");
}

function readEnv(): Record<string, string> {
  if (!fs.existsSync(ENV_PATH)) return {};
  const lines = fs.readFileSync(ENV_PATH, "utf-8").split("\n");
  const env: Record<string, string> = {};
  for (const line of lines) {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
  }
  return env;
}

function writeEnv(updates: Record<string, string>) {
  const current = readEnv();
  const merged = { ...current, ...updates };
  const content = Object.entries(merged)
    .map(([k, v]) => `${k}="${v}"`)
    .join("\n");
  fs.writeFileSync(ENV_PATH, content + "\n");
  console.log(`✅ 已写入 .env`);
}

function serializeCookies(cookies: Protocol.Network.Cookie[]): string {
  return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
}

async function waitForLogin(
  page: Page,
  successCookies: string[],
  timeoutMs = 180000
): Promise<Protocol.Network.Cookie[] | null> {
  const deadline = Date.now() + timeoutMs;
  console.log(`⏳ 等待你登录（最多 ${timeoutMs / 1000} 秒）…`);

  while (Date.now() < deadline) {
    const cookies = await page.cookies();
    const hasAll = successCookies.some((name) =>
      cookies.some((c) => c.name === name && c.value)
    );
    if (hasAll) return cookies;
    await new Promise((r) => setTimeout(r, 2000));
  }
  return null;
}

async function harvestSite(
  browser: Browser,
  site: typeof SITES[0]
): Promise<string | null> {
  console.log(`\n🌐 打开 ${site.company} 登录页…`);
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.goto(site.loginUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    console.log(`👉 请在浏览器窗口里完成 ${site.company} 的登录操作（支持短信验证码）`);
    const cookies = await waitForLogin(page, site.successCookies);

    if (!cookies) {
      console.log(`⚠️  ${site.company} 登录超时，跳过。`);
      return null;
    }

    const cookieStr = serializeCookies(cookies);
    console.log(`✅ ${site.company} 登录成功，已获取 ${cookies.length} 个 Cookie`);
    return cookieStr;
  } catch (err) {
    console.error(`❌ ${site.company} 出错:`, err);
    return null;
  } finally {
    await page.close();
  }
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans); }));
}

async function main() {
  console.log("=== 🔑 Campus 招聘 Cookie 采集器 ===\n");
  console.log("此脚本会打开 Chrome 让你手动登录各公司的校招页面。");
  console.log("登录完成后自动提取 Cookie 并保存到 .env 文件。\n");

  const allSiteKeys = SITES.map((s, i) => `  ${i + 1}. ${s.company} (${s.key})`).join("\n");
  console.log("可采集的公司：\n" + allSiteKeys);

  const ans = await prompt("\n输入要采集的编号（逗号分隔，回车全选）：");
  const indices =
    ans.trim()
      ? ans.split(",").map((n) => parseInt(n.trim()) - 1).filter((i) => i >= 0 && i < SITES.length)
      : SITES.map((_, i) => i);

  const selected = indices.map((i) => SITES[i]);
  console.log(`\n将采集：${selected.map((s) => s.company).join("、")}\n`);

  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: false, // VISIBLE browser – user needs to log in
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: null,
  });

  const updates: Record<string, string> = {};

  for (const site of selected) {
    const cookies = await harvestSite(browser, site);
    if (cookies) {
      updates[`${site.key}_COOKIES`] = cookies;
    }

    if (site !== selected[selected.length - 1]) {
      await prompt(`\n按回车继续采集下一家（${selected[selected.indexOf(site) + 1]?.company}）…`);
    }
  }

  await browser.close();

  if (Object.keys(updates).length > 0) {
    writeEnv(updates);
    console.log("\n🎉 采集完成！已保存以下 Cookie 到 .env：");
    Object.keys(updates).forEach((k) => console.log(`  ${k}`));
    console.log("\n⚠️  注意：Cookie 通常在 7-30 天后过期，过期后需重新运行此脚本。");
  } else {
    console.log("\n没有成功采集任何 Cookie。");
  }
}

main().catch(console.error);
