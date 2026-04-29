import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

const BASE_URL = "https://campus.jd.com/campus_recruiting/api/job/list";

export class JDProvider extends JobProvider {
  readonly id = "jd";
  readonly companyName = "京东";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    for (const category of ["campus", "intern"]) {
      let page = 1;

      while (true) {
        const res = await this.fetchWithTimeout(
          `${BASE_URL}?page=${page}&pageSize=50&category=${category}`,
          { headers: this.headers({ Referer: "https://campus.jd.com/" }) }
        );

        if (!res.ok) break;
        const data = await res.json();
        const list: unknown[] = data?.data?.list ?? data?.result?.list ?? [];
        if (list.length === 0) break;

        for (const p of list as Record<string, unknown>[]) {
          const isIntern = category === "intern";
          const jobId = String(p.jobId ?? p.id ?? "");
          jobs.push({
            companyName: this.companyName,
            title: String(p.jobName ?? p.name ?? ""),
            location: String(p.city ?? p.location ?? "北京"),
            workMode: "ONSITE",
            employmentType: isIntern ? "INTERN" : "NEW_GRAD",
            applyUrl: `https://campus.jd.com/jobs/${jobId}`,
            sourceJobId: jobId,
            source: this.id,
            sourceType: "campus_api",
            summary: String(p.description ?? "").slice(0, 500),
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
