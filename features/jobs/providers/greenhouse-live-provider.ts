import { greenhouseLiveSources } from "@/features/jobs/providers/live-source-config";
import { extractTags, inferEmploymentType, inferWorkMode, matchesChinaCampusFocus, matchesQuery, stripHtml } from "@/features/jobs/providers/live-shared";
import { JobIngestionDraft, JobSearchResult } from "@/features/jobs/providers/types";

type GreenhouseJob = {
  id: number;
  title: string;
  updated_at?: string;
  absolute_url?: string;
  content?: string;
  location?: { name?: string };
  offices?: Array<{ location?: string; name?: string }>;
  departments?: Array<{ name?: string }>;
};

export async function searchGreenhouseLiveSources(query: string): Promise<JobSearchResult> {
  const jobs: JobIngestionDraft[] = [];

  for (const source of greenhouseLiveSources) {
    const response = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${source.boardToken}/jobs?content=true`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      continue;
    }

    const data = (await response.json()) as { jobs?: GreenhouseJob[] };

    for (const job of data.jobs ?? []) {
      const summary = stripHtml(job.content).slice(0, 220);
      const location =
        job.location?.name ??
        job.offices?.map((office) => office.location || office.name).filter(Boolean).join(" / ") ??
        "未标注地点";
      const rawDescription = stripHtml(job.content);
      const matcherText = [source.companyName, job.title, location, summary, rawDescription].join(" ");

      if (!matchesQuery(matcherText, query)) continue;
      if (!matchesChinaCampusFocus({ title: job.title, location, summary, rawDescription })) continue;

      const tags = Array.from(
        new Set([
          ...extractTags(matcherText),
          ...(job.departments?.map((department) => department.name).filter(Boolean) as string[] | undefined ?? [])
        ])
      ).slice(0, 6);

      jobs.push({
        companyId: "",
        companyName: source.companyName,
        title: job.title,
        location,
        workMode: inferWorkMode(matcherText),
        employmentType: inferEmploymentType(matcherText),
        salaryRange: "",
        tags,
        postedAt: job.updated_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
        openedAt: job.updated_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
        deadlineAt: "",
        applyUrl: job.absolute_url ?? "",
        source: source.sourceLabel ?? "Greenhouse",
        sourceJobId: `${source.boardToken}-${job.id}`,
        sourceType: "ATS 抓取",
        isSaved: false,
        summary: summary || "来自 Greenhouse 的岗位描述。",
        rawDescription,
        notes: "真实 Greenhouse 接口抓取"
      });
    }
  }

  return {
    providerId: "greenhouse_live",
    providerLabel: "Greenhouse Live",
    jobs
  };
}
