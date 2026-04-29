import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

// JP Morgan career search API
const BASE_URL = "https://careers.jpmorgan.com/api/job/search";

export class JPMorganProvider extends JobProvider {
  readonly id = "jpmorgan";
  readonly companyName = "JP Morgan";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    let start = 0;
    const rows = 50;

    while (true) {
      const res = await this.fetchWithTimeout(BASE_URL, {
        method: "POST",
        headers: this.headers({ "Content-Type": "application/json", Referer: "https://careers.jpmorgan.com/" }),
        body: JSON.stringify({
          keyword: "",
          location: "China",
          jobCategory: "",
          start,
          rows,
          sort: "RELEVANCE",
          isEarlyCareers: true,
        }),
      });

      if (!res.ok) break;
      const data = await res.json();
      const list: unknown[] = data?.data?.jobs ?? data?.jobs ?? [];
      if (list.length === 0) break;

      for (const p of list as Record<string, unknown>[]) {
        const title = String(p.title ?? p.jobTitle ?? "");
        const isIntern = /intern/i.test(title);
        const jobId = String(p.id ?? p.jobId ?? "");
        jobs.push({
          companyName: this.companyName,
          title,
          location: String(p.primaryLocation ?? p.location ?? "China"),
          workMode: "ONSITE",
          employmentType: isIntern ? "INTERN" : "NEW_GRAD",
          applyUrl: String(p.applyUrl ?? `https://careers.jpmorgan.com/us/en/jobs/${jobId}`),
          sourceJobId: jobId,
          source: this.id,
          sourceType: "careers_api",
          summary: String(p.shortDescription ?? p.description ?? "").slice(0, 500),
          tags: isIntern ? ["实习", "Intern"] : ["校招", "New Grad"],
          postedAt: this.now(),
          openedAt: this.now(),
          deadlineAt: this.defaultDeadline(),
        });
      }

      if (list.length < rows) break;
      start += rows;
      if (start > 500) break;
    }

    return jobs;
  }
}
