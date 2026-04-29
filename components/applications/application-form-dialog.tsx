"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applicationStatuses, Application } from "@/lib/types";
import { getStatusLabel } from "@/lib/utils";

const applicationSchema = z.object({
  jobPostingId: z.string().optional(),
  companyId: z.string().optional(),
  companyName: z.string().min(1, "请输入公司名称"),
  roleTitle: z.string().min(1, "请输入岗位名称"),
  appliedAt: z.string().min(1, "请选择投递时间"),
  status: z.enum(applicationStatuses),
  trackingUrl: z.string().optional().or(z.literal("")),
  notes: z.string().optional()
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export function ApplicationFormDialog({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  mode
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: Omit<Application, "id">;
  onSubmit: (values: Omit<Application, "id">) => void;
  mode: "create" | "edit";
}) {
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: initialValues
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "新增投递记录" : "编辑投递记录"}</DialogTitle>
          <DialogDescription>表单字段已经按未来 API / 数据库结构收敛，后续可平滑替换到后端。</DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => {
            onSubmit(values);
            onOpenChange(false);
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="companyName">公司</Label>
            <Input id="companyName" {...form.register("companyName")} />
            <p className="text-xs text-rose-600">{form.formState.errors.companyName?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleTitle">岗位</Label>
            <Input id="roleTitle" {...form.register("roleTitle")} />
            <p className="text-xs text-rose-600">{form.formState.errors.roleTitle?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appliedAt">投递时间</Label>
            <Input id="appliedAt" type="date" {...form.register("appliedAt")} />
          </div>

          <div className="space-y-2">
            <Label>当前状态</Label>
            <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as ApplicationFormValues["status"])}>
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                {applicationStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="trackingUrl">进度查询链接</Label>
            <Input id="trackingUrl" {...form.register("trackingUrl")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea id="notes" {...form.register("notes")} />
          </div>

          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">{mode === "create" ? "创建记录" : "保存修改"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
