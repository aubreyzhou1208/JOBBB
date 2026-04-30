import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

// Jane Street uses Greenhouse ATS (board token: janestreet)
const GH_URL = "https://api.greenhouse.io/v1/boards/janestreet/jobs?content=true";

const CAMPUS_KW = ["intern", "campus", "graduate", "new grad", "entry", "associate", "analyst", "quant", "trader", "researcher", "engineer", "developer"];

export class JaneStreetProvider extends JobProvider {
  readonly id = "jane-street";
  readonly companyName = "Jane Street";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const res = await this.fetchWithTimeout(GH_URL, { headers: this.headers() });
    if (!res.ok) throw new Error(`Jane Street Greenhouse: ${res.status}`);

    const data = await res.json();
    const allJobs: Record<string, unknown>[] = (data?.jobs ?? []) as Record<string, unknown>[];

    // Jane Street doesn't have "campus" specific boards — take all tech/quant roles
    // Filter to intern/new-grad-level by title keywords
    return allJobs
      .filter((j) => {
        const title = String(j.title ?? "").toLowerCase();
        return CAMPUS_KW.some((kw) => title.includes(kw));
      })
      .map((j) => {
        const title = String(j.title ?? "");
        const isIntern = /intern/i.test(title);
        const jobId = String(j.id ?? "");
        const location = (j.location as Record<string, unknown>)?.name ?? "New York";
        return {
          companyName: this.companyName,
          title,
          location: String(location),
          workMode: "ONSITE" as const,
          employmentType: isIntern ? "INTERN" as const : "NEW_GRAD" as const,
          applyUrl: String(j.absolute_url ?? `https://boards.greenhouse.io/janestreet/jobs/${jobId}`),
          sourceJobId: jobId,
          source: this.id,
          sourceType: "greenhouse",
          summary: String((j.content as Record<string, unknown>)?.description ?? j.content ?? "")
            .replace(/<[^>]+>/g, "").slice(0, 500),
          tags: isIntern ? ["Intern", "实习"] : ["New Grad", "校招"],
          postedAt: j.updated_at ? new Date(String(j.updated_at)) : this.now(),
          openedAt: this.now(),
          deadlineAt: this.defaultDeadline(),
        };
      });
  }
}
