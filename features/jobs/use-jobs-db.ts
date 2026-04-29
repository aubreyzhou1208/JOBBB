"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { JobEmploymentType, JobPosting, JobWorkMode } from "@/lib/types";

type JobSort = "relevance" | "latest" | "deadline";

interface ApiJob {
  id: string;
  dedupeKey: string;
  companyName: string;
  title: string;
  location: string;
  workMode: JobWorkMode;
  employmentType: JobEmploymentType;
  salaryRange: string | null;
  tags: string[];
  normalizedTags: string[];
  regionTags: string[];
  roleTags: string[];
  programTags: string[];
  postedAt: string;
  openedAt: string;
  deadlineAt: string;
  applyUrl: string;
  source: string;
  sourceType: string;
  summary: string;
  firstSeenAt: string;
  lastSyncedAt: string;
}

interface SyncReport {
  totalFetched: number;
  saved: number;
  updated: number;
  providers: { id: string; company: string; fetched: number; error?: string }[];
}

function toJobPosting(j: ApiJob, savedIds: Set<string>): JobPosting {
  return {
    id: j.id,
    companyId: j.source,
    companyName: j.companyName,
    title: j.title,
    location: j.location,
    workMode: j.workMode,
    employmentType: j.employmentType,
    salaryRange: j.salaryRange ?? undefined,
    tags: j.tags,
    normalizedTags: j.normalizedTags,
    regionTags: j.regionTags,
    roleTags: j.roleTags,
    programTags: j.programTags,
    postedAt: j.postedAt,
    openedAt: j.openedAt,
    deadlineAt: j.deadlineAt,
    applyUrl: j.applyUrl,
    source: j.source,
    sourceJobId: j.dedupeKey,
    sourceType: j.sourceType,
    summary: j.summary,
    isSaved: savedIds.has(j.id),
  };
}

const SAVED_KEY = "jobtracker:saved_ids";

function loadSavedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function persistSavedIds(ids: Set<string>) {
  localStorage.setItem(SAVED_KEY, JSON.stringify([...ids]));
}

export function useJobsDB() {
  const [allJobs, setAllJobs] = useState<ApiJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<SyncReport | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => loadSavedIds());

  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("ALL");
  const [selectedWorkMode, setSelectedWorkMode] = useState<JobWorkMode | "ALL">("ALL");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<JobEmploymentType | "ALL">("ALL");
  const [selectedRegionTag, setSelectedRegionTag] = useState("ALL");
  const [selectedRoleTag, setSelectedRoleTag] = useState("ALL");
  const [selectedProgramTag, setSelectedProgramTag] = useState("ALL");
  const [savedOnly, setSavedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<JobSort>("latest");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs?pageSize=500");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setAllJobs(data.jobs ?? []);
    } catch (err) {
      console.error("[useJobsDB] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const syncJobs = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/jobs/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-sync-secret": "local-dev-secret" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setLastSync(data.report ?? null);
      await fetchJobs();
    } catch (err) {
      console.error("[useJobsDB] sync error:", err);
    } finally {
      setSyncing(false);
    }
  }, [fetchJobs]);

  const toggleSavedJob = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persistSavedIds(next);
      return next;
    });
  }, []);

  const jobs = useMemo(
    () => allJobs.map((j) => toJobPosting(j, savedIds)),
    [allJobs, savedIds]
  );

  const filteredJobs = useMemo(() => {
    const filtered = jobs.filter((job) => {
      const haystack = [job.companyName, job.title, job.location, job.summary, job.normalizedTags.join(" ")]
        .join(" ")
        .toLowerCase();

      return (
        haystack.includes(search.toLowerCase()) &&
        (selectedCompany === "ALL" || job.companyName === selectedCompany) &&
        (selectedWorkMode === "ALL" || job.workMode === selectedWorkMode) &&
        (selectedEmploymentType === "ALL" || job.employmentType === selectedEmploymentType) &&
        (selectedRegionTag === "ALL" || job.regionTags.includes(selectedRegionTag)) &&
        (selectedRoleTag === "ALL" || job.roleTags.includes(selectedRoleTag)) &&
        (selectedProgramTag === "ALL" || job.programTags.includes(selectedProgramTag)) &&
        (!savedOnly || job.isSaved)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "latest") return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      if (sortBy === "deadline") return new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime();
      return (b.isSaved ? 1 : 0) - (a.isSaved ? 1 : 0);
    });
  }, [jobs, search, selectedCompany, selectedWorkMode, selectedEmploymentType, selectedRegionTag, selectedRoleTag, selectedProgramTag, savedOnly, sortBy]);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId) ?? null,
    [jobs, selectedJobId]
  );

  const companyOptions = useMemo(
    () => ["ALL", ...Array.from(new Set(jobs.map((j) => j.companyName))).sort()],
    [jobs]
  );
  const regionOptions = useMemo(
    () => ["ALL", ...Array.from(new Set(jobs.flatMap((j) => j.regionTags))).sort()],
    [jobs]
  );
  const roleOptions = useMemo(
    () => ["ALL", ...Array.from(new Set(jobs.flatMap((j) => j.roleTags))).sort()],
    [jobs]
  );
  const programOptions = useMemo(
    () => ["ALL", ...Array.from(new Set(jobs.flatMap((j) => j.programTags))).sort()],
    [jobs]
  );

  const stats = {
    total: jobs.length,
    saved: jobs.filter((j) => j.isSaved).length,
    remote: jobs.filter((j) => j.workMode === "REMOTE").length,
    applied: 0, // driven by AppState applications, not DB jobs
  };

  return {
    filteredJobs,
    selectedJob,
    setSelectedJobId,
    loading,
    syncing,
    lastSync,
    syncJobs,
    toggleSavedJob,
    search, setSearch,
    selectedCompany, setSelectedCompany,
    selectedWorkMode, setSelectedWorkMode,
    selectedEmploymentType, setSelectedEmploymentType,
    selectedRegionTag, setSelectedRegionTag,
    selectedRoleTag, setSelectedRoleTag,
    selectedProgramTag, setSelectedProgramTag,
    savedOnly, setSavedOnly,
    sortBy, setSortBy,
    companyOptions, regionOptions, roleOptions, programOptions,
    stats,
  };
}
