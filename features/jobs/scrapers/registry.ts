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
import { BlackRockProvider, GoldmanSachsProvider, MorganStanleyProvider, BCGProvider } from "./providers/greenhouse";
import { GoogleProvider } from "./providers/google";
import { MicrosoftProvider } from "./providers/microsoft";
import { JPMorganProvider } from "./providers/jpmorgan";
import { JaneStreetProvider } from "./providers/jane-street";
import { McKinseyProvider } from "./providers/mckinsey";
import { CICCProvider, CITICProvider, HuataiProvider, EFundProvider, ChinaAMCProvider } from "./providers/cn-finance";

/**
 * Provider tiers:
 *   ACTIVE  – confirmed working
 *   BEST_EFFORT – endpoint exists but may require auth or return 0; kept for monitoring
 *
 * Chinese campus APIs (all except Tencent) require session login — returns 0 gracefully.
 * Foreign finance ATS board tokens need manual verification before enabling.
 */
export const ALL_PROVIDERS: JobProvider[] = [
  // ── ACTIVE ────────────────────────────────────────────────
  new TencentProvider(),          // ✅ working – multi-step campus API

  // ── CN Big Tech (cookie-auth; skip if *_COOKIES env not set) ──
  new ByteDanceProvider(),
  new MeituanProvider(),
  new AlibabaProvider(),
  new BaiduProvider(),
  new NetEaseProvider(),
  new JDProvider(),
  new KuaishouProvider(),
  new XiaohongshuProvider(),
  new DiDiProvider(),

  // ── BEST EFFORT: Foreign Tech ──────────────────────────────
  new GoogleProvider(),           // tries primary + fallback URL
  new MicrosoftProvider(),        // GCS API, may need header tuning

  // ── BEST EFFORT: Foreign Finance (Greenhouse board tokens unverified) ─
  GoldmanSachsProvider,
  MorganStanleyProvider,
  BlackRockProvider,
  new JPMorganProvider(),
  new JaneStreetProvider(),       // HTML scrape

  // ── BEST EFFORT: Consulting ────────────────────────────────
  new McKinseyProvider(),
  BCGProvider,

  // ── BEST EFFORT: CN Finance (HTML scrape) ─────────────────
  new CICCProvider(),
  new CITICProvider(),
  new HuataiProvider(),
  new EFundProvider(),
  new ChinaAMCProvider(),
];

export const PROVIDER_IDS = ALL_PROVIDERS.map((p) => p.id);

export function getProvider(id: string): JobProvider | undefined {
  return ALL_PROVIDERS.find((p) => p.id === id);
}
