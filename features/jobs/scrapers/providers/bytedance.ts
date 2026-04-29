import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

/**
 * ByteDance campus jobs via their public Lark Hire API.
 * The campus.bytedance.com site embeds job data accessible via their hire platform.
 */
const SEARCH_URL = "https://jobs.bytedance.com/api/v1/search/jobs";

export class ByteDanceProvider extends JobProvider {
  readonly id = "bytedance";
  readonly companyName = "字节跳动";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    // Try the public job listing endpoint - campus + intern
    for (const jobType of ["campus", "intern"]) {
      let page = 1;
      while (true) {
        const res = await this.fetchWithTimeout(
          `${SEARCH_URL}?type=${jobType}&page=${page}&limit=50&location=CN`,
          {
            headers: this.headers({
              Referer: "https://jobs.bytedance.com/",
              Origin: "https://jobs.bytedance.com",
            }),
          }
        );

        if (!res.ok) break;

        let data: Record<string, unknown>;
        try { data = await res.json(); } catch { break; }

        const list: unknown[] = (data?.data as Record<string, unknown>)?.jobs as unknown[]
          ?? (data?.data as Record<string, unknown>)?.list as unknown[]
          ?? [];
        if (list.length === 0) break;

        for (const p of list as Record<string, unknown>[]) {
          const isIntern = jobType === "intern";
          const jobId = String(p.id ?? p.jobId ?? "");
          jobs.push({
            companyName: this.companyName,
            title: String(p.title ?? p.jobTitle ?? ""),
            location: this.parseLocation(p),
            workMode: "ONSITE",
            employmentType: isIntern ? "INTERN" : "NEW_GRAD",
            applyUrl: `https://jobs.bytedance.com/campus/position/${jobId}/detail`,
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

  private parseLocation(p: Record<string, unknown>): string {
    if (p.cityName) return String(p.cityName);
    if (Array.isArray(p.locationList) && p.locationList.length > 0) {
      return (p.locationList as Record<string, unknown>[])
        .map((l) => l.name ?? l.cityName)
        .filter(Boolean)
        .join("、");
    }
    return "中国";
  }
}
