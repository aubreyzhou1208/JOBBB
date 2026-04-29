import { jobProviders } from "@/features/jobs/providers";
import { JobProviderId, JobSearchResult } from "@/features/jobs/providers/types";

export async function searchJobsAcrossProviders(input: {
  query: string;
  providerIds: JobProviderId[];
}) {
  const activeProviders = jobProviders.filter((provider) => input.providerIds.includes(provider.id));
  const results = await Promise.all(activeProviders.map((provider) => provider.search({ query: input.query })));

  return results.reduce<JobSearchResult[]>(
    (accumulator, result) => accumulator.concat(result),
    []
  );
}
