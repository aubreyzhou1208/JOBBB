"use client";

import { PageIntro } from "@/components/layout/page-intro";
import { MasterProfileForm } from "@/components/resume/master-profile-form";
import { useMasterProfile } from "@/features/profile/use-master-profile";

export default function ResumePage() {
  const { profile, save, loaded } = useMasterProfile();

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="简历资料"
        title="把可复用的网申信息集中维护"
        description="这部分数据未来会直接服务浏览器插件自动填表、简历定制和统一资料管理，所以现在就按结构化方式来存。"
      />
      {loaded && <MasterProfileForm profile={profile} onSave={save} />}
    </div>
  );
}
