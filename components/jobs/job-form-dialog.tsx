"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "新增岗位" : "编辑岗位"}</DialogTitle>
          <DialogDescription>这里的字段会作为未来 OCR / AI 解析结果的标准落库结构。</DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => {
          onSubmit({
              ...values,
              companyId: values.companyId ?? "",
              tags: values.tags.split(",").map((item) => item.trim()).filter(Boolean),
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
            <Label htmlFor="source">信息来源</Label>
            <Input id="source" {...form.register("source")} />
          </div>

          <div className="space-y-2">
            <Label>办公方式</Label>
            <Select value={form.watch("workMode")} onValueChange={(value) => form.setValue("workMode", value as JobWorkMode)}>
              <SelectTrigger>
                <SelectValue placeholder="选择办公方式" />
              </SelectTrigger>
              <SelectContent>
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
              value={form.watch("employmentType")}
              onValueChange={(value) => form.setValue("employmentType", value as JobEmploymentType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择岗位类型" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(employmentTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salaryRange">薪资范围</Label>
            <Input id="salaryRange" {...form.register("salaryRange")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postedAt">发布时间</Label>
            <Input id="postedAt" type="date" {...form.register("postedAt")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="openedAt">开放时间</Label>
            <Input id="openedAt" type="date" {...form.register("openedAt")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadlineAt">截止时间</Label>
            <Input id="deadlineAt" type="date" {...form.register("deadlineAt")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="applyUrl">申请链接</Label>
            <Input id="applyUrl" {...form.register("applyUrl")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tags">标签</Label>
            <Input id="tags" {...form.register("tags")} placeholder="React, Frontend, New Grad" />
            <p className="text-xs text-rose-600">{form.formState.errors.tags?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceType">来源类型</Label>
            <Input id="sourceType" {...form.register("sourceType")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceJobId">来源岗位 ID</Label>
            <Input id="sourceJobId" {...form.register("sourceJobId")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="summary">岗位摘要</Label>
            <Textarea id="summary" {...form.register("summary")} className="min-h-[110px]" />
            <p className="text-xs text-rose-600">{form.formState.errors.summary?.message}</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="rawDescription">原始描述</Label>
            <Textarea id="rawDescription" {...form.register("rawDescription")} className="min-h-[140px]" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea id="notes" {...form.register("notes")} />
          </div>

          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">{mode === "create" ? "创建岗位" : "保存修改"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
