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
import { MicrosoftProvider } from "./providers/microsoft";
import { GoogleProvider } from "./providers/google";
import { JPMorganProvider } from "./providers/jpmorgan";
import { McKinseyProvider } from "./providers/mckinsey";
import { BlackRockProvider, GoldmanSachsProvider, MorganStanleyProvider, BCGProvider } from "./providers/greenhouse";

export const ALL_PROVIDERS: JobProvider[] = [
  // ── 中国大厂 ────────────────────────────────────────
  new TencentProvider(),       // ✅ 200+ 校招岗位

  // ── 中国大厂（需 cookie） ───────────────────────────
  new ByteDanceProvider(),
  new MeituanProvider(),
  new AlibabaProvider(),
  new BaiduProvider(),
  new NetEaseProvider(),
  new JDProvider(),
  new KuaishouProvider(),
  new XiaohongshuProvider(),
  new DiDiProvider(),

  // ── 中国金融 ─────────────────────────────────────────
  new CICCProvider(),
  new CITICProvider(),
  new HuataiProvider(),
  new EFundProvider(),
  new ChinaAMCProvider(),

  // ── 外企在华/港 ────────────────────────────────────
  // 仅抓中国大陆 + 香港的岗位；没数据时静默返回 []
  new GoogleProvider(),
  new MicrosoftProvider(),
  new JPMorganProvider(),
  new McKinseyProvider(),
  GoldmanSachsProvider,        // Greenhouse token 待确认
  MorganStanleyProvider,       // Greenhouse token 待确认
  BlackRockProvider,           // Greenhouse token 待确认
  BCGProvider,                 // Greenhouse token 待确认
];

export const PROVIDER_IDS = ALL_PROVIDERS.map((p) => p.id);

export function getProvider(id: string): JobProvider | undefined {
  return ALL_PROVIDERS.find((p) => p.id === id);
}
