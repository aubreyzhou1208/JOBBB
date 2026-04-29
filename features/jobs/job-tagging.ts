import { JobEmploymentType, JobPosting, JobTagSet } from "@/lib/types";

type TaggableJob = Pick<
  JobPosting,
  "companyName" | "title" | "location" | "employmentType" | "summary" | "rawDescription" | "tags"
>;

const roleKeywordMap: Array<{ tag: string; keywords: string[] }> = [
  { tag: "前端", keywords: ["frontend", "前端", "web", "react", "next.js", "ui"] },
  { tag: "后端", keywords: ["backend", "后台", "server", "java", "go", "c++"] },
  { tag: "全栈", keywords: ["fullstack", "full-stack", "全栈"] },
  { tag: "算法", keywords: ["算法", "llm", "machine learning", "多模态", "nlp"] },
  { tag: "AI", keywords: ["ai", "大模型", "agent", "智能体"] },
  { tag: "产品", keywords: ["product", "产品"] },
  { tag: "设计", keywords: ["design", "设计"] },
  { tag: "数据", keywords: ["data", "数据"] },
  { tag: "运营", keywords: ["运营", "operation", "growth"] },
  { tag: "咨询", keywords: ["咨询", "solution", "行业咨询"] },
  { tag: "项目管理", keywords: ["项目管理", "program manager", "project manager", "pm"] },
  { tag: "游戏", keywords: ["游戏", "game", "ue5"] }
];

const programKeywordMap: Array<{ tag: string; keywords: string[] }> = [
  { tag: "校招", keywords: ["校招", "校园招聘", "new grad", "graduate"] },
  { tag: "实习", keywords: ["实习", "intern", "internship"] },
  { tag: "应届实习", keywords: ["应届实习"] },
  { tag: "日常实习", keywords: ["日常实习"] },
  { tag: "青云计划", keywords: ["青云计划"] },
  { tag: "留学生项目", keywords: ["留学生", "overseas"] },
  { tag: "提前批", keywords: ["提前批", "pre"] },
  { tag: "培训生", keywords: ["培训生"] }
];

function collectText(job: TaggableJob) {
  return [job.companyName, job.title, job.location, job.summary, job.rawDescription ?? "", job.tags.join(" ")]
    .join(" ")
    .toLowerCase();
}

function getRoleTags(text: string, rawTags: string[]) {
  const matched = roleKeywordMap
    .filter((item) => item.keywords.some((keyword) => text.includes(keyword.toLowerCase())))
    .map((item) => item.tag);

  for (const tag of rawTags) {
    if (["前端", "后端", "全栈", "算法", "AI", "产品", "设计", "数据", "运营", "咨询", "项目管理", "游戏"].includes(tag)) {
      matched.push(tag);
    }
  }

  return Array.from(new Set(matched));
}

function getProgramTags(job: TaggableJob, text: string, rawTags: string[]) {
  const matched = programKeywordMap
    .filter((item) => item.keywords.some((keyword) => text.includes(keyword.toLowerCase())))
    .map((item) => item.tag);

  if (job.employmentType === "INTERN") matched.push("实习");
  if (job.employmentType === "NEW_GRAD") matched.push("校招");

  for (const tag of rawTags) {
    if (["校招", "实习", "应届实习", "日常实习", "青云计划", "留学生项目", "提前批", "培训生"].includes(tag)) {
      matched.push(tag);
    }
  }

  return Array.from(new Set(matched));
}

function getRegionTags(job: TaggableJob, text: string, rawTags: string[]) {
  const regions: string[] = [];

  if (text.includes("中国香港") || text.includes("hong kong") || rawTags.includes("中国香港")) {
    regions.push("中国香港");
  }

  if (
    ["北京", "上海", "深圳", "广州", "杭州", "成都", "武汉", "南京", "青岛", "郑州", "西安", "厦门", "中国大陆"].some((item) =>
      text.includes(item.toLowerCase())
    ) || rawTags.includes("中国大陆")
  ) {
    regions.push("中国大陆");
  }

  return Array.from(new Set(regions));
}

function fallbackProgramTag(employmentType: JobEmploymentType) {
  if (employmentType === "INTERN") return ["实习"];
  if (employmentType === "NEW_GRAD") return ["校招"];
  return [];
}

export function buildJobTagSet(job: TaggableJob): JobTagSet {
  const rawTags = job.tags.filter(Boolean);
  const text = collectText(job);
  const roleTags = getRoleTags(text, rawTags);
  const programTags = Array.from(new Set([...getProgramTags(job, text, rawTags), ...fallbackProgramTag(job.employmentType)]));
  const regionTags = getRegionTags(job, text, rawTags);
  const normalizedTags = Array.from(
    new Set([
      ...rawTags,
      ...regionTags,
      ...roleTags,
      ...programTags,
      job.companyName,
      job.employmentType === "NEW_GRAD" ? "校招" : "",
      job.employmentType === "INTERN" ? "实习" : ""
    ].filter(Boolean))
  );

  return {
    normalizedTags,
    regionTags,
    roleTags,
    programTags
  };
}

export function normalizeJobPosting<T extends TaggableJob>(input: T): T & JobTagSet {
  const tagSet = buildJobTagSet(input);

  return {
    ...input,
    normalizedTags: tagSet.normalizedTags,
    regionTags: tagSet.regionTags,
    roleTags: tagSet.roleTags,
    programTags: tagSet.programTags
  };
}
