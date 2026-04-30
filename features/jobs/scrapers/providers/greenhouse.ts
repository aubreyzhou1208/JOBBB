import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

// Generic Greenhouse ATS provider – parameterised by board token
export class GreenhouseProvider extends JobProvider {
  readonly id: string;
  readonly companyName: string;
  private readonly boardToken: string;
  private readonly campusKeywords: string[];

  constructor(opts: {
    id: string;
    companyName: string;
    boardToken: string;
    campusKeywords?: string[];
  }) {
    super();
    this.id = opts.id;
    this.companyName = opts.companyName;
    this.boardToken = opts.boardToken;
    this.campusKeywords = opts.campusKeywords ?? ["intern", "campus", "graduate", "new grad", "entry", "校招", "实习"];
  }

  async fetchJobs(): Promise<ScrapedJob[]> {
    const url = `https://api.greenhouse.io/v1/boards/${this.boardToken}/jobs?content=true`;
    const res = await this.fetchWithTimeout(url, { headers: this.headers() });
    if (!res.ok) return []; // board token not yet confirmed — skip silently

    const data = await res.json();
    const allJobs: unknown[] = data?.jobs ?? [];

    const campus = allJobs.filter((j) => {
      const job = j as Record<string, unknown>;
      const title = String(job.title ?? "").toLowerCase();
      return this.campusKeywords.some((kw) => title.includes(kw.toLowerCase()));
    });

    return campus.map((j) => {
      const job = j as Record<string, unknown>;
      const title = String(job.title ?? "");
      const isIntern = /intern/i.test(title);
      const jobId = String(job.id ?? "");
      const location = (job.location as Record<string, unknown>)?.name ?? "Unknown";
      const content = job.content as Record<string, unknown> | undefined;
      return {
        companyName: this.companyName,
        title,
        location: String(location),
        workMode: "ONSITE" as const,
        employmentType: isIntern ? "INTERN" as const : "NEW_GRAD" as const,
        applyUrl: String(job.absolute_url ?? `https://boards.greenhouse.io/${this.boardToken}/jobs/${jobId}`),
        sourceJobId: jobId,
        source: this.id,
        sourceType: "greenhouse",
        summary: String(content?.description ?? job.content ?? "").replace(/<[^>]+>/g, "").slice(0, 500),
        tags: isIntern ? ["实习", "Intern"] : ["校招", "New Grad"],
        postedAt: job.updated_at ? new Date(String(job.updated_at)) : this.now(),
        openedAt: this.now(),
        deadlineAt: this.defaultDeadline(),
      };
    });
  }
}

// Pre-configured Greenhouse companies
export const BlackRockProvider = new GreenhouseProvider({ id: "blackrock", companyName: "BlackRock", boardToken: "blackrock" });
export const GoldmanSachsProvider = new GreenhouseProvider({ id: "goldman-sachs", companyName: "Goldman Sachs", boardToken: "gs" });
export const MorganStanleyProvider = new GreenhouseProvider({ id: "morgan-stanley", companyName: "Morgan Stanley", boardToken: "morganstanley" });
export const BCGProvider = new GreenhouseProvider({ id: "bcg", companyName: "BCG", boardToken: "bcg", campusKeywords: ["intern", "campus", "associate", "graduate", "new grad", "entry"] });
