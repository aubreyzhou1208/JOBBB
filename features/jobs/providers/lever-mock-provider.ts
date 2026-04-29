import { leverSeeds } from "@/features/jobs/providers/mock-seeds";
import { JobIngestionDraft, JobSearchProvider } from "@/features/jobs/providers/types";

function filterSeeds(query: string, seeds: typeof leverSeeds): JobIngestionDraft[] {
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

export const leverMockProvider: JobSearchProvider = {
  id: "lever_mock",
  label: "Lever Mock",
  description: "模拟来自 Lever 的自动检索结果。",
  channel: "ATS",
  async search({ query }) {
    return {
      providerId: "lever_mock",
      providerLabel: "Lever Mock",
      jobs: filterSeeds(query, leverSeeds)
    };
  }
};
