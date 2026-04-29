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

export const ALL_PROVIDERS: JobProvider[] = [
  // 国内大厂
  new TencentProvider(),
  new ByteDanceProvider(),
  new MeituanProvider(),
  new AlibabaProvider(),
  new BaiduProvider(),
  new NetEaseProvider(),
  new JDProvider(),
  new KuaishouProvider(),
  new XiaohongshuProvider(),
  new DiDiProvider(),

  // 外资科技
  new GoogleProvider(),
  new MicrosoftProvider(),

  // 外资金融
  GoldmanSachsProvider,
  MorganStanleyProvider,
  BlackRockProvider,
  new JPMorganProvider(),
  new JaneStreetProvider(),

  // 咨询
  new McKinseyProvider(),
  BCGProvider,

  // 国内金融
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
