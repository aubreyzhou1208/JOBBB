import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

// Google Careers public JSON API
const BASE_URL = "https://careers.google.com/api/jobs/search/";

export class GoogleProvider extends JobProvider {
  readonly id = "google";
  readonly companyName = "Google";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    let page = 1;

    while (true) {
      const params = new URLSearchParams({
        q: "",
        location: "China",
        jlo: "zh_CN",
        has_remote: "false",
        employment_type: "INTERN,FULL_TIME",
        num: "50",
        start: String((page - 1) * 50),
      });

      const res = await this.fetchWithTimeout(`${BASE_URL}?${params}`, {
        headers: this.headers({ Referer: "https://careers.google.com/" }),
      });

      if (!res.ok) break;
      const data = await res.json();
      const list: unknown[] = data?.jobs ?? [];
      if (list.length === 0) break;

      for (const p of list as Record<string, unknown>[]) {
        const title = String(p.title ?? "");
        const isIntern = /intern/i.test(title);
        const jobId = String(p.id ?? p.job_id ?? "");
        const locations: string[] = [];
        if (Array.isArray(p.locations)) {
          for (const loc of p.locations as Record<string, unknown>[]) {
            if (loc.display) locations.push(String(loc.display));
          }
        }
        jobs.push({
          companyName: this.companyName,
          title,
          location: locations[0] ?? "China",
          workMode: "ONSITE",
          employmentType: isIntern ? "INTERN" : "NEW_GRAD",
          applyUrl: `https://careers.google.com/jobs/results/${jobId}`,
          sourceJobId: jobId,
          source: this.id,
          sourceType: "careers_api",
          summary: String(p.description ?? "").replace(/<[^>]+>/g, "").slice(0, 500),
          tags: isIntern ? ["实习"] : ["校招"],
          postedAt: this.now(),
          openedAt: this.now(),
          deadlineAt: this.defaultDeadline(),
        });
      }

      if (list.length < 50) break;
      page++;
      if (page > 10) break;
    }

    return jobs;
  }
}
