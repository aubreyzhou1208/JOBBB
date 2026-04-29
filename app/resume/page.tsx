"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageIntro } from "@/components/layout/page-intro";
import { ResumeProfileForm } from "@/components/resume/resume-profile-form";
import { useResume } from "@/features/resume/use-resume";

export default function ResumePage() {
  const { resumeProfile, updateResumeProfile } = useResume();

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="简历资料"
        title="把可复用的网申信息集中维护"
        description="这部分数据未来会直接服务浏览器插件自动填表、简历定制和统一资料管理，所以现在就按结构化方式来存。"
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <ResumeProfileForm profile={resumeProfile} onSave={updateResumeProfile} />
        <Card>
          <CardHeader>
            <CardTitle>后续扩展入口</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>浏览器插件自动填表</p>
            <p>AI 简历定制入口</p>
            <p>源文档同步与解析结果</p>
            <p>按公司沉淀的网申回答片段</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
