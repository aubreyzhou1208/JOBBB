export type GreenhouseLiveSource = {
  boardToken: string;
  companyName: string;
  sourceLabel?: string;
  countryFocus?: "CN" | "GLOBAL";
};

export type LeverLiveSource = {
  site: string;
  companyName: string;
  sourceLabel?: string;
  countryFocus?: "CN" | "GLOBAL";
};

export type ChinaCampusLiveSource = {
  key: string;
  label: string;
  kind: "campus_portal" | "school_jobs" | "wechat_digest";
  notes: string;
};

export type CampusPortalHtmlFieldConfig = {
  selector: string;
  attr?: string;
};

export type CampusPortalHtmlParserConfig = {
  itemSelector: string;
  title: CampusPortalHtmlFieldConfig;
  location?: CampusPortalHtmlFieldConfig;
  summary?: CampusPortalHtmlFieldConfig;
  applyUrl?: CampusPortalHtmlFieldConfig;
  postedAt?: CampusPortalHtmlFieldConfig;
};

export type CampusPortalJsonParserConfig = {
  itemsPath: string[];
  titleKey: string[];
  locationKey?: string[];
  summaryKey?: string[];
  applyUrlKey?: string[];
  postedAtKey?: string[];
};

export type CampusPortalSourceDriver = "generic_html" | "generic_json" | "tencent_position_api";

export type TencentCampusApiConfig = {
  projectMappingUrl: string;
  searchUrl: string;
  detailUrl: string;
  referer: string;
  pageSize?: number;
  maxPages?: number;
  hongKongCityName?: string;
  mainlandRegionLabel?: string;
  hongKongRegionLabel?: string;
};

export type CompanyCampusPortalSource = {
  key: string;
  companyName: string;
  sourceLabel: string;
  listUrl: string;
  baseUrl?: string;
  driver: CampusPortalSourceDriver;
  format?: "html" | "json";
  parser?: CampusPortalHtmlParserConfig | CampusPortalJsonParserConfig;
  tencentApi?: TencentCampusApiConfig;
  tags: string[];
  defaultLocation?: string;
  workModeHint?: "REMOTE" | "HYBRID" | "ONSITE";
  employmentTypeHint?: "FULL_TIME" | "INTERN" | "NEW_GRAD" | "CONTRACT";
  notes?: string;
  enabled: boolean;
};

export const greenhouseLiveSources: GreenhouseLiveSource[] = [
  {
    boardToken: "appliedintuition",
    companyName: "Applied Intuition",
    sourceLabel: "Applied Intuition · Greenhouse",
    countryFocus: "GLOBAL"
  },
  {
    boardToken: "ziprecruiter",
    companyName: "ZipRecruiter",
    sourceLabel: "ZipRecruiter · Greenhouse",
    countryFocus: "GLOBAL"
  },
  {
    boardToken: "c3ai",
    companyName: "C3 AI",
    sourceLabel: "C3 AI · Greenhouse",
    countryFocus: "GLOBAL"
  }
];

export const leverLiveSources: LeverLiveSource[] = [
  {
    site: "lalamove",
    companyName: "Lalamove",
    sourceLabel: "Lalamove · Lever",
    countryFocus: "CN"
  },
  {
    site: "crypto",
    companyName: "Crypto.com",
    sourceLabel: "Crypto.com · Lever",
    countryFocus: "CN"
  },
  {
    site: "alluxio",
    companyName: "Alluxio",
    sourceLabel: "Alluxio · Lever",
    countryFocus: "CN"
  }
];

export const chinaCampusLiveSources: ChinaCampusLiveSource[] = [
  {
    key: "company-campus-sites",
    label: "企业校招官网",
    kind: "campus_portal",
    notes: "后续适合接各公司独立校招站，例如字节、腾讯、阿里、米哈游等。"
  },
  {
    key: "university-job-board",
    label: "学校就业网",
    kind: "school_jobs",
    notes: "后续适合接高校就业中心公开岗位列表或宣讲会岗位页。"
  },
  {
    key: "wechat-campus-digest",
    label: "校招公众号合集",
    kind: "wechat_digest",
    notes: "后续适合接校招资讯号、岗位合集页、实习内推汇总。"
  }
];

// 第一版企业校招官网抓取器配置位。
// 这里的目标是把“每个公司一个适配配置”变成数据，而不是把抓取逻辑硬编码进 provider。
// 第一批先登记你关心的公司来源，但在未确认稳定列表接口前默认 disabled。
export const companyCampusPortalSources: CompanyCampusPortalSource[] = [
  {
    key: "meituan-campus",
    companyName: "美团",
    sourceLabel: "美团 · 企业校招官网",
    listUrl: "https://zhaopin.meituan.com/web/campus",
    baseUrl: "https://zhaopin.meituan.com",
    driver: "generic_html",
    format: "html",
    parser: {
      itemSelector: "[data-campus-job-item]",
      title: { selector: "[data-campus-job-title]" },
      location: { selector: "[data-campus-job-location]" },
      summary: { selector: "[data-campus-job-summary]" },
      applyUrl: { selector: "a[data-campus-job-link]", attr: "href" },
      postedAt: { selector: "[data-campus-job-date]" }
    },
    tags: ["校招", "前端", "软件开发", "中国"],
    defaultLocation: "中国",
    workModeHint: "ONSITE",
    employmentTypeHint: "NEW_GRAD",
    notes: "已登记公司校招官网入口，待确认真实岗位列表接口或页面结构后启用。",
    enabled: false
  },
  {
    key: "tencent-campus",
    companyName: "腾讯",
    sourceLabel: "腾讯 · 企业校招官网",
    listUrl: "https://join.qq.com/post.html?query=p_2",
    baseUrl: "https://join.qq.com",
    driver: "tencent_position_api",
    tencentApi: {
      projectMappingUrl: "https://join.qq.com/api/v1/position/getProjectMapping",
      searchUrl: "https://join.qq.com/api/v1/position/searchPosition",
      detailUrl: "https://join.qq.com/api/v1/jobDetails/getJobDetailsByPostId",
      referer: "https://join.qq.com/post.html?query=p_2",
      pageSize: 40,
      maxPages: 5,
      hongKongCityName: "中国香港",
      mainlandRegionLabel: "中国大陆",
      hongKongRegionLabel: "中国香港"
    },
    tags: ["腾讯", "企业校招官网", "中国校招"],
    defaultLocation: "中国",
    workModeHint: "ONSITE",
    notes: "已接入腾讯校招官网真实岗位接口，支持校招 / 实习和中国大陆 / 香港分类。",
    enabled: true
  }
];

export const chinaCampusSourceStrategy = {
  focus: "中国校招 / 实习 / 应届岗位",
  rationale: [
    "优先接入在 Greenhouse / Lever 上公开发布校招、实习或毕业生岗位的公司。",
    "优先覆盖中国大陆、香港，以及对中国学生常见的东亚/全球新卒岗位。",
    "第一版不追求全网覆盖，而是先做一组稳定、可持续同步的公开 ATS 来源。"
  ],
  recommendedQueries: [
    "frontend engineer",
    "software engineer",
    "new grad",
    "graduate software engineer",
    "intern frontend",
    "校招 前端",
    "应届 软件工程师"
  ]
} as const;
