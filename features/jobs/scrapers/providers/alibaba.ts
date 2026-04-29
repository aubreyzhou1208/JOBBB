import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

// Alibaba campus portal API
const BASE_URL = "https://talent.alibaba.com/campus/api/v2/job/list";

export class AlibabaProvider extends JobProvider {
  readonly id = "alibaba";
  readonly companyName = "阿里巴巴";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    for (const jobType of [1, 2]) { // 1=校招, 2=实习
      let pageIndex = 1;

      while (true) {
        const res = await this.fetchWithTimeout(BASE_URL, {
          method: "POST",
          headers: this.headers({ "Content-Type": "application/json", Referer: "https://talent.alibaba.com/" }),
          body: JSON.stringify({ pageIndex, pageSize: 50, jobType, keyword: "" }),
        });

        if (!res.ok) break;
        const data = await res.json();
        const list: unknown[] = data?.data?.list ?? data?.result?.list ?? [];
        if (list.length === 0) break;

        for (const p of list as Record<string, unknown>[]) {
          const isIntern = jobType === 2;
          const jobId = String(p.jobId ?? p.id ?? "");
          jobs.push({
            companyName: this.companyName,
            title: String(p.jobName ?? p.name ?? ""),
            location: String(p.workLocation ?? p.city ?? "杭州"),
            workMode: "ONSITE",
            employmentType: isIntern ? "INTERN" : "NEW_GRAD",
            applyUrl: `https://talent.alibaba.com/campus/position/detail?id=${jobId}`,
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
        pageIndex++;
        if (pageIndex > 20) break;
      }
    }

    return jobs;
  }
}
