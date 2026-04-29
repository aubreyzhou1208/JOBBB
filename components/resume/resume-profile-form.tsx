"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResumeProfile } from "@/lib/types";

const profileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  school: z.string().min(1),
  major: z.string().min(1),
  degree: z.string().min(1),
  skills: z.string().min(1),
  projects: z.string().min(1),
  internships: z.string().min(1),
  updatedAt: z.string()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ResumeProfileForm({
  profile,
  onSave
}: {
  profile: ResumeProfile;
  onSave: (profile: ResumeProfile) => void;
}) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      ...profile,
      skills: profile.skills.join(", ")
    }
  });

  useEffect(() => {
    form.reset({
      ...profile,
      skills: profile.skills.join(", ")
    });
  }, [form, profile]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>简历资料</CardTitle>
        <CardDescription>这份结构化资料会直接服务后续的自动填表、插件联动和定制化生成。</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) =>
            onSave({
              ...profile,
              ...values,
              skills: values.skills.split(",").map((item) => item.trim()).filter(Boolean),
              updatedAt: new Date().toISOString()
            })
          )}
        >
          <div className="space-y-2">
            <Label htmlFor="fullName">姓名</Label>
            <Input id="fullName" {...form.register("fullName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" {...form.register("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">电话</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="degree">学历</Label>
            <Input id="degree" {...form.register("degree")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school">学校</Label>
            <Input id="school" {...form.register("school")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="major">专业</Label>
            <Input id="major" {...form.register("major")} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="skills">技能</Label>
            <Input id="skills" {...form.register("skills")} placeholder="React, TypeScript, SQL" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="projects">项目经历</Label>
            <Textarea id="projects" {...form.register("projects")} className="min-h-[140px]" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="internships">实习经历</Label>
            <Textarea id="internships" {...form.register("internships")} className="min-h-[140px]" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">保存资料</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
