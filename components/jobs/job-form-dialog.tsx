"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JobEmploymentType, JobPosting, JobPostingInput, JobWorkMode } from "@/lib/types";

const jobSchema = z.object({
  companyId: z.string(),
  companyName: z.string().min(1, "请输入公司名称"),
  title: z.string().min(1, "请输入岗位名称"),
  location: z.string().min(1, "请输入地点"),
  workMode: z.enum(["REMOTE", "HYBRID", "ONSITE"]),
  employmentType: z.enum(["FULL_TIME", "INTERN", "NEW_GRAD", "CONTRACT"]),
  salaryRange: z.string().optional(),
  tags: z.string().min(1, "至少填写一个标签"),
  postedAt: z.string().min(1, "请选择发布时间"),
  openedAt: z.string().min(1, "请选择开放时间"),
  deadlineAt: z.string().min(1, "请选择截止时间"),
  applyUrl: z.string().url("请输入有效链接"),
  source: z.string().min(1, "请输入信息来源"),
  sourceJobId: z.string().optional(),
  sourceType: z.string().min(1, "请输入来源类型"),
  isSaved: z.boolean(),
  summary: z.string().min(1, "请输入岗位摘要"),
  rawDescription: z.string().optional(),
  notes: z.string().optional()
});

type JobFormValues = z.infer<typeof jobSchema>;

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

export function JobFormDialog({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  mode
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: Omit<JobPosting, "id">;
  onSubmit: (values: JobPostingInput) => void;
  mode: "create" | "edit";
}) {
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      ...initialValues,
      tags: initialValues.tags.join(", ")
    } as unknown as JobFormValues
  });

  useEffect(() => {
    form.reset({
      ...initialValues,
      tags: initialValues.tags.join(", ")
    } as unknown as JobFormValues);
  }, [form, initialValues]);

  const [parseUrl, setParseUrl] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  async function handleParse() {
    if (!parseUrl.trim()) return;
    setParsing(true);
    setParseError("");
    try {
      const res = await fetch("/api/jobs/parse-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: parseUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.job) {
        setParseError(data.error || "解析失败，请手动填写");
        return;
      }
      const j = data.job;
      const today = new Date().toISOString().slice(0, 10);
      form.setValue("companyName", j.companyName || "");
      form.setValue("title", j.title || "");
      form.setValue("location", j.location || "");
      form.setValue("employmentType", j.employmentType || "FULL_TIME");
      form.setValue("workMode", j.workMode || "ONSITE");
      form.setValue("applyUrl", j.applyUrl || parseUrl);
      form.setValue("source", new URL(parseUrl).hostname.replace("www.", ""));
      form.setValue("sourceType", "manual_url");
      form.setValue("summary", j.summary || "");
      form.setValue("rawDescription", j.rawDescription || "");
      form.setValue("salaryRange", j.salaryRange || "");
      form.setValue("postedAt", today);
      form.setValue("openedAt", today);
      if (j.deadlineAt) form.setValue("deadlineAt", j.deadlineAt);
      // Auto-generate tags from company + type
      const typeTag = j.employmentType === "INTERN" ? "实习" : j.employmentType === "NEW_GRAD" ? "校招" : "全职";
      form.setValue("tags", [j.companyName, typeTag].filter(Boolean).join(", "));
    } catch {
      setParseError("网络错误，请手动填写");
    } finally {
      setParsing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "新增岗位" : "编辑岗位"}</DialogTitle>
        </DialogHeader>

        {/* URL 解析区域 */}
        {mode === "create" && (
          <div className="rounded-2xl border border-dashed border-white/30 bg-white/10 p-4 space-y-2">
            <p className="text-xs text-muted-foreground">粘贴招聘链接，AI 自动填写所有字段</p>
            <div className="flex gap-2">
              <Input
                placeholder="https://jobs.bytedance.com/..."
                value={parseUrl}
                onChange={(e) => setParseUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleParse()}
                className="flex-1 text-sm"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleParse}
                disabled={parsing || !parseUrl.trim()}
                className="shrink-0"
              >
                {parsing ? "解析中…" : "✨ 解析"}
              </Button>
            </div>
            {parseError && <p className="text-xs text-rose-500">{parseError}</p>}
          </div>
        )}

        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => {
            onSubmit({
              ...values,
              companyId: values.companyId ?? "",
              tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
              isSaved: initialValues.isSaved
            });
            onOpenChange(false);
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="companyName">公司</Label>
            <Input id="companyName" {...form.register("companyName")} />
            <p className="text-xs text-rose-600">{form.formState.errors.companyName?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">岗位名称</Label>
            <Input id="title" {...form.register("title")} />
            <p className="text-xs text-rose-600">{form.formState.errors.title?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">地点</Label>
            <Input id="location" {...form.register("location")} />
          </div>

          <div className="space-y-2">
            <Label>岗位类型</Label>
            <Select
              value={form.watch("employmentType")}
              onValueChange={(v) => form.setValue("employmentType", v as JobEmploymentType)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(employmentTypeLabels).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>办公方式</Label>
            <Select
              value={form.watch("workMode")}
              onValueChange={(v) => form.setValue("workMode", v as JobWorkMode)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(workModeLabels).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salaryRange">薪资范围</Label>
            <Input id="salaryRange" {...form.register("salaryRange")} placeholder="如 200元/天" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadlineAt">截止时间</Label>
            <Input id="deadlineAt" type="date" {...form.register("deadlineAt")} />
            <p className="text-xs text-rose-600">{form.formState.errors.deadlineAt?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="postedAt">发布时间</Label>
            <Input id="postedAt" type="date" {...form.register("postedAt")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="applyUrl">申请链接</Label>
            <Input id="applyUrl" {...form.register("applyUrl")} />
            <p className="text-xs text-rose-600">{form.formState.errors.applyUrl?.message}</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tags">标签</Label>
            <Input id="tags" {...form.register("tags")} placeholder="字节跳动, 实习, 产品" />
            <p className="text-xs text-rose-600">{form.formState.errors.tags?.message}</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="summary">岗位摘要</Label>
            <Textarea id="summary" {...form.register("summary")} className="min-h-[100px]" />
            <p className="text-xs text-rose-600">{form.formState.errors.summary?.message}</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="rawDescription">完整描述</Label>
            <Textarea id="rawDescription" {...form.register("rawDescription")} className="min-h-[120px]" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea id="notes" {...form.register("notes")} placeholder="面试准备、内推人、注意事项…" />
          </div>

          {/* Hidden fields */}
          <input type="hidden" {...form.register("source")} />
          <input type="hidden" {...form.register("sourceType")} />
          <input type="hidden" {...form.register("sourceJobId")} />
          <input type="hidden" {...form.register("openedAt")} />

          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="submit">{mode === "create" ? "添加岗位" : "保存修改"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
