"use client";

import { DatabaseZap, Download, PlugZap, Upload } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { useAppState } from "@/components/providers/app-state-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadCsv } from "@/lib/utils";

export default function SettingsPage() {
  const { state } = useAppState();

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="设置"
        title="把数据导入导出和后续集成入口放在一起"
        description="第一版先保留必要设置，但结构已经对齐未来 SaaS 版本的账户配置、数据迁移和插件控制区。"
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>基础资料</CardTitle>
            <CardDescription>先保留基础用户信息，后面可以自然扩展成账户级设置。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>姓名：{state.user.name}</p>
            <p>邮箱：{state.user.email}</p>
            <p>时区：{state.user.timezone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>数据迁移</CardTitle>
            <CardDescription>先支持导出，后面再替换成正式的 API 导入导出能力。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() =>
                downloadCsv(
                  "job-tracker-backup.csv",
                  state.applications.map((item) => ({
                    company: item.companyName,
                    role: item.roleTitle,
                    status: item.status,
                    appliedAt: item.appliedAt
                  }))
                )
              }
            >
              <Download className="mr-2 h-4 w-4" />
              导出投递备份
            </Button>
            <Button className="w-full justify-start" variant="outline" disabled>
              <Upload className="mr-2 h-4 w-4" />
              导入数据
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>预留入口</CardTitle>
            <CardDescription>给后续插件、数据库和更多系统能力预留位置。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" disabled>
              <PlugZap className="mr-2 h-4 w-4" />
              浏览器插件设置
            </Button>
            <Button className="w-full justify-start" variant="outline" disabled>
              <DatabaseZap className="mr-2 h-4 w-4" />
              数据库连接设置
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
