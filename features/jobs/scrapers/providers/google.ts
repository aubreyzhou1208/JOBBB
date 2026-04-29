import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

// Google Careers JSON API — the /api/jobs/search/ endpoint redirected; use the current path
const BASE_URL = "https://careers.google.com/api/jobs/search/";
const FALLBACK_URL = "https://www.google.com/about/careers/applications/api/jobs/search/";

export class GoogleProvider extends JobProvider {
  readonly id = "google";
  readonly companyName = "Google";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    let start = 0;
    const num = 20;

    while (true) {
      const params = new URLSearchParams({
        q: "intern OR internship OR new grad OR campus OR graduate",
        location: "China",
        jlo: "zh_CN",
        num: String(num),
        start: String(start),
      });

      // Try primary URL first, then fallback
      let res: Response | null = null;
      for (const base of [BASE_URL, FALLBACK_URL]) {
        try {
          res = await this.fetchWithTimeout(`${base}?${params}`, {
            headers: this.headers({ Referer: "https://careers.google.com/" }),
          });
          if (res.ok) break;
        } catch { continue; }
      }
      if (!res?.ok) break;

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
          tags: isIntern ? ["实习", "Intern"] : ["校招", "New Grad"],
          postedAt: this.now(),
          openedAt: this.now(),
          deadlineAt: this.defaultDeadline(),
        });
      }

      if (list.length < num) break;
      start += num;
      if (start > 500) break;
    }

    return jobs;
  }
}
