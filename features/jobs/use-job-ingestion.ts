"use client";

import { useState, useTransition } from "react";

import { useAppState } from "@/components/providers/app-state-provider";
import { JobIngestionDraft, JobProviderId } from "@/features/jobs/providers/types";
import { JobSyncRun } from "@/lib/types";

export function useJobIngestion() {
  const [selectedProviderIds] = useState<JobProviderId[]>(["campus_portal_live"]);
  const { state, applyJobSyncResult } = useAppState();
  const [isPending, startTransition] = useTransition();
  const latestSyncRun = state.jobSyncRuns[0] ?? null;

  const refreshJobs = () => {
    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/jobs/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            providerIds: selectedProviderIds
          })
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          run: Omit<JobSyncRun, "createdCount" | "updatedCount" | "message">;
          jobs: JobIngestionDraft[];
        };
        applyJobSyncResult(payload);
      })();
    });
  };

  return {
    latestSyncRun,
    selectedProviderIds,
    refreshJobs,
    isPending
  };
}
