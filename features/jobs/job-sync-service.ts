import { searchJobsAcrossProviders } from "@/features/jobs/repository";
import { JobProviderId } from "@/features/jobs/providers/types";
import { JobSyncRun } from "@/lib/types";
import { createId } from "@/lib/utils";

export async function runJobSync(input: {
  query?: string;
  providerIds: JobProviderId[];
  providerLabel?: string;
  syncLabel?: string;
}) {
  const startedAt = new Date().toISOString();
  const query = input.query ?? "";
  const results = await searchJobsAcrossProviders({
    query,
    providerIds: input.providerIds
  });
  const jobs = results.flatMap((result) => result.jobs);
  const finishedAt = new Date().toISOString();

  const run: Omit<JobSyncRun, "createdCount" | "updatedCount" | "message"> = {
    id: createId("sync"),
    providerId: input.providerIds.join(","),
    providerLabel: input.providerLabel ?? "企业校招官网",
    syncLabel: input.syncLabel ?? "岗位库刷新",
    status: "SUCCESS",
    query,
    startedAt,
    finishedAt,
    fetchedCount: jobs.length
  };

  return {
    run,
    jobs,
    results
  };
}
