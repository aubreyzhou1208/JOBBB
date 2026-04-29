import { JobEmploymentType, JobWorkMode } from "@/lib/types";

export const chinaLocationKeywords = [
  "china",
  "greater china",
  "mainland china",
  "apac",
  "beijing",
  "shanghai",
  "shenzhen",
  "guangzhou",
  "hangzhou",
  "suzhou",
  "nanjing",
  "wuhan",
  "chengdu",
  "hong kong",
  "hong kong sar",
  "macau",
  "taipei",
  "singapore",
  "tokyo",
  "seoul",
  "中国",
  "北京",
  "上海",
  "深圳",
  "广州",
  "杭州",
  "苏州",
  "南京",
  "武汉",
  "成都",
  "香港",
  "澳门",
  "台北",
  "新加坡",
  "东京",
  "首尔",
  "大中华"
];

export const campusKeywords = [
  "campus",
  "university",
  "student",
  "graduate",
  "new grad",
  "newgrad",
  "early career",
  "intern",
  "internship",
  "campus hire",
  "graduate program",
  "university graduate",
  "校招",
  "校园",
  "应届",
  "实习生",
  "毕业生",
  "2026届",
  "2027届",
  "2028届",
  "暑期实习"
];

export function stripHtml(value: string | undefined) {
  return (value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function inferEmploymentType(text: string): JobEmploymentType {
  const normalized = text.toLowerCase();

  if (normalized.includes("intern") || normalized.includes("实习")) return "INTERN";
  if (normalized.includes("new grad") || normalized.includes("graduate") || normalized.includes("校招") || normalized.includes("应届")) {
    return "NEW_GRAD";
  }
  if (normalized.includes("contract")) return "CONTRACT";
  return "FULL_TIME";
}

export function inferWorkMode(text: string): JobWorkMode {
  const normalized = text.toLowerCase();

  if (normalized.includes("remote") || normalized.includes("远程")) return "REMOTE";
  if (normalized.includes("hybrid") || normalized.includes("混合")) return "HYBRID";
  return "ONSITE";
}

export function extractTags(text: string) {
  const dictionary = [
    "React",
    "Next.js",
    "TypeScript",
    "Frontend",
    "Product",
    "Growth",
    "Design Systems",
    "AI",
    "Data",
    "Intern",
    "New Grad"
  ];

  return dictionary.filter((item) => text.toLowerCase().includes(item.toLowerCase()));
}

export function matchesChinaCampusFocus(input: {
  title: string;
  location: string;
  summary: string;
  rawDescription: string;
}) {
  const text = [input.title, input.location, input.summary, input.rawDescription].join(" ").toLowerCase();
  const hasCampusSignal = campusKeywords.some((keyword) => text.includes(keyword.toLowerCase()));
  const hasChinaSignal = chinaLocationKeywords.some((keyword) => text.includes(keyword.toLowerCase()));

  return hasCampusSignal || hasChinaSignal;
}

export function matchesQuery(text: string, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return text.toLowerCase().includes(normalized);
}
