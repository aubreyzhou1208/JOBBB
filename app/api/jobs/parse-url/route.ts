import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ParsedJob {
  companyName: string;
  title: string;
  location: string;
  employmentType: "FULL_TIME" | "INTERN" | "NEW_GRAD" | "CONTRACT";
  workMode: "ONSITE" | "REMOTE" | "HYBRID";
  deadlineAt?: string;
  salaryRange?: string;
  summary: string;
  rawDescription: string;
  applyUrl: string;
  source: string;
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,*/*",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function extractMeta(html: string): Record<string, string> {
  const $ = cheerio.load(html);
  const meta: Record<string, string> = {};

  // OpenGraph
  $("meta[property^='og:']").each((_, el) => {
    const prop = $(el).attr("property")?.replace("og:", "") ?? "";
    const content = $(el).attr("content") ?? "";
    if (prop && content) meta[prop] = content;
  });

  // JSON-LD structured data
  $("script[type='application/ld+json']").each((_, el) => {
    try {
      const data = JSON.parse($(el).html() ?? "{}");
      if (data["@type"] === "JobPosting") {
        if (data.title) meta.ldTitle = data.title;
        if (data.hiringOrganization?.name) meta.ldCompany = data.hiringOrganization.name;
        if (data.jobLocation?.address?.addressLocality) meta.ldLocation = data.jobLocation.address.addressLocality;
        if (data.validThrough) meta.ldDeadline = data.validThrough;
        if (data.description) meta.ldDescription = data.description;
      }
    } catch { /* ignore */ }
  });

  // Page title as fallback
  meta.pageTitle = $("title").first().text().trim();

  // Main text content (cleaned)
  $("script, style, nav, header, footer, aside").remove();
  meta.bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 8000);

  return meta;
}

async function parseWithClaude(url: string, meta: Record<string, string>): Promise<ParsedJob> {
  const context = [
    meta.ldTitle && `标题: ${meta.ldTitle}`,
    meta.ldCompany && `公司: ${meta.ldCompany}`,
    meta.ldLocation && `地点: ${meta.ldLocation}`,
    meta.ldDeadline && `截止: ${meta.ldDeadline}`,
    meta.title && `OG标题: ${meta.title}`,
    meta.description && `OG描述: ${meta.description}`,
    meta.pageTitle && `页面标题: ${meta.pageTitle}`,
    `正文内容:\n${meta.ldDescription || meta.bodyText}`,
  ].filter(Boolean).join("\n");

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `从以下招聘页面信息中提取结构化数据，返回严格的 JSON，不要任何其他文字。

页面URL: ${url}

${context}

返回格式（所有字段必须存在，不确定的用合理默认值）:
{
  "companyName": "公司名称",
  "title": "岗位名称",
  "location": "工作地点，如 上海 或 北京/上海",
  "employmentType": "INTERN 或 NEW_GRAD 或 FULL_TIME 或 CONTRACT",
  "workMode": "ONSITE 或 REMOTE 或 HYBRID",
  "deadlineAt": "截止日期 YYYY-MM-DD 格式，不确定则 null",
  "salaryRange": "薪资范围字符串，不确定则 null",
  "summary": "岗位简介，100-200字，包含核心职责",
  "rawDescription": "完整岗位描述，尽量保留原文"
}`
    }]
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";
  const jsonMatch = text.match(/\{[\s\S]+\}/);
  if (!jsonMatch) throw new Error("Claude returned no JSON");

  const parsed = JSON.parse(jsonMatch[0]);
  const hostname = new URL(url).hostname.replace("www.", "");

  return {
    companyName: parsed.companyName || "未知公司",
    title: parsed.title || "未知岗位",
    location: parsed.location || "中国",
    employmentType: parsed.employmentType || "FULL_TIME",
    workMode: parsed.workMode || "ONSITE",
    deadlineAt: parsed.deadlineAt || undefined,
    salaryRange: parsed.salaryRange || undefined,
    summary: parsed.summary || "",
    rawDescription: parsed.rawDescription || "",
    applyUrl: url,
    source: hostname,
  };
}

export async function POST(request: Request) {
  const { url } = await request.json() as { url: string };
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  try {
    const html = await fetchPage(url);
    const meta = extractMeta(html);
    const parsed = await parseWithClaude(url, meta);
    return NextResponse.json({ ok: true, job: parsed });
  } catch (err) {
    console.error("[parse-url]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
