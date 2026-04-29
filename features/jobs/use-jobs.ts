"use client";

import { useMemo, useState } from "react";

import { useAppState } from "@/components/providers/app-state-provider";
import { JobEmploymentType, JobPosting, JobWorkMode } from "@/lib/types";

type JobSort = "relevance" | "latest" | "deadline";

export function useJobs() {
  const { state, addJobPosting, updateJobPosting, deleteJobPosting, toggleSavedJob, createApplicationFromJob } = useAppState();
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("ALL");
  const [selectedWorkMode, setSelectedWorkMode] = useState<JobWorkMode | "ALL">("ALL");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<JobEmploymentType | "ALL">("ALL");
  const [selectedRegionTag, setSelectedRegionTag] = useState("ALL");
  const [selectedRoleTag, setSelectedRoleTag] = useState("ALL");
  const [selectedProgramTag, setSelectedProgramTag] = useState("ALL");
  const [savedOnly, setSavedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<JobSort>("relevance");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const filteredJobs = useMemo(() => {
    const jobs = state.jobPostings.filter((job) => {
      const haystack = [
        job.companyName,
        job.title,
        job.location,
        job.source,
        job.summary,
        job.normalizedTags.join(" ")
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesCompany = selectedCompany === "ALL" || job.companyName === selectedCompany;
      const matchesWorkMode = selectedWorkMode === "ALL" || job.workMode === selectedWorkMode;
      const matchesEmploymentType =
        selectedEmploymentType === "ALL" || job.employmentType === selectedEmploymentType;
      const matchesRegionTag = selectedRegionTag === "ALL" || job.regionTags.includes(selectedRegionTag);
      const matchesRoleTag = selectedRoleTag === "ALL" || job.roleTags.includes(selectedRoleTag);
      const matchesProgramTag = selectedProgramTag === "ALL" || job.programTags.includes(selectedProgramTag);
      const matchesSaved = !savedOnly || job.isSaved;

      return (
        matchesSearch &&
        matchesCompany &&
        matchesWorkMode &&
        matchesEmploymentType &&
        matchesRegionTag &&
        matchesRoleTag &&
        matchesProgramTag &&
        matchesSaved
      );
    });

    return [...jobs].sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      }

      if (sortBy === "deadline") {
        return new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime();
      }

      const score = (job: JobPosting) => {
        let total = 0;
        if (job.isSaved) total += 5;
        if (job.tags.some((tag) => ["React", "Next.js", "TypeScript", "Frontend"].includes(tag))) total += 3;
        if (job.workMode === "REMOTE") total += 2;
        return total;
      };

      return score(b) - score(a);
    });
  }, [
    savedOnly,
    search,
    selectedCompany,
    selectedEmploymentType,
    selectedProgramTag,
    selectedRegionTag,
    selectedRoleTag,
    selectedWorkMode,
    sortBy,
    state.jobPostings
  ]);

  const selectedJob =
    filteredJobs.find((job) => job.id === selectedJobId) ??
    filteredJobs[0] ??
    state.jobPostings[0] ??
    null;

  const companyOptions = Array.from(new Set(state.jobPostings.map((job) => job.companyName))).sort();
  const regionOptions = Array.from(new Set(state.jobPostings.flatMap((job) => job.regionTags))).sort();
  const roleOptions = Array.from(new Set(state.jobPostings.flatMap((job) => job.roleTags))).sort();
  const programOptions = Array.from(new Set(state.jobPostings.flatMap((job) => job.programTags))).sort();

  const stats = {
    total: state.jobPostings.length,
    saved: state.jobPostings.filter((job) => job.isSaved).length,
    remote: state.jobPostings.filter((job) => job.workMode === "REMOTE").length,
    applied: state.applications.filter((item) => item.jobPostingId).length
  };

  return {
    jobs: state.jobPostings,
    filteredJobs,
    selectedJob,
    setSelectedJobId,
    search,
    setSearch,
    selectedCompany,
    setSelectedCompany,
    selectedWorkMode,
    setSelectedWorkMode,
    selectedEmploymentType,
    setSelectedEmploymentType,
    selectedRegionTag,
    setSelectedRegionTag,
    selectedRoleTag,
    setSelectedRoleTag,
    selectedProgramTag,
    setSelectedProgramTag,
    savedOnly,
    setSavedOnly,
    sortBy,
    setSortBy,
    companyOptions,
    regionOptions,
    roleOptions,
    programOptions,
    stats,
    addJobPosting,
    updateJobPosting,
    deleteJobPosting,
    toggleSavedJob,
    createApplicationFromJob,
    appliedJobIds: new Set(
      state.applications
        .map((item) => item.jobPostingId)
        .filter((value): value is string => Boolean(value))
    )
  };
}

export function getJobInitialValues(job?: JobPosting): Omit<JobPosting, "id"> {
  return (
    job ?? {
      companyId: "",
      companyName: "",
      title: "",
      location: "",
      workMode: "REMOTE",
      employmentType: "FULL_TIME",
      salaryRange: "",
      tags: [],
      normalizedTags: [],
      regionTags: [],
      roleTags: [],
      programTags: [],
      postedAt: new Date().toISOString().slice(0, 10),
      openedAt: new Date().toISOString().slice(0, 10),
      deadlineAt: new Date().toISOString().slice(0, 10),
      applyUrl: "",
      source: "",
      sourceJobId: "",
      sourceType: "手动录入",
      isSaved: false,
      summary: "",
      rawDescription: "",
      notes: ""
    }
  );
}
