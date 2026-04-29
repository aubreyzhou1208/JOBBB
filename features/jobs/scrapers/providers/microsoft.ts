import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

const BASE_URL = "https://careers.microsoft.com/us/en/search-results";

export class MicrosoftProvider extends JobProvider {
  readonly id = "microsoft";
  readonly companyName = "Microsoft";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    let from = 0;
    const size = 50;

    while (true) {
      const res = await this.fetchWithTimeout(
        `${BASE_URL}?keywords=&location=China&from=${from}&pgSz=${size}&rt=professional`,
        {
          headers: this.headers({
            Accept: "application/json",
            "x-api-key": "set1e4bfed42b46f2a3b4a1a7b4f1c7e9",
            Referer: "https://careers.microsoft.com/",
          }),
        }
      );

      if (!res.ok) break;
      const data = await res.json();
      const list: unknown[] = data?.operationResult?.result?.jobs ?? data?.jobs ?? [];
      if (list.length === 0) break;

      for (const p of list as Record<string, unknown>[]) {
        const title = String(p.title ?? p.jobTitle ?? "");
        const isIntern = /intern/i.test(title) || String(p.jobType ?? "").toLowerCase().includes("intern");
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

      if (list.length < size) break;
      from += size;
      if (from > 1000) break;
    }

    return jobs;
  }
}
