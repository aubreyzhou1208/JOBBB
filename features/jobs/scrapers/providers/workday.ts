import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

/**
 * Generic Workday ATS provider.
 * API: POST https://{tenant}.wd{N}.myworkdayjobs.com/wday/cxs/{tenant}/{board}/jobs
 *
 * To add a company: find the tenant, wd-number, and board name from their careers URL.
 * e.g. careers.example.com → https://example.wd1.myworkdayjobs.com/en-US/BoardName
 */
export class WorkdayProvider extends JobProvider {
  readonly id: string;
  readonly companyName: string;
  private readonly tenant: string;
  private readonly wd: number;
  private readonly board: string;
  private readonly campusKeywords: string[];

  constructor(opts: {
    id: string;
    companyName: string;
    tenant: string;
    wd?: number;
    board: string;
    campusKeywords?: string[];
  }) {
    super();
    this.id = opts.id;
    this.companyName = opts.companyName;
    this.tenant = opts.tenant;
    this.wd = opts.wd ?? 1;
    this.board = opts.board;
    this.campusKeywords = opts.campusKeywords ?? [
      "intern", "internship", "campus", "graduate", "new grad",
      "entry level", "analyst", "associate", "junior", "校招", "实习",
    ];
  }

  private get apiUrl() {
    return `https://${this.tenant}.wd${this.wd}.myworkdayjobs.com/wday/cxs/${this.tenant}/${this.board}/jobs`;
  }

  async fetchJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    let offset = 0;
    const limit = 50;

    while (true) {
      const res = await this.fetchWithTimeout(this.apiUrl, {
        method: "POST",
        headers: this.headers({ "Content-Type": "application/json", Accept: "application/json" }),
        body: JSON.stringify({ appliedFacets: {}, limit, offset, searchText: "" }),
      });

      if (!res.ok) throw new Error(`Workday ${this.tenant}/${this.board}: ${res.status}`);
      const data = await res.json();
      const list: unknown[] = (data?.jobPostings ?? data?.jobs ?? []) as unknown[];
      if (list.length === 0) break;

      for (const p of list as Record<string, unknown>[]) {
        const title = String(p.title ?? p.jobTitle ?? "");
        const titleLow = title.toLowerCase();
        const isCampus = this.campusKeywords.some((kw) => titleLow.includes(kw.toLowerCase()));
        if (!isCampus) continue;

        const isIntern = /intern/i.test(title);
        const bulletFields = Array.isArray(p.bulletFields) ? p.bulletFields : [];
        const jobId = String(bulletFields[0] ?? p.externalPath ?? p.jobId ?? "");
        const applyPath = String(p.externalPath ?? "");
        jobs.push({
          companyName: this.companyName,
          title,
          location: String(p.locationsText ?? p.primaryLocation ?? ""),
          workMode: "ONSITE",
          employmentType: isIntern ? "INTERN" : "NEW_GRAD",
          applyUrl: applyPath
            ? `https://${this.tenant}.wd${this.wd}.myworkdayjobs.com/en-US/${this.board}${applyPath}`
            : `https://${this.tenant}.wd${this.wd}.myworkdayjobs.com/en-US/${this.board}`,
          sourceJobId: jobId || title.toLowerCase().replace(/\s+/g, "-"),
          source: this.id,
          sourceType: "workday",
          summary: String(p.jobDescription ?? "").replace(/<[^>]+>/g, "").slice(0, 500),
          tags: isIntern ? ["Intern", "实习"] : ["New Grad", "校招"],
          postedAt: this.now(),
          openedAt: this.now(),
          deadlineAt: this.defaultDeadline(),
        });
      }

      if (list.length < limit) break;
      offset += limit;
      if (offset > 1000) break;
    }

    return jobs;
  }
}

// Pre-configured Workday companies (board names verified or best-known)
// Update board names if the company changes their Workday setup
export const WorkdayProviders: WorkdayProvider[] = [
  // Goldman Sachs — board name needs verification; check https://goldmansachs.wd1.myworkdayjobs.com
  // new WorkdayProvider({ id: "goldman-sachs", companyName: "Goldman Sachs", tenant: "goldmansachs", board: "GS_campus" }),

  // Morgan Stanley
  // new WorkdayProvider({ id: "morgan-stanley", companyName: "Morgan Stanley", tenant: "morganstanley", board: "campus_recruiting" }),

  // JP Morgan
  // new WorkdayProvider({ id: "jpmorgan", companyName: "JP Morgan", tenant: "jpmorgan", board: "campus" }),
];
