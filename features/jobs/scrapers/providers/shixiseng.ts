import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

// 实习僧 – aggregates intern jobs from Chinese companies
// Data is SSR-embedded in __NUXT__ on the page. No login required.
// Note: site is accessible from Singapore/China; may timeout from US IPs.
const BASE = "https://www.shixiseng.com";

const TARGETS = [
  "字节跳动", "阿里巴巴", "百度", "美团",
  "京东", "快手", "小红书", "滴滴", "网易",
];

function cleanTitle(raw: string): string {
  return raw.replace(/&#x[0-9a-f]+;?/gi, "").replace(/-\s*$/, "").trim();
}

interface SxsJob {
  uuid: string;
  name: string;
  cname: string;
  city: string;
  c_tags?: string[];
  i_tags?: string[];
  type?: string;
}

function extractJobs(html: string): SxsJob[] {
  // The page is a Nuxt SSR app; job data is embedded as __NUXT__ = (function(...){return{data:[{interns:{data:[...]}}]}})(...args)
  // Extract the raw function string and eval it safely
  const match = html.match(/__NUXT__\s*=\s*(\(function\([^)]+\)\s*\{[\s\S]+?\}\s*\([^)]*\)\s*\))\s*;?\s*</);
  if (!match) return [];

  let nuxt: Record<string, unknown>;
  try {
    // Safe eval in Node.js server context (never runs in browser)
    // eslint-disable-next-line no-new-func
    nuxt = Function(`"use strict"; return ${match[1]}`)() as Record<string, unknown>;
  } catch {
    return [];
  }

  const data = (nuxt?.data as Record<string, unknown>[])?.[0];
  const interns = data?.interns as Record<string, unknown> | undefined;
  const list = interns?.data;
  return Array.isArray(list) ? (list as SxsJob[]) : [];
}

export class ShixisengProvider extends JobProvider {
  readonly id = "shixiseng";
  readonly companyName = "实习僧聚合";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const all: ScrapedJob[] = [];

    for (const kw of TARGETS) {
      for (let page = 1; page <= 3; page++) {
        const url = `${BASE}/interns?k=${encodeURIComponent(kw)}&p=${page}`;
        let html: string;
        try {
          const res = await this.fetchWithTimeout(url, {
            headers: this.headers({
              Accept: "text/html,application/xhtml+xml,*/*",
              Referer: `${BASE}/interns`,
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any, 25000);
          if (!res.ok) break;
          html = await res.text();
        } catch { break; }

        const jobs = extractJobs(html);
        if (jobs.length === 0) break;

        for (const j of jobs) {
          const title = cleanTitle(j.name ?? "");
          if (!title || title.length < 2) continue;

          all.push({
            companyName: j.cname || kw,
            title,
            location: j.city || "中国",
            workMode: "ONSITE",
            employmentType: "INTERN",
            applyUrl: `${BASE}/intern/${j.uuid}`,
            sourceJobId: j.uuid,
            source: this.id,
            sourceType: "html_ssr",
            summary: [
              ...(j.c_tags ?? []),
              ...(j.i_tags ?? []),
            ].join("、").slice(0, 300),
            tags: ["实习", "Intern", j.cname || kw],
            postedAt: this.now(),
            openedAt: this.now(),
            deadlineAt: this.defaultDeadline(),
          });
        }

        if (jobs.length < 20) break;
        await new Promise((r) => setTimeout(r, 500));
      }

      await new Promise((r) => setTimeout(r, 600));
    }

    return all;
  }
}
