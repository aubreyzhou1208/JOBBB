import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

const BASE_URL = "https://campus.kuaishou.com/recruit/campus/api/position/list";

export class KuaishouProvider extends JobProvider {
  readonly id = "kuaishou";
  readonly companyName = "快手";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    for (const type of ["campus", "intern"]) {
      let page = 1;

      while (true) {
        const res = await this.fetchWithTimeout(
          `${BASE_URL}?page=${page}&pageSize=50&positionType=${type}`,
          { headers: this.headers({ Referer: "https://campus.kuaishou.com/" }) }
        );

        if (!res.ok) break;
        const data = await res.json();
        const list: unknown[] = data?.data?.list ?? data?.data?.records ?? [];
        if (list.length === 0) break;

        for (const p of list as Record<string, unknown>[]) {
          const isIntern = type === "intern";
          const jobId = String(p.positionId ?? p.id ?? "");
          jobs.push({
            companyName: this.companyName,
            title: String(p.positionName ?? p.name ?? ""),
            location: String(p.city ?? p.location ?? "北京"),
            workMode: "ONSITE",
            employmentType: isIntern ? "INTERN" : "NEW_GRAD",
            applyUrl: `https://campus.kuaishou.com/recruit/campus/position/${jobId}`,
            sourceJobId: jobId,
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
