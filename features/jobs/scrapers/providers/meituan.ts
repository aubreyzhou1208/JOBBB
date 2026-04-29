import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

const BASE_URL = "https://campus.meituan.com/api/job-list";

export class MeituanProvider extends JobProvider {
  readonly id = "meituan";
  readonly companyName = "美团";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const cookies = process.env.MEITUAN_COOKIES;
    if (!cookies) return [];

    const jobs: ScrapedJob[] = [];

    for (const jobType of ["campus", "intern"]) {
      let page = 1;

      while (true) {
        const res = await this.fetchWithTimeout(
          `${BASE_URL}?page=${page}&pageSize=50&jobType=${jobType}`,
          { headers: this.headers({ Cookie: cookies, Referer: "https://campus.meituan.com/" }) }
        );

        if (!res.ok) break;
        const data = await res.json();
        const list: unknown[] = data?.data?.list ?? data?.data?.records ?? data?.records ?? [];
        if (list.length === 0) break;

        for (const p of list as Record<string, unknown>[]) {
          const isIntern = jobType === "intern";
          jobs.push({
            companyName: this.companyName,
            title: String(p.jobName ?? p.name ?? p.title ?? ""),
            location: String(p.city ?? p.location ?? p.workPlace ?? "北京"),
            workMode: "ONSITE",
            employmentType: isIntern ? "INTERN" : "NEW_GRAD",
            applyUrl: `https://campus.meituan.com/jobs/${p.jobId ?? p.id}`,
            sourceJobId: String(p.jobId ?? p.id ?? ""),
            source: this.id,
            sourceType: "campus_api",
            summary: String(p.description ?? p.jobDesc ?? "").slice(0, 500),
            tags: isIntern ? ["实习"] : ["校招"],
            postedAt: this.now(),
            openedAt: this.now(),
            deadlineAt: this.defaultDeadline(),
          });
        }

        if (list.length < 50) break;
        page++;
        if (page > 20) break;
      }
    }

    return jobs;
  }
}
