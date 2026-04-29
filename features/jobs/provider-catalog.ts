import { JobProviderChannel, JobProviderId } from "@/features/jobs/providers/types";

export const jobProviderCatalog: Array<{
  id: JobProviderId;
  label: string;
  description: string;
  type: "live" | "mock";
  channel: JobProviderChannel;
}> = [
  {
    id: "greenhouse_live",
    label: "Greenhouse Live",
    description: "调用 Greenhouse 官方 Job Board API。",
    type: "live",
    channel: "ATS"
  },
  {
    id: "lever_live",
    label: "Lever Live",
    description: "调用 Lever 官方 Postings API。",
    type: "live",
    channel: "ATS"
  },
  {
    id: "campus_portal_live",
    label: "校招平台 Live",
    description: "预留给企业校招站、学校就业网、实习平台等中国校招来源。",
    type: "live",
    channel: "CHINA_CAMPUS"
  },
  {
    id: "campus_wechat_live",
    label: "公众号线索 Live",
    description: "预留给公众号文章解析、校招合集页等内容型来源。",
    type: "live",
    channel: "CHINA_CAMPUS"
  },
  {
    id: "greenhouse_mock",
    label: "Greenhouse Mock",
    description: "本地模拟 Greenhouse 结果，便于开发。",
    type: "mock",
    channel: "ATS"
  },
  {
    id: "lever_mock",
    label: "Lever Mock",
    description: "本地模拟 Lever 结果，便于开发。",
    type: "mock",
    channel: "ATS"
  },
  {
    id: "campus_portal_mock",
    label: "校招平台 Mock",
    description: "本地模拟中国校招平台结果，便于开发和后续接真实站点。",
    type: "mock",
    channel: "CHINA_CAMPUS"
  }
];
