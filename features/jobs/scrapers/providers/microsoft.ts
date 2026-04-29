import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

// Microsoft careers search — GCS (Global Career Site) JSON API
const GCS_URL = "https://gcsservices.careers.microsoft.com/search/api/v1/search";

export class MicrosoftProvider extends JobProvider {
  readonly id = "microsoft";
  readonly companyName = "Microsoft";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    let start = 0;
    const pgSz = 50;

    while (true) {
      // Microsoft's GCS search API - works without auth for public listings
      const params = new URLSearchParams({
        q: "intern OR internship OR new grad OR campus OR graduate",
        lc: "China",
        l: "en_us",
        pgSz: String(pgSz),
        start: String(start),
        rt: "professional",
      });

      const res = await this.fetchWithTimeout(`${GCS_URL}?${params}`, {
        headers: this.headers({
          Accept: "application/json",
          Referer: "https://careers.microsoft.com/",
        }),
      });

      if (!res.ok) break;

      const data = await res.json();
      const list: unknown[] =
        (data?.operationResult?.result?.jobs as unknown[]) ?? (data?.jobs as unknown[]) ?? [];
      if (list.length === 0) break;

      for (const p of list as Record<string, unknown>[]) {
        const title = String(p.title ?? p.jobTitle ?? "");
        const isIntern = /intern/i.test(title) || /intern/i.test(String(p.jobType ?? ""));
        const jobId = String(p.jobId ?? p.id ?? "");
        jobs.push({
          companyName: this.companyName,
          title,
          location: String(p.location ?? p.primaryLocation ?? "China"),
          workMode: "ONSITE",
          employmentType: isIntern ? "INTERN" : "NEW_GRAD",
          applyUrl: `https://careers.microsoft.com/us/en/job/${jobId}`,
          sourceJobId: jobId,
          source: this.id,
          sourceType: "careers_api",
          summary: String(p.descriptionTeaser ?? p.description ?? "").slice(0, 500),
          tags: isIntern ? ["实习", "Intern"] : ["校招", "New Grad"],
          postedAt: this.now(),
          openedAt: this.now(),
          deadlineAt: this.defaultDeadline(),
        });
      }

      if (list.length < pgSz) break;
      start += pgSz;
      if (start > 1000) break;
    }

    return jobs;
  }
}
