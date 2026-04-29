import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

const BASE_URL = "https://campus.didiglobal.com/campus_school/campus/api/v1/position/list";

export class DiDiProvider extends JobProvider {
  readonly id = "didi";
  readonly companyName = "滴滴";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const cookies = process.env.DIDI_COOKIES;
    if (!cookies) return [];

    const jobs: ScrapedJob[] = [];

    for (const jobType of [1, 2]) { // 1=校招, 2=实习
      let pageNo = 1;

      while (true) {
        const res = await this.fetchWithTimeout(BASE_URL, {
          method: "POST",
          headers: this.headers({ "Content-Type": "application/json", Cookie: cookies, Referer: "https://campus.didiglobal.com/" }),
          body: JSON.stringify({ pageNo, pageSize: 50, jobType, keyword: "" }),
        });

        if (!res.ok) break;
        const data = await res.json();
        const list: unknown[] = data?.data?.list ?? data?.result?.list ?? [];
        if (list.length === 0) break;

        for (const p of list as Record<string, unknown>[]) {
          const isIntern = jobType === 2;
          const jobId = String(p.positionId ?? p.id ?? "");
          jobs.push({
            companyName: this.companyName,
            title: String(p.positionName ?? p.name ?? ""),
            location: String(p.city ?? p.location ?? "北京"),
            workMode: "ONSITE",
            employmentType: isIntern ? "INTERN" : "NEW_GRAD",
            applyUrl: `https://campus.didiglobal.com/campus/position/${jobId}`,
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
        pageNo++;
        if (pageNo > 20) break;
      }
    }

    return jobs;
  }
}
