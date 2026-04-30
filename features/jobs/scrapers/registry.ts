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
import { CICCProvider, CITICProvider, HuataiProvider, EFundProvider, ChinaAMCProvider } from "./providers/cn-finance";

/**
 * All providers are Chinese companies only.
 * ACTIVE  – confirmed returning data without auth
 * COOKIE  – reads *_COOKIES env var; skips if not set
 */
export const ALL_PROVIDERS: JobProvider[] = [
  // ── ACTIVE ─────────────────────────────────────────
  new TencentProvider(),       // ✅ 200+ campus jobs

  // ── COOKIE (set via scripts/harvest-cookies.ts) ────
  new ByteDanceProvider(),
  new MeituanProvider(),
  new AlibabaProvider(),
  new BaiduProvider(),
  new NetEaseProvider(),
  new JDProvider(),
  new KuaishouProvider(),
  new XiaohongshuProvider(),
  new DiDiProvider(),

  // ── CN Finance (HTML scrape) ───────────────────────
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
