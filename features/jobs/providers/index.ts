import { searchChinaCampusLiveSources, searchChinaWechatSources } from "@/features/jobs/providers/china-campus-live-provider";
import { chinaCampusMockProvider } from "@/features/jobs/providers/china-campus-mock-provider";
import { searchGreenhouseLiveSources } from "@/features/jobs/providers/greenhouse-live-provider";
import { greenhouseMockProvider } from "@/features/jobs/providers/greenhouse-mock-provider";
import { searchLeverLiveSources } from "@/features/jobs/providers/lever-live-provider";
import { leverMockProvider } from "@/features/jobs/providers/lever-mock-provider";
import { JobSearchProvider } from "@/features/jobs/providers/types";

export const jobProviders: JobSearchProvider[] = [
  {
    id: "greenhouse_live",
    label: "Greenhouse Live",
    description: "调用 Greenhouse 官方 Job Board API。",
    channel: "ATS",
    search: ({ query }) => searchGreenhouseLiveSources(query)
  },
  {
    id: "lever_live",
    label: "Lever Live",
    description: "调用 Lever 官方 Postings API。",
    channel: "ATS",
    search: ({ query }) => searchLeverLiveSources(query)
  },
  {
    id: "campus_portal_live",
    label: "企业校招官网",
    description: "面向企业校招官网的真实同步来源。",
    channel: "CHINA_CAMPUS",
    search: ({ query }) => searchChinaCampusLiveSources(query)
  },
  {
    id: "campus_wechat_live",
    label: "公众号线索 Live",
    description: "预留给公众号文章解析、校招合集页等内容型来源。",
    channel: "CHINA_CAMPUS",
    search: ({ query }) => searchChinaWechatSources(query)
  },
  greenhouseMockProvider,
  leverMockProvider,
  chinaCampusMockProvider
];
