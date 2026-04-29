"use client";

import { ExternalLink, Heart, Pencil, PlusCircle, RefreshCcw, Search, Send, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobEmploymentType, JobPosting, JobSyncRun, JobWorkMode } from "@/lib/types";
import { formatDate, getDaysUntil } from "@/lib/utils";

const workModeLabels: Record<JobWorkMode, string> = {
  REMOTE: "远程",
  HYBRID: "混合",
  ONSITE: "现场"
};

const employmentTypeLabels: Record<JobEmploymentType, string> = {
  FULL_TIME: "全职",
  INTERN: "实习",
  NEW_GRAD: "校招",
  CONTRACT: "合同"
};

export function JobsList({
  jobs,
  selectedJob,
  onSelectJob,
  onEdit,
  onDelete,
  onAdd,
  onToggleSaved,
  onCreateApplication,
  appliedJobIds,
  ingestion,
  filters,
  stats
}: {
  jobs: JobPosting[];
  selectedJob: JobPosting | null;
  onSelectJob: (jobId: string) => void;
  onEdit: (job: JobPosting) => void;
  onDelete: (jobId: string) => void;
  onAdd: () => void;
  onToggleSaved: (jobId: string) => void;
  onCreateApplication: (jobId: string) => void;
  appliedJobIds: Set<string>;
  ingestion: {
    latestSyncRun: JobSyncRun | null;
    refreshJobs: () => void;
    isPending: boolean;
  };
  filters: {
    search: string;
    setSearch: (value: string) => void;
    selectedCompany: string;
    setSelectedCompany: (value: string) => void;
    selectedWorkMode: JobWorkMode | "ALL";
    setSelectedWorkMode: (value: JobWorkMode | "ALL") => void;
    selectedEmploymentType: JobEmploymentType | "ALL";
    setSelectedEmploymentType: (value: JobEmploymentType | "ALL") => void;
    selectedRegionTag: string;
    setSelectedRegionTag: (value: string) => void;
    selectedRoleTag: string;
    setSelectedRoleTag: (value: string) => void;
    selectedProgramTag: string;
    setSelectedProgramTag: (value: string) => void;
    savedOnly: boolean;
    setSavedOnly: (value: boolean) => void;
    sortBy: "relevance" | "latest" | "deadline";
    setSortBy: (value: "relevance" | "latest" | "deadline") => void;
    companyOptions: string[];
    regionOptions: string[];
    roleOptions: string[];
    programOptions: string[];
  };
  stats: {
    total: number;
    saved: number;
    remote: number;
    applied: number;
  };
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-mutedText">岗位总量</p>
            <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-mutedText">已收藏</p>
            <p className="mt-2 text-3xl font-semibold">{stats.saved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-mutedText">远程岗位</p>
            <p className="mt-2 text-3xl font-semibold">{stats.remote}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-mutedText">已转投递</p>
            <p className="mt-2 text-3xl font-semibold">{stats.applied}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>岗位数据库</CardTitle>
              <CardDescription>前台只负责刷新和查看结果，后台同步会自动重跑岗位抓取、标签归类和入库更新。</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={ingestion.refreshJobs} disabled={ingestion.isPending}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                {ingestion.isPending ? "刷新中..." : "刷新岗位库"}
              </Button>
              <Button onClick={onAdd}>
                <PlusCircle className="mr-2 h-4 w-4" />
                手动新增岗位
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 border-b border-borderSoft/70 pb-6">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              label="同步状态"
              value={ingestion.isPending ? "后台刷新中" : ingestion.latestSyncRun?.status === "SUCCESS" ? "最近一次成功" : "尚未刷新"}
              tone={ingestion.isPending ? "default" : "mint"}
            />
            <InfoCard
              label="最后刷新时间"
              value={ingestion.latestSyncRun ? formatDate(ingestion.latestSyncRun.finishedAt) : "暂无记录"}
            />
            <InfoCard
              label="同步结果"
              value={
                ingestion.latestSyncRun
                  ? `抓取 ${ingestion.latestSyncRun.fetchedCount} / 新增 ${ingestion.latestSyncRun.createdCount} / 更新 ${ingestion.latestSyncRun.updatedCount}`
                  : "等待第一次刷新"
              }
            />
          </div>

          {ingestion.latestSyncRun ? (
            <p className="text-sm text-mutedText">{ingestion.latestSyncRun.message}</p>
          ) : (
            <p className="text-sm text-mutedText">点击“刷新岗位库”后，后台会重新同步腾讯校招岗位，并在入库时写入地区、岗位方向和招聘项目标签。</p>
          )}
        </CardContent>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2 xl:col-span-2">
            <Label>关键词搜索</Label>
            <Input value={filters.search} onChange={(event) => filters.setSearch(event.target.value)} placeholder="搜索岗位、公司、摘要或标签记忆" />
          </div>

          <div className="space-y-2">
            <Label>公司</Label>
            <Select value={filters.selectedCompany} onValueChange={filters.setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="全部公司" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">全部公司</SelectItem>
                {filters.companyOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>办公方式</Label>
            <Select value={filters.selectedWorkMode} onValueChange={(value) => filters.setSelectedWorkMode(value as JobWorkMode | "ALL")}>
              <SelectTrigger>
                <SelectValue placeholder="全部办公方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">全部办公方式</SelectItem>
                {Object.entries(workModeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>岗位类型</Label>
            <Select
              value={filters.selectedEmploymentType}
              onValueChange={(value) => filters.setSelectedEmploymentType(value as JobEmploymentType | "ALL")}
            >
              <SelectTrigger>
                <SelectValue placeholder="全部岗位类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">全部岗位类型</SelectItem>
                {Object.entries(employmentTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>地区类别</Label>
            <Select value={filters.selectedRegionTag} onValueChange={filters.setSelectedRegionTag}>
              <SelectTrigger>
                <SelectValue placeholder="全部地区类别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">全部地区类别</SelectItem>
                {filters.regionOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>岗位方向</Label>
            <Select value={filters.selectedRoleTag} onValueChange={filters.setSelectedRoleTag}>
              <SelectTrigger>
                <SelectValue placeholder="全部岗位方向" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">全部岗位方向</SelectItem>
                {filters.roleOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>招聘项目</Label>
            <Select value={filters.selectedProgramTag} onValueChange={filters.setSelectedProgramTag}>
              <SelectTrigger>
                <SelectValue placeholder="全部招聘项目" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">全部招聘项目</SelectItem>
                {filters.programOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>排序方式</Label>
            <Select value={filters.sortBy} onValueChange={(value) => filters.setSortBy(value as "relevance" | "latest" | "deadline")}>
              <SelectTrigger>
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">推荐优先</SelectItem>
                <SelectItem value="latest">最新发布</SelectItem>
                <SelectItem value="deadline">截止时间最近</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => filters.setSavedOnly(!filters.savedOnly)}
              className={`h-11 w-full rounded-2xl border px-4 text-sm font-medium transition-colors ${
                filters.savedOnly
                  ? "border-mint/20 bg-mint-soft text-mint-hover"
                  : "border-borderSoft bg-white/60 text-mutedText"
              }`}
            >
              只看已收藏
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>筛选结果</CardTitle>
            <CardDescription>当前命中 {jobs.length} 个岗位，可继续收藏或转成投递记录。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.length ? (
              jobs.map((job) => {
                const selected = selectedJob?.id === job.id;
                const applied = appliedJobIds.has(job.id);

                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => onSelectJob(job.id)}
                    className={`w-full rounded-3xl border p-4 text-left transition-all ${
                      selected
                        ? "border-primary/25 bg-primary-soft/65 shadow-card"
                        : "border-white/35 bg-white/40 hover:bg-white/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{job.title}</p>
                          {job.isSaved ? <span className="rounded-full bg-mint-soft px-2 py-1 text-xs text-mint-hover">已收藏</span> : null}
                          {applied ? <span className="rounded-full bg-primary-soft px-2 py-1 text-xs text-primary">已转投递</span> : null}
                        </div>
                        <p className="text-sm text-mutedText">
                          {job.companyName} · {job.location} · {workModeLabels[job.workMode]} · {employmentTypeLabels[job.employmentType]}
                        </p>
                        <p className="line-clamp-2 text-sm text-mutedText">{job.summary}</p>
                      </div>
                      <div className="shrink-0 text-right text-sm">
                        <p className="font-medium">{job.salaryRange || "薪资未披露"}</p>
                        <p className="mt-1 text-coral-hover">还剩 {getDaysUntil(job.deadlineAt)} 天</p>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-3xl border border-white/35 bg-white/40 p-8 text-center text-mutedText">
                当前筛选条件下没有岗位结果。
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>岗位详情</CardTitle>
            <CardDescription>查看结构化信息，并决定是收藏、编辑还是转入投递流程。</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedJob ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold">{selectedJob.title}</h3>
                    <p className="text-sm text-mutedText">
                      {selectedJob.companyName} · {selectedJob.location} · {workModeLabels[selectedJob.workMode]} · {employmentTypeLabels[selectedJob.employmentType]}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => onToggleSaved(selectedJob.id)}>
                      <Heart className={`mr-2 h-4 w-4 ${selectedJob.isSaved ? "fill-current text-mint-hover" : ""}`} />
                      {selectedJob.isSaved ? "取消收藏" : "收藏岗位"}
                    </Button>
                    <Button variant="outline" onClick={() => onEdit(selectedJob)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      编辑
                    </Button>
                    <Button onClick={() => onCreateApplication(selectedJob.id)} disabled={appliedJobIds.has(selectedJob.id)}>
                      <Send className="mr-2 h-4 w-4" />
                      {appliedJobIds.has(selectedJob.id) ? "已转为投递" : "转成投递记录"}
                    </Button>
                    <Button variant="ghost" className="hover:bg-coral-soft" onClick={() => onDelete(selectedJob.id)}>
                      <Trash2 className="mr-2 h-4 w-4 text-coral" />
                      删除
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <InfoCard label="发布时间" value={formatDate(selectedJob.postedAt)} />
                  <InfoCard label="截止时间" value={`${formatDate(selectedJob.deadlineAt)} · 还剩 ${getDaysUntil(selectedJob.deadlineAt)} 天`} tone="coral" />
                  <InfoCard label="开放时间" value={formatDate(selectedJob.openedAt)} />
                  <InfoCard label="薪资范围" value={selectedJob.salaryRange || "未披露"} />
                  <InfoCard label="信息来源" value={selectedJob.source} />
                  <InfoCard label="来源标签" value={selectedJob.sourceType} />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">标签记忆</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.normalizedTags.map((tag) => (
                      <span key={tag} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">岗位摘要</p>
                  <p className="rounded-3xl border border-white/35 bg-white/40 p-4 text-sm text-mutedText">{selectedJob.summary}</p>
                </div>

                {selectedJob.rawDescription ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">原始描述</p>
                    <p className="rounded-3xl border border-white/35 bg-white/40 p-4 text-sm leading-6 text-mutedText">{selectedJob.rawDescription}</p>
                  </div>
                ) : null}

                {selectedJob.notes ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">备注</p>
                    <p className="rounded-3xl border border-white/35 bg-white/40 p-4 text-sm text-mutedText">{selectedJob.notes}</p>
                  </div>
                ) : null}

                <a
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover hover:underline"
                  href={selectedJob.applyUrl}
                  target="_blank"
                >
                  打开原始申请页 <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/35 bg-white/40 p-8 text-center text-mutedText">
                请选择一个岗位查看详情。
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "coral" | "mint" }) {
  return (
    <div
      className={`rounded-3xl border p-4 ${
        tone === "coral"
          ? "border-coral/15 bg-coral-soft/50"
          : tone === "mint"
            ? "border-mint/15 bg-mint-soft/50"
            : "border-white/35 bg-white/40"
      }`}
    >
      <p className="text-sm text-mutedText">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
