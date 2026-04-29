"use client";

import { useState } from "react";
import { Download, PlusCircle } from "lucide-react";

import { ApplicationFormDialog } from "@/components/applications/application-form-dialog";
import { ApplicationTable } from "@/components/applications/application-table";
import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getApplicationInitialValues, useApplications } from "@/features/applications/use-applications";
import { applicationStatuses, Application } from "@/lib/types";
import { getStatusLabel } from "@/lib/utils";

export default function ApplicationsPage() {
  const {
    filteredApplications,
    search,
    setSearch,
    status,
    setStatus,
    addApplication,
    updateApplication,
    deleteApplication,
    exportApplicationsCsv
  } = useApplications();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="投递记录"
        title="把每一次投递都记录清楚"
        description="支持按状态筛选、按公司或岗位搜索，并保留进度查询链接和备注，方便后续迁移到正式后端。"
      />

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索公司或岗位"
              className="md:max-w-sm"
            />
            <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
              <SelectTrigger className="md:max-w-[220px]">
                <SelectValue placeholder="按状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">全部状态</SelectItem>
                {applicationStatuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {getStatusLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportApplicationsCsv}>
              <Download className="mr-2 h-4 w-4" />
              导出 CSV
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              新增投递
            </Button>
          </div>
        </CardContent>
      </Card>

      <ApplicationTable
        data={filteredApplications}
        onEdit={(application) => {
          setEditing(application);
          setDialogOpen(true);
        }}
        onDelete={deleteApplication}
      />

      <ApplicationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialValues={getApplicationInitialValues(editing ?? undefined)}
        mode={editing ? "edit" : "create"}
        onSubmit={(values) => {
          if (editing) {
            updateApplication(editing.id, values);
            return;
          }

          addApplication(values);
        }}
      />
    </div>
  );
}
