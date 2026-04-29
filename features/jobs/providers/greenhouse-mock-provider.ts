import { greenhouseSeeds } from "@/features/jobs/providers/mock-seeds";
import { JobIngestionDraft, JobSearchProvider } from "@/features/jobs/providers/types";

function filterSeeds(query: string, seeds: typeof greenhouseSeeds): JobIngestionDraft[] {
  const normalizedQuery = query.trim().toLowerCase();

  return seeds
    .filter((seed) => {
      if (!normalizedQuery) return true;

      const haystack = [
        seed.companyName,
        seed.title,
        seed.location,
        seed.summary,
        seed.tags.join(" ")
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    })
    .map((seed) => ({
      ...seed,
      isSaved: false,
      notes: seed.notes ?? ""
    }));
}

export const greenhouseMockProvider: JobSearchProvider = {
  id: "greenhouse_mock",
  label: "Greenhouse Mock",
  description: "模拟来自 Greenhouse 的自动检索结果。",
  channel: "ATS",
  async search({ query }) {
    return {
      providerId: "greenhouse_mock",
      providerLabel: "Greenhouse Mock",
      jobs: filterSeeds(query, greenhouseSeeds)
    };
  }
};
