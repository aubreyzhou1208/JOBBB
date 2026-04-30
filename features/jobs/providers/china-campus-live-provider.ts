import { load } from "cheerio";

import {
  CampusPortalHtmlFieldConfig,
  CampusPortalHtmlParserConfig,
  CampusPortalJsonParserConfig,
  CompanyCampusPortalSource,
  companyCampusPortalSources
} from "@/features/jobs/providers/live-source-config";
import {
  extractTags,
  inferEmploymentType,
  inferWorkMode,
  matchesChinaCampusFocus,
  matchesQuery,
  stripHtml
} from "@/features/jobs/providers/live-shared";
import { JobEmploymentType } from "@/lib/types";

import { JobIngestionDraft, JobSearchResult } from "@/features/jobs/providers/types";

type TencentProjectMappingGroup = {
  recruitType?: number;
  recruitTypeName?: string;
  subProjectList?: Array<{
    mappingId?: number;
    projectName?: string;
    status?: number;
  }>;
};

type TencentSearchItem = {
  postId?: string;
  positionTitle?: string;
  projectName?: string;
  recruitLabelName?: string;
  workCities?: string;
};

type TencentSearchResponse = {
  status?: number;
  data?: {
    count?: number;
    positionList?: TencentSearchItem[];
  };
};

type TencentDetailResponse = {
  status?: number;
  data?: {
    postId?: string;
    title?: string;
    desc?: string;
    request?: string;
    workCityList?: string[];
    recruitCityList?: string[];
    projectId?: number;
    projectName?: string;
    recruitType?: number;
    recruitLabelName?: string;
    introduction?: string;
    graduateBonus?: string;
    internBonus?: string;
  };
};

type TencentProjectMeta = {
  employmentType: JobEmploymentType;
  primaryTag: string;
  projectName: string;
};

function getNestedValue(input: unknown, path: string[] | undefined) {
  if (!path?.length) return undefined;

  let current: unknown = input;

  for (const key of path) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
      continue;
    }

    return undefined;
  }

  return current;
}

function getStringByPath(input: unknown, path: string[] | undefined) {
  const value = getNestedValue(input, path);
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function normalizeText(value: string) {
  return stripHtml(value).replace(/\s+/g, " ").trim();
}

function resolveUrl(value: string, source: CompanyCampusPortalSource) {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const base = source.baseUrl ?? source.listUrl;

  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
}

function extractHtmlField($item: any, config: CampusPortalHtmlFieldConfig | undefined) {
  if (!config) return "";
  const element = $item.find(config.selector).first();
  const raw = config.attr ? element.attr(config.attr) ?? "" : element.text();
  return normalizeText(raw);
}

function fallbackDeadline(postedAt: string, offsetDays = 30) {
  const base = postedAt ? new Date(postedAt) : new Date();
  if (Number.isNaN(base.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  base.setDate(base.getDate() + offsetDays);
  return base.toISOString().slice(0, 10);
}

function draftFromFields(
  source: CompanyCampusPortalSource,
  fields: {
    title: string;
    location: string;
    summary: string;
    applyUrl: string;
    postedAt: string;
    rawDescription: string;
  }
): JobIngestionDraft | null {
  const title = normalizeText(fields.title);
  const location = normalizeText(fields.location || source.defaultLocation || "中国");
  const summary = normalizeText(fields.summary || fields.rawDescription).slice(0, 220);
  const rawDescription = normalizeText(fields.rawDescription || fields.summary);
  const matcherText = [source.companyName, title, location, summary, rawDescription, source.tags.join(" ")].join(" ");

  if (!title) return null;
  if (!matchesChinaCampusFocus({ title, location, summary, rawDescription })) return null;

  const employmentType = source.employmentTypeHint ?? inferEmploymentType(matcherText);
  const workMode = source.workModeHint ?? inferWorkMode(matcherText);
  const postedAt = normalizeText(fields.postedAt).slice(0, 10) || new Date().toISOString().slice(0, 10);
  const tags = Array.from(new Set([...source.tags, ...extractTags(matcherText)])).slice(0, 8);
  const applyUrl = resolveUrl(fields.applyUrl, source);

  return {
    companyId: "",
    companyName: source.companyName,
    title,
    location,
    workMode,
    employmentType,
    salaryRange: "",
    tags,
    postedAt,
    openedAt: postedAt,
    deadlineAt: fallbackDeadline(postedAt),
    applyUrl,
    source: source.sourceLabel,
    sourceJobId: `${source.key}-${title}-${postedAt}`.toLowerCase().replace(/[^a-z0-9\-]+/g, "-"),
    sourceType: "企业校招官网",
    isSaved: false,
    summary: summary || `${source.companyName} 企业校招岗位`,
    rawDescription: rawDescription || summary || title,
    notes: source.notes ?? "企业校招官网抓取"
  };
}

function parseHtmlSource(html: string, source: CompanyCampusPortalSource) {
  const parser = source.parser as CampusPortalHtmlParserConfig;
  const $ = load(html);

  return $(parser.itemSelector)
    .toArray()
    .map((node) => {
      const $item = $(node);
      return draftFromFields(source, {
        title: extractHtmlField($item, parser.title),
        location: extractHtmlField($item, parser.location),
        summary: extractHtmlField($item, parser.summary),
        applyUrl: extractHtmlField($item, parser.applyUrl),
        postedAt: extractHtmlField($item, parser.postedAt),
        rawDescription: $item.text()
      });
    })
    .filter((job): job is JobIngestionDraft => Boolean(job));
}

function parseJsonSource(payload: unknown, source: CompanyCampusPortalSource) {
  const parser = source.parser as CampusPortalJsonParserConfig;
  const items = getNestedValue(payload, parser.itemsPath);

  if (!items || typeof items !== "object" || !Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) =>
      draftFromFields(source, {
        title: getStringByPath(item, parser.titleKey),
        location: getStringByPath(item, parser.locationKey),
        summary: getStringByPath(item, parser.summaryKey),
        applyUrl: getStringByPath(item, parser.applyUrlKey),
        postedAt: getStringByPath(item, parser.postedAtKey),
        rawDescription: JSON.stringify(item)
      })
    )
    .filter((job): job is JobIngestionDraft => Boolean(job));
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      ...init
    });

    if (!response.ok) return null;

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function getTencentProjectMeta(group: TencentProjectMappingGroup, subProjectName: string): TencentProjectMeta {
  const normalizedName = normalizeText(subProjectName);
  const recruitTypeName = normalizeText(group.recruitTypeName ?? "");
  const matcherText = `${recruitTypeName} ${normalizedName}`;

  if (matcherText.includes("实习")) {
    return {
      employmentType: "INTERN",
      primaryTag: "实习",
      projectName: normalizedName || "实习"
    };
  }

  return {
    employmentType: "NEW_GRAD",
    primaryTag: "校招",
    projectName: normalizedName || "校招"
  };
}

function parseWorkCities(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeText(String(item)))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\s+/)
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }

  return [];
}

function getRegionTags(source: CompanyCampusPortalSource, workCities: string[]) {
  const hongKongLabel = source.tencentApi?.hongKongRegionLabel ?? "中国香港";
  const mainlandLabel = source.tencentApi?.mainlandRegionLabel ?? "中国大陆";
  const hongKongCityName = source.tencentApi?.hongKongCityName ?? "中国香港";
  const hasHongKong = workCities.includes(hongKongCityName);
  const hasMainland = workCities.some((city) => city !== hongKongCityName);
  const regionTags: string[] = [];

  if (hasMainland) regionTags.push(mainlandLabel);
  if (hasHongKong) regionTags.push(hongKongLabel);

  return regionTags;
}

function formatTencentLocation(workCities: string[]) {
  if (!workCities.length) return "中国";
  if (workCities.length <= 4) return workCities.join(" / ");
  return `${workCities.slice(0, 4).join(" / ")} 等 ${workCities.length} 地`;
}

function buildTencentSummary(detail: NonNullable<TencentDetailResponse["data"]>, workCities: string[], projectTag: string) {
  const parts = [
    detail.introduction ? `岗位介绍\n${normalizeText(detail.introduction)}` : "",
    detail.desc ? `岗位职责\n${normalizeText(detail.desc)}` : "",
    detail.request ? `任职资格\n${normalizeText(detail.request)}` : "",
  ].filter(Boolean);

  if (parts.length > 0) {
    return [projectTag, ...parts].filter(Boolean).join("\n\n").slice(0, 2000);
  }

  return [`${detail.title ?? "腾讯岗位"}`, projectTag, workCities.join(" / ")]
    .filter(Boolean)
    .join(" · ")
    .slice(0, 500);
}

function buildTencentRawDescription(detail: NonNullable<TencentDetailResponse["data"]>, projectTag: string) {
  return [
    projectTag ? `招聘项目\n${normalizeText(projectTag)}` : "",
    detail.introduction ? `岗位介绍\n${normalizeText(detail.introduction)}` : "",
    detail.desc ? `岗位职责\n${normalizeText(detail.desc)}` : "",
    detail.request ? `岗位要求\n${normalizeText(detail.request)}` : "",
    detail.graduateBonus ? `加分项\n${normalizeText(detail.graduateBonus)}` : "",
    detail.internBonus ? `实习加分项\n${normalizeText(detail.internBonus)}` : ""
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function searchTencentCampusSource(query: string, source: CompanyCampusPortalSource) {
  const api = source.tencentApi;
  if (!api) return [];

  const headers = {
    Referer: api.referer,
    "User-Agent": "Mozilla/5.0 JobTrackerMVP/1.0"
  };

  const mappingsResponse = await fetchJson<{ status?: number; data?: TencentProjectMappingGroup[] }>(api.projectMappingUrl, {
    headers
  });

  const mappingGroups = mappingsResponse?.status === 0 ? mappingsResponse.data ?? [] : [];
  const projectMetaByMappingId = new Map<number, TencentProjectMeta>();

  for (const group of mappingGroups) {
    for (const subProject of group.subProjectList ?? []) {
      if (!subProject.mappingId || subProject.status !== 1) continue;
      projectMetaByMappingId.set(subProject.mappingId, getTencentProjectMeta(group, subProject.projectName ?? ""));
    }
  }

  if (!projectMetaByMappingId.size) {
    return [];
  }

  const aggregated = new Map<string, TencentSearchItem>();
  const projectMappingIdList = Array.from(projectMetaByMappingId.keys());
  const pageSize = api.pageSize ?? 40;
  const maxPages = api.maxPages ?? 5;

  for (let pageIndex = 1; pageIndex <= maxPages; pageIndex += 1) {
    const payload = {
      projectIdList: [],
      projectMappingIdList,
      keyword: query.trim(),
      bgList: [],
      workCountryType: 0,
      workCityList: [],
      recruitCityList: [],
      positionFidList: [],
      pageIndex,
      pageSize
    };

    const response = await fetchJson<TencentSearchResponse>(api.searchUrl, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const positionList = response?.status === 0 ? response.data?.positionList ?? [] : [];
    if (!positionList.length) break;

    for (const item of positionList) {
      if (!item.postId) continue;
      aggregated.set(item.postId, item);
    }

    if (positionList.length < pageSize) break;
  }

  const searchItems = Array.from(aggregated.values());
  const drafts: JobIngestionDraft[] = [];
  const today = new Date().toISOString().slice(0, 10);

  for (let index = 0; index < searchItems.length; index += 8) {
    const chunk = searchItems.slice(index, index + 8);
    const details = await Promise.all(
      chunk.map(async (item) => {
        if (!item.postId) return null;

        const response = await fetchJson<TencentDetailResponse>(`${api.detailUrl}?postId=${item.postId}`, {
          headers,
          method: "GET"
        });

        return {
          item,
          detail: response?.status === 0 ? response.data ?? null : null
        };
      })
    );

    for (const entry of details) {
      if (!entry?.detail || !entry.item.postId) continue;

      const detail = entry.detail;
      const projectTag = normalizeText(detail.recruitLabelName ?? detail.projectName ?? entry.item.recruitLabelName ?? entry.item.projectName ?? "");
      const workCities = parseWorkCities(detail.workCityList ?? entry.item.workCities);
      const location = formatTencentLocation(workCities);
      const rawDescription = buildTencentRawDescription(detail, projectTag);
      const summary = buildTencentSummary(detail, workCities, projectTag);

      if (!matchesChinaCampusFocus({ title: detail.title ?? entry.item.positionTitle ?? "", location, summary, rawDescription })) {
        continue;
      }

      const meta =
        Array.from(projectMetaByMappingId.values()).find((item) => item.projectName === detail.projectName) ??
        getTencentProjectMeta(
          { recruitTypeName: detail.recruitLabelName, recruitType: detail.recruitType },
          detail.projectName ?? entry.item.projectName ?? ""
        );
      const regionTags = getRegionTags(source, workCities);
      const matcherText = [
        source.companyName,
        detail.title,
        detail.projectName,
        detail.recruitLabelName,
        location,
        rawDescription
      ]
        .filter(Boolean)
        .join(" ");
      const extraTags = extractTags(matcherText);
      const tags = Array.from(
        new Set([
          ...source.tags,
          meta.primaryTag,
          meta.projectName,
          ...(detail.recruitLabelName ? [normalizeText(detail.recruitLabelName)] : []),
          ...regionTags,
          ...extraTags
        ])
      ).slice(0, 10);

      drafts.push({
        companyId: "",
        companyName: source.companyName,
        title: normalizeText(detail.title ?? entry.item.positionTitle ?? "腾讯岗位"),
        location,
        workMode: source.workModeHint ?? "ONSITE",
        employmentType: meta.employmentType,
        salaryRange: "",
        tags,
        postedAt: today,
        openedAt: today,
        deadlineAt: fallbackDeadline(today, 45),
        applyUrl: `${source.baseUrl ?? "https://join.qq.com"}/post.html?pid=${entry.item.postId}`,
        source: source.sourceLabel,
        sourceJobId: `${source.key}-${entry.item.postId}`,
        sourceType: "企业校招官网",
        isSaved: false,
        summary,
        rawDescription,
        notes: `${source.notes ?? "企业校招官网抓取"} · 项目：${meta.projectName}`
      });
    }
  }

  return drafts.filter((job) =>
    matchesQuery([job.companyName, job.title, job.location, job.summary, job.tags.join(" ")].join(" "), query)
  );
}

async function searchCompanyCampusPortals(query: string) {
  const enabledSources = companyCampusPortalSources.filter((source) => source.enabled);
  const jobs: JobIngestionDraft[] = [];

  for (const source of enabledSources) {
    try {
      if (source.driver === "tencent_position_api") {
        jobs.push(...(await searchTencentCampusSource(query, source)));
        continue;
      }

      const response = await fetch(source.listUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 JobTrackerMVP/1.0"
        },
        cache: "no-store"
      });

      if (!response.ok) continue;

      if (source.driver === "generic_html" && source.format === "html" && source.parser) {
        const html = await response.text();
        jobs.push(...parseHtmlSource(html, source));
        continue;
      }

      if (source.driver === "generic_json" && source.format === "json" && source.parser) {
        const payload = await response.json();
        jobs.push(...parseJsonSource(payload, source));
      }
    } catch {
      continue;
    }
  }

  return jobs.filter((job) => matchesQuery([job.companyName, job.title, job.location, job.summary, job.tags.join(" ")].join(" "), query));
}

export async function searchChinaCampusLiveSources(query: string): Promise<JobSearchResult> {
  const jobs = await searchCompanyCampusPortals(query);

  return {
    providerId: "campus_portal_live",
    providerLabel: "校招平台 Live",
    jobs
  };
}

export async function searchChinaWechatSources(_query: string): Promise<JobSearchResult> {
  return {
    providerId: "campus_wechat_live",
    providerLabel: "公众号线索 Live",
    jobs: []
  };
}
