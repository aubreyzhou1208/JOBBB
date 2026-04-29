import { leverLiveSources } from "@/features/jobs/providers/live-source-config";
import { extractTags, inferEmploymentType, inferWorkMode, matchesChinaCampusFocus, matchesQuery, stripHtml } from "@/features/jobs/providers/live-shared";
import { JobIngestionDraft, JobSearchResult } from "@/features/jobs/providers/types";

type LeverPosting = {
  id: string;
  text: string;
  descriptionPlain?: string;
  categories?: {
    location?: string;
    commitment?: string;
    team?: string;
  };
  applyUrl?: string;
  hostedUrl?: string;
  workplaceType?: "remote" | "hybrid" | "on-site" | "unspecified";
  salaryRange?: {
    currency?: string;
    interval?: string;
    min?: number;
    max?: number;
  };
  createdAt?: number;
};

function formatSalaryRange(salaryRange: LeverPosting["salaryRange"]) {
  if (!salaryRange?.min || !salaryRange?.max || !salaryRange.currency) return "";
  return `${salaryRange.currency} ${salaryRange.min} - ${salaryRange.max}${salaryRange.interval ? ` / ${salaryRange.interval}` : ""}`;
}

export async function searchLeverLiveSources(query: string): Promise<JobSearchResult> {
  const jobs: JobIngestionDraft[] = [];

  for (const source of leverLiveSources) {
    const response = await fetch(
      `https://api.lever.co/v0/postings/${source.site}?mode=json&limit=100`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store"
      }
    );

    if (!response.ok) {
      continue;
    }

    const data = (await response.json()) as LeverPosting[];

    for (const job of data) {
      const rawDescription = stripHtml(job.descriptionPlain);
      const location = job.categories?.location ?? "未标注地点";
      const summary = rawDescription.slice(0, 220);
      const matcherText = [source.companyName, job.text, location, summary, rawDescription].join(" ");

      if (!matchesQuery(matcherText, query)) continue;
      if (!matchesChinaCampusFocus({ title: job.text, location, summary, rawDescription })) continue;

      const workplaceTypeText =
        job.workplaceType === "remote"
          ? "remote"
          : job.workplaceType === "hybrid"
            ? "hybrid"
            : "on-site";

      const tags = Array.from(
        new Set(
          [
            ...extractTags(matcherText),
            job.categories?.team,
            job.categories?.commitment
          ].filter(Boolean) as string[]
        )
      ).slice(0, 6);

      jobs.push({
        companyId: "",
        companyName: source.companyName,
        title: job.text,
        location,
        workMode: inferWorkMode(workplaceTypeText),
        employmentType: inferEmploymentType(`${job.text} ${job.categories?.commitment ?? ""}`),
        salaryRange: formatSalaryRange(job.salaryRange),
        tags,
        postedAt: job.createdAt ? new Date(job.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        openedAt: job.createdAt ? new Date(job.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        deadlineAt: "",
        applyUrl: job.applyUrl ?? job.hostedUrl ?? "",
        source: source.sourceLabel ?? "Lever",
        sourceJobId: `${source.site}-${job.id}`,
        sourceType: "ATS 抓取",
        isSaved: false,
        summary: summary || "来自 Lever 的岗位描述。",
        rawDescription,
        notes: "真实 Lever 接口抓取"
      });
    }
  }

  return {
    providerId: "lever_live",
    providerLabel: "Lever Live",
    jobs
  };
}
