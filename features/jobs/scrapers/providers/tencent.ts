import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";
import { searchChinaCampusLiveSources } from "@/features/jobs/providers/china-campus-live-provider";

// Wraps the battle-tested multi-step Tencent campus API implementation
export class TencentProvider extends JobProvider {
  readonly id = "tencent";
  readonly companyName = "腾讯";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const result = await searchChinaCampusLiveSources("");
    return result.jobs.map((draft) => ({
      companyName: draft.companyName,
      title: draft.title,
      location: draft.location,
      workMode: draft.workMode,
      employmentType: draft.employmentType,
      applyUrl: draft.applyUrl,
      sourceJobId: draft.sourceJobId ?? `tencent-${draft.title}-${draft.location}`,
      source: "tencent",
      sourceType: "campus_api",
      summary: draft.summary,
      rawDescription: draft.rawDescription,
      salaryRange: draft.salaryRange,
      tags: draft.tags,
      postedAt: new Date(draft.postedAt),
      openedAt: new Date(draft.openedAt),
      deadlineAt: new Date(draft.deadlineAt),
    }));
  }
}
