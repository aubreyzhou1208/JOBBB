"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import { normalizeJobPosting } from "@/features/jobs/job-tagging";
import { mockAppState } from "@/lib/mock-data";
import { AppState, Application, JobPosting, JobPostingInput, JobSyncRun, ResumeProfile } from "@/lib/types";
import { createId } from "@/lib/utils";

type AppStateContextValue = {
  state: AppState;
  addApplication: (input: Omit<Application, "id">) => void;
  updateApplication: (id: string, input: Omit<Application, "id">) => void;
  deleteApplication: (id: string) => void;
  addJobPosting: (input: JobPostingInput) => void;
  applyJobSyncResult: (input: { run: Omit<JobSyncRun, "createdCount" | "updatedCount" | "message">; jobs: JobPostingInput[] }) => void;
  updateJobPosting: (id: string, input: JobPostingInput) => void;
  deleteJobPosting: (id: string) => void;
  toggleSavedJob: (id: string) => void;
  createApplicationFromJob: (jobId: string) => void;
  updateResumeProfile: (input: ResumeProfile) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(mockAppState);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      addApplication: (input) =>
        setState((current) => ({
          ...current,
          applications: [{ id: createId("application"), ...input }, ...current.applications]
        })),
      updateApplication: (id, input) =>
        setState((current) => ({
          ...current,
          applications: current.applications.map((application) =>
            application.id === id ? { id, ...input } : application
          )
        })),
      deleteApplication: (id) =>
        setState((current) => ({
          ...current,
          applications: current.applications.filter((application) => application.id !== id)
        })),
      addJobPosting: (input) =>
        setState((current) => ({
          ...current,
          jobPostings: [{ id: createId("job"), ...normalizeJobPosting(input) }, ...current.jobPostings]
        })),
      applyJobSyncResult: ({ run, jobs }) =>
        setState((current) => {
          const mergedJobs = [...current.jobPostings];
          let createdCount = 0;
          let updatedCount = 0;

          for (const rawInput of jobs) {
            const input = normalizeJobPosting(rawInput);
            const existingIndex = mergedJobs.findIndex(
              (job) =>
                (input.sourceJobId && job.sourceJobId === input.sourceJobId) ||
                (job.companyName === input.companyName && job.title === input.title && job.location === input.location)
            );

            if (existingIndex >= 0) {
              mergedJobs[existingIndex] = {
                ...mergedJobs[existingIndex],
                ...input,
                id: mergedJobs[existingIndex].id,
                isSaved: mergedJobs[existingIndex].isSaved || input.isSaved
              };
              updatedCount += 1;
              continue;
            }

            mergedJobs.unshift({
              id: createId("job"),
              ...input
            });
            createdCount += 1;
          }

          return {
            ...current,
            jobPostings: mergedJobs,
            jobSyncRuns: [
              {
                ...run,
                createdCount,
                updatedCount,
                message:
                  run.status === "FAILED"
                    ? "岗位库刷新失败，请稍后再试。"
                    : `岗位库已刷新：新增 ${createdCount} 条，更新 ${updatedCount} 条。`
              },
              ...current.jobSyncRuns
            ].slice(0, 20)
          };
        }),
      updateJobPosting: (id, input) =>
        setState((current) => ({
          ...current,
          jobPostings: current.jobPostings.map((job) => (job.id === id ? { id, ...normalizeJobPosting(input) } : job))
        })),
      deleteJobPosting: (id) =>
        setState((current) => ({
          ...current,
          jobPostings: current.jobPostings.filter((job) => job.id !== id)
        })),
      toggleSavedJob: (id) =>
        setState((current) => ({
          ...current,
          jobPostings: current.jobPostings.map((job) =>
            job.id === id ? { ...job, isSaved: !job.isSaved } : job
          )
        })),
      createApplicationFromJob: (jobId) =>
        setState((current) => {
          const job = current.jobPostings.find((item) => item.id === jobId);
          const alreadyExists = current.applications.some((item) => item.jobPostingId === jobId);

          if (!job || alreadyExists) {
            return current;
          }

          return {
            ...current,
            applications: [
              {
                id: createId("application"),
                jobPostingId: job.id,
                companyId: job.companyId,
                companyName: job.companyName,
                roleTitle: job.title,
                appliedAt: new Date().toISOString().slice(0, 10),
                status: "SAVED",
                trackingUrl: "",
                notes: `由岗位库转入，来源：${job.source}`
              },
              ...current.applications
            ]
          };
        }),
      updateResumeProfile: (input) =>
        setState((current) => ({
          ...current,
          resumeProfile: input
        }))
    }),
    [state]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return context;
}
