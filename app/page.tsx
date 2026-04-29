"use client";

import { useMemo } from "react";

import { PageIntro } from "@/components/layout/page-intro";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { useAppState } from "@/components/providers/app-state-provider";

export default function DashboardPage() {
  const { state } = useAppState();

  const stats = useMemo(
    () => [
      { label: "总投递数", value: state.applications.length, helper: "所有进度集中管理" },
      {
        label: "已投递",
        value: state.applications.filter((item) => item.status === "APPLIED").length,
        helper: "已提交，等待推进"
      },
      {
        label: "面试中",
        value: state.applications.filter((item) => item.status === "INTERVIEW" || item.status === "OA").length,
        helper: "仍在推进中的机会"
      },
      {
        label: "Offer",
        value: state.applications.filter((item) => item.status === "OFFER").length,
        helper: "进入最终决策阶段"
      }
    ],
    [state.applications]
  );

  const upcomingJobs = useMemo(
    () =>
      [...state.jobPostings]
        .sort((a, b) => new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime())
        .slice(0, 4),
    [state.jobPostings]
  );

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="总览"
        title="你的求职工作台，一眼看到全局进度"
        description="这套前端已经把页面、业务逻辑和数据层拆开，当前用 mock 数据跑通，后续切到 API、Prisma 和 PostgreSQL 时不用推倒重来。"
      />
      <StatsCards items={stats} />
      <UpcomingDeadlines jobs={upcomingJobs} />
    </div>
  );
}
