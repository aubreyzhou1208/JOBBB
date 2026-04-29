"use client";

import { useState } from "react";

import { JobsList } from "@/components/jobs/jobs-list";
import { JobFormDialog } from "@/components/jobs/job-form-dialog";
import { PageIntro } from "@/components/layout/page-intro";
import { getJobInitialValues } from "@/features/jobs/use-jobs";
import { useJobsDB } from "@/features/jobs/use-jobs-db";
import { useAppState } from "@/components/providers/app-state-provider";
import { JobPosting } from "@/lib/types";

export default function JobsPage() {
  const {
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
  } = useJobsDB();

  const { addJobPosting, updateJobPosting, deleteJobPosting, createApplicationFromJob, state } = useAppState();
  const appliedJobIds = new Set(state.applications.map((a) => a.jobPostingId).filter(Boolean) as string[]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JobPosting | null>(null);

  // Fake sync run shape to satisfy JobsList ingestion prop
  const latestSyncRun = lastSync
    ? {
        id: "db-sync",
        providerId: "full_sync",
        providerLabel: "全量同步",
        syncLabel: `同步完成 · 新增 ${lastSync.saved} · 更新 ${lastSync.updated}`,
        status: "SUCCESS" as const,
        query: "",
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        fetchedCount: lastSync.totalFetched,
        createdCount: lastSync.saved,
        updatedCount: lastSync.updated,
        message: `共抓取 ${lastSync.totalFetched} 条，新增 ${lastSync.saved}，更新 ${lastSync.updated}`,
      }
    : null;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="岗位库"
        title="把岗位库做成可筛选的基础数据库"
        description="已接入腾讯等真实岗位数据库，支持按校招 / 实习、地区、岗位类型筛选。点击刷新同步最新岗位。"
      />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">正在加载岗位数据…</div>
      ) : (
        <JobsList
          jobs={filteredJobs}
          selectedJob={selectedJob}
          onSelectJob={setSelectedJobId}
          onAdd={() => { setEditing(null); setDialogOpen(true); }}
          onEdit={(job) => { setEditing(job); setDialogOpen(true); }}
          onDelete={deleteJobPosting}
          onToggleSaved={toggleSavedJob}
          onCreateApplication={createApplicationFromJob}
          appliedJobIds={appliedJobIds}
          stats={stats}
          ingestion={{
            latestSyncRun,
            refreshJobs: syncJobs,
            isPending: syncing,
          }}
          filters={{
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
          }}
        />
      )}

      <JobFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialValues={getJobInitialValues(editing ?? undefined)}
        mode={editing ? "edit" : "create"}
        onSubmit={(values) => {
          if (editing) { updateJobPosting(editing.id, values); return; }
          addJobPosting(values);
        }}
      />
    </div>
  );
}
