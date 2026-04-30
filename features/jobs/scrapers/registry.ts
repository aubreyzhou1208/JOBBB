import { JobProvider } from "./base";
import { TencentProvider } from "./providers/tencent";
import { ByteDanceProvider } from "./providers/bytedance";
import { MeituanProvider } from "./providers/meituan";
import { AlibabaProvider } from "./providers/alibaba";
import { BaiduProvider } from "./providers/baidu";
import { NetEaseProvider } from "./providers/netease";
import { JDProvider } from "./providers/jd";
import { KuaishouProvider } from "./providers/kuaishou";
import { XiaohongshuProvider } from "./providers/xiaohongshu";
import { DiDiProvider } from "./providers/didi";
import { MicrosoftProvider } from "./providers/microsoft";
import { JaneStreetProvider } from "./providers/jane-street";
import { CICCProvider, CITICProvider, HuataiProvider, EFundProvider, ChinaAMCProvider } from "./providers/cn-finance";

/**
 * ACTIVE  – confirmed returning data
 * COOKIE  – returns data only when *_COOKIES env var is set
 * PENDING – API endpoint unverified; disabled until correct URL found
 *
 * Disabled (PENDING): Google, Goldman Sachs, Morgan Stanley, BlackRock,
 *   JP Morgan, McKinsey, BCG — their ATS endpoints need browser-level
 *   network inspection to discover. Re-enable once board tokens confirmed.
 */
export const ALL_PROVIDERS: JobProvider[] = [
  // ── ACTIVE ────────────────────────────────────────────────────
  new TencentProvider(),       // ✅ 200+ campus jobs via public API
  new JaneStreetProvider(),    // ✅ Greenhouse board: janestreet

  // ── ACTIVE when *_COOKIES set (cookie harvester) ──────────────
  new ByteDanceProvider(),
  new MeituanProvider(),
  new AlibabaProvider(),
  new BaiduProvider(),
  new NetEaseProvider(),
  new JDProvider(),
  new KuaishouProvider(),
  new XiaohongshuProvider(),
  new DiDiProvider(),

  // ── BEST EFFORT: Foreign Tech ─────────────────────────────────
  new MicrosoftProvider(),     // GCS API – may return 0 without auth

  // ── BEST EFFORT: CN Finance (HTML scrape) ─────────────────────
  new CICCProvider(),
  new CITICProvider(),
  new HuataiProvider(),
  new EFundProvider(),
  new ChinaAMCProvider(),

  // ── PENDING (wrong ATS tokens / need browser inspection) ──────
  // new GoogleProvider(),        // SPA – need XHR endpoint
  // GoldmanSachsProvider,        // Not Greenhouse – ATS unknown
  // MorganStanleyProvider,       // Not Greenhouse – ATS unknown
  // BlackRockProvider,           // Workday – board name unknown
  // new JPMorganProvider(),      // Has DDOS protection
  // new McKinseyProvider(),      // Workday – board name unknown
  // BCGProvider,                 // Workday – board name unknown
];

export const PROVIDER_IDS = ALL_PROVIDERS.map((p) => p.id);

export function getProvider(id: string): JobProvider | undefined {
  return ALL_PROVIDERS.find((p) => p.id === id);
}
