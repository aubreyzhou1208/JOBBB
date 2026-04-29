"use client";

import { useState } from "react";

import { JobsList } from "@/components/jobs/jobs-list";
import { JobFormDialog } from "@/components/jobs/job-form-dialog";
import { PageIntro } from "@/components/layout/page-intro";
import { useJobIngestion } from "@/features/jobs/use-job-ingestion";
import { getJobInitialValues, useJobs } from "@/features/jobs/use-jobs";
import { JobPosting } from "@/lib/types";

export default function JobsPage() {
  const {
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
    appliedJobIds
  } = useJobs();
  const {
    latestSyncRun,
    refreshJobs,
    isPending
  } = useJobIngestion();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JobPosting | null>(null);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="岗位库"
        title="把岗位库做成可筛选的基础数据库"
        description="现在已经接入真实岗位检索入口，先把腾讯校招官网做成第一版可用数据源，并支持按校招 / 实习、中国大陆 / 香港继续筛选。"
      />

      <JobsList
        jobs={filteredJobs}
        selectedJob={selectedJob}
        onSelectJob={setSelectedJobId}
        onAdd={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
        onEdit={(job) => {
          setEditing(job);
          setDialogOpen(true);
        }}
        onDelete={deleteJobPosting}
        onToggleSaved={toggleSavedJob}
        onCreateApplication={createApplicationFromJob}
        appliedJobIds={appliedJobIds}
        stats={stats}
        ingestion={{
          latestSyncRun,
          refreshJobs,
          isPending
        }}
        filters={{
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
          programOptions
        }}
      />

      <JobFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialValues={getJobInitialValues(editing ?? undefined)}
        mode={editing ? "edit" : "create"}
        onSubmit={(values) => {
          if (editing) {
            updateJobPosting(editing.id, values);
            return;
          }

          addJobPosting(values);
        }}
      />
    </div>
  );
}
