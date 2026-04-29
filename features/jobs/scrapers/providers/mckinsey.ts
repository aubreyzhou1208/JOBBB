import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

const BASE_URL = "https://www.mckinsey.com/careers/search-jobs/overview";
const API_URL = "https://www.mckinsey.com/careers/api/search-jobs";

export class McKinseyProvider extends JobProvider {
  readonly id = "mckinsey";
  readonly companyName = "McKinsey";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    let skip = 0;
    const take = 50;

    while (true) {
      const res = await this.fetchWithTimeout(API_URL, {
        method: "POST",
        headers: this.headers({ "Content-Type": "application/json", Referer: BASE_URL }),
        body: JSON.stringify({
          keyword: "",
          location: "China",
          skip,
          take,
          filters: { entryLevel: true },
        }),
      });

      if (!res.ok) break;
      const data = await res.json();
      const list: unknown[] = data?.results ?? data?.jobs ?? [];
      if (list.length === 0) break;

      for (const p of list as Record<string, unknown>[]) {
        const title = String(p.title ?? p.jobTitle ?? "");
        const isIntern = /intern/i.test(title);
        const jobId = String(p.id ?? p.jobId ?? "");
        jobs.push({
          companyName: this.companyName,
          title,
          location: String(p.location ?? p.city ?? "China"),
          workMode: "ONSITE",
          employmentType: isIntern ? "INTERN" : "NEW_GRAD",
          applyUrl: String(p.url ?? `https://www.mckinsey.com/careers/search-jobs/overview/${jobId}`),
          sourceJobId: jobId,
          source: this.id,
          sourceType: "careers_api",
          summary: String(p.description ?? p.teaser ?? "").slice(0, 500),
          tags: isIntern ? ["Intern", "实习"] : ["New Grad", "校招", "咨询"],
          postedAt: this.now(),
          openedAt: this.now(),
          deadlineAt: this.defaultDeadline(),
        });
      }

      if (list.length < take) break;
      skip += take;
      if (skip > 500) break;
    }

    return jobs;
  }
}
