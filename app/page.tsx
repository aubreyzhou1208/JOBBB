"use client";

import { useMemo } from "react";
import { PageIntro } from "@/components/layout/page-intro";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { useAppState } from "@/components/providers/app-state-provider";
import { useDashboardStats } from "@/features/jobs/use-dashboard-stats";
import { JobPosting } from "@/lib/types";

export default function DashboardPage() {
  const { state } = useAppState();
  const { stats: dbStats, loading } = useDashboardStats();

  const appStats = useMemo(
    () => [
      { label: "总投递数", value: state.applications.length, helper: "所有进度集中管理" },
      {
        label: "已投递",
        value: state.applications.filter((a) => a.status === "APPLIED").length,
        helper: "已提交，等待推进",
      },
      {
        label: "面试中",
        value: state.applications.filter((a) => a.status === "INTERVIEW" || a.status === "OA").length,
        helper: "仍在推进中的机会",
      },
      {
        label: "Offer",
        value: state.applications.filter((a) => a.status === "OFFER").length,
        helper: "进入最终决策阶段",
      },
    ],
    [state.applications]
  );

  const jobStats = useMemo(() => {
    if (!dbStats) return null;
    const newGrad = dbStats.byEmploymentType.find((t) => t.type === "NEW_GRAD")?.count ?? 0;
    const intern = dbStats.byEmploymentType.find((t) => t.type === "INTERN")?.count ?? 0;
    return [
      { label: "岗位库总数", value: dbStats.totalJobs, helper: "已同步的校招 / 实习岗位" },
      { label: "校招岗位", value: newGrad, helper: "应届全职岗位" },
      { label: "实习岗位", value: intern, helper: "在读可申请" },
      {
        label: "覆盖公司",
        value: dbStats.byCompany.length,
        helper: dbStats.lastSync ? `最近同步：${new Date(dbStats.lastSync.finishedAt).toLocaleDateString("zh-CN")}` : "暂无同步记录",
      },
    ];
  }, [dbStats]);

  // Convert DB recentJobs to JobPosting shape for UpcomingDeadlines
  const upcomingJobs = useMemo((): JobPosting[] => {
    if (!dbStats?.recentJobs.length) return [];
    return dbStats.recentJobs.map((j) => ({
      id: j.id,
      companyId: "",
      companyName: j.companyName,
      title: j.title,
      location: j.location,
      workMode: "ONSITE",
      employmentType: j.employmentType as JobPosting["employmentType"],
      tags: [],
      normalizedTags: [],
      regionTags: [],
      roleTags: j.roleTags,
      programTags: j.programTags,
      postedAt: j.deadlineAt,
      openedAt: j.deadlineAt,
      deadlineAt: j.deadlineAt,
      applyUrl: j.applyUrl,
      source: "",
      sourceType: "",
      summary: "",
      isSaved: false,
    }));
  }, [dbStats]);

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="总览"
        title="你的求职工作台，一眼看到全局进度"
        description="申请进度和岗位库实时同步。点击左侧「岗位库」刷新最新岗位数据。"
      />

      {/* Application progress */}
      <div>
        <p className="mb-3 text-sm font-medium text-mutedText">投递进度</p>
        <StatsCards items={appStats} />
      </div>

      {/* Job DB stats */}
      <div>
        <p className="mb-3 text-sm font-medium text-mutedText">
          岗位库概览{loading ? "  加载中…" : ""}
        </p>
        <StatsCards items={jobStats ?? [
          { label: "岗位库总数", value: 0, helper: "加载中…" },
          { label: "校招岗位", value: 0, helper: "" },
          { label: "实习岗位", value: 0, helper: "" },
          { label: "覆盖公司", value: 0, helper: "" },
        ]} />
      </div>

      {/* Last sync message */}
      {dbStats?.lastSync && (
        <p className="text-xs text-mutedText">
          最近同步：{new Date(dbStats.lastSync.finishedAt).toLocaleString("zh-CN")} ·{" "}
          {dbStats.lastSync.message}
        </p>
      )}

      <UpcomingDeadlines jobs={upcomingJobs} />
    </div>
  );
}
