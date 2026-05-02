"use client";

import { useCallback, useRef, useState } from "react";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MasterProfile, EMPTY_PROFILE } from "@/features/profile/types";

// ─── Section helpers ──────────────────────────────────────────────────────────

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-foreground/80 border-b border-white/10 pb-1 mb-3">{children}</h3>;
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1">
      + {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="text-xs text-rose-400 hover:text-rose-300 absolute top-2 right-2">
      ✕
    </button>
  );
}

// ─── Tab sections ─────────────────────────────────────────────────────────────

function BasicSection({ form }: { form: UseFormReturn<MasterProfile> }) {
  const { register } = form;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="姓名"><Input {...register("fullName")} placeholder="张三" /></Field>
      <Field label="英文名"><Input {...register("fullNameEn")} placeholder="San Zhang" /></Field>
      <Field label="邮箱"><Input {...register("email")} placeholder="san@example.com" /></Field>
      <Field label="电话"><Input {...register("phone")} placeholder="+86 138..." /></Field>
      <Field label="微信号"><Input {...register("wechat")} placeholder="wechat_id" /></Field>
      <Field label="LinkedIn"><Input {...register("linkedin")} placeholder="linkedin.com/in/..." /></Field>
      <Field label="GitHub"><Input {...register("github")} placeholder="github.com/..." /></Field>
      <Field label="籍贯"><Input {...register("hometown")} placeholder="上海" /></Field>
    </div>
  );
}

function EducationSection({ form }: { form: UseFormReturn<MasterProfile> }) {
  const { register, control } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "education" });

  return (
    <div className="space-y-4">
      {fields.map((field, i) => (
        <div key={field.id} className="relative rounded-2xl border border-white/10 bg-white/5 p-4 grid gap-3 sm:grid-cols-2">
          <RemoveButton onClick={() => remove(i)} />
          <Field label="学校" className="sm:col-span-2"><Input {...register(`education.${i}.school`)} placeholder="复旦大学" /></Field>
          <Field label="专业"><Input {...register(`education.${i}.major`)} placeholder="金融学" /></Field>
          <Field label="学历">
            <select {...register(`education.${i}.degree`)}
              className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm">
              {["本科","硕士","博士","MBA","MFin","MFE"].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="毕业年份"><Input {...register(`education.${i}.graduationYear`)} placeholder="2026" /></Field>
          <Field label="GPA"><Input {...register(`education.${i}.gpa`)} placeholder="3.85" /></Field>
          <Field label="满分"><Input {...register(`education.${i}.gpaTotal`)} placeholder="4.0" /></Field>
          <Field label="专业排名"><Input {...register(`education.${i}.rank`)} placeholder="3/120" /></Field>
          <Field label="主要课程" className="sm:col-span-2">
            <Input {...register(`education.${i}.courses`)} placeholder="公司金融、衍生品、计量经济学" />
          </Field>
        </div>
      ))}
      <AddButton onClick={() => append({ school:"", major:"", degree:"本科", graduationYear:"" })} label="添加学校" />
    </div>
  );
}

function ExperienceSection({ form }: { form: UseFormReturn<MasterProfile> }) {
  const { register, control } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "internships" });

  return (
    <div className="space-y-4">
      {fields.map((field, i) => (
        <div key={field.id} className="relative rounded-2xl border border-white/10 bg-white/5 p-4 grid gap-3 sm:grid-cols-2">
          <RemoveButton onClick={() => remove(i)} />
          <Field label="公司"><Input {...register(`internships.${i}.company`)} placeholder="高盛" /></Field>
          <Field label="职位"><Input {...register(`internships.${i}.role`)} placeholder="投行实习生" /></Field>
          <Field label="开始时间"><Input {...register(`internships.${i}.startDate`)} placeholder="2024-06" /></Field>
          <Field label="结束时间"><Input {...register(`internships.${i}.endDate`)} placeholder="2024-09 或 至今" /></Field>
          <Field label="城市"><Input {...register(`internships.${i}.location`)} placeholder="上海" /></Field>
          <Field label="工作内容" className="sm:col-span-2">
            <Textarea {...register(`internships.${i}.description`)} className="min-h-[90px]"
              placeholder="负责 IPO 尽调、财务建模、行业研究..." />
          </Field>
        </div>
      ))}
      <AddButton onClick={() => append({ company:"", role:"", startDate:"", endDate:"", description:"" })} label="添加经历" />
    </div>
  );
}

function SkillsSection({ form }: { form: UseFormReturn<MasterProfile> }) {
  const { register, control, watch, setValue } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "certifications" });
  const skillsRaw = watch("skills") as unknown as string;

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>专业技能</SectionTitle>
        <Field label="技能（逗号分隔）">
          <Input
            value={Array.isArray(skillsRaw) ? skillsRaw.join(", ") : skillsRaw}
            onChange={e => setValue("skills", e.target.value.split(",").map(s => s.trim()).filter(Boolean) as unknown as string[])}
            placeholder="Python, Excel, Bloomberg, SQL, PowerPoint"
          />
        </Field>
      </div>

      <div>
        <SectionTitle>语言考试成绩</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          {[["toefl","托福"],["ielts","雅思"],["gre","GRE"],["gmat","GMAT"],["cet4","四级"],["cet6","六级"]].map(([k,l]) => (
            <Field key={k} label={l}><Input {...register(k as keyof MasterProfile)} placeholder="分数" /></Field>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>资格证书</SectionTitle>
        {fields.map((field, i) => (
          <div key={field.id} className="relative rounded-2xl border border-white/10 bg-white/5 p-3 grid gap-2 sm:grid-cols-3 mb-2">
            <RemoveButton onClick={() => remove(i)} />
            <Field label="证书名"><Input {...register(`certifications.${i}.name`)} placeholder="CFA Level 1" /></Field>
            <Field label="成绩"><Input {...register(`certifications.${i}.score`)} placeholder="通过" /></Field>
            <Field label="获得时间"><Input {...register(`certifications.${i}.date`)} placeholder="2025-06" /></Field>
          </div>
        ))}
        <AddButton onClick={() => append({ name:"", score:"", date:"" })} label="添加证书" />
      </div>
    </div>
  );
}

function AwardsSection({ form }: { form: UseFormReturn<MasterProfile> }) {
  const { register, control } = form;
  const { fields: awards, append: addAward, remove: rmAward } = useFieldArray({ control, name: "awards" });
  const { fields: pubs, append: addPub, remove: rmPub } = useFieldArray({ control, name: "publications" });
  const { fields: acts, append: addAct, remove: rmAct } = useFieldArray({ control, name: "activities" });

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>荣誉奖项</SectionTitle>
        {awards.map((f, i) => (
          <div key={f.id} className="relative rounded-2xl border border-white/10 bg-white/5 p-3 grid gap-2 sm:grid-cols-2 mb-2">
            <RemoveButton onClick={() => rmAward(i)} />
            <Field label="奖项名称" className="sm:col-span-2"><Input {...register(`awards.${i}.name`)} placeholder="国家奖学金" /></Field>
            <Field label="颁发机构"><Input {...register(`awards.${i}.issuer`)} placeholder="教育部" /></Field>
            <Field label="获奖时间"><Input {...register(`awards.${i}.date`)} placeholder="2024-10" /></Field>
            <Field label="备注" className="sm:col-span-2"><Input {...register(`awards.${i}.description`)} placeholder="全校前1%" /></Field>
          </div>
        ))}
        <AddButton onClick={() => addAward({ name:"" })} label="添加奖项" />
      </div>

      <div>
        <SectionTitle>科研 / 论文</SectionTitle>
        {pubs.map((f, i) => (
          <div key={f.id} className="relative rounded-2xl border border-white/10 bg-white/5 p-3 grid gap-2 sm:grid-cols-2 mb-2">
            <RemoveButton onClick={() => rmPub(i)} />
            <Field label="论文题目" className="sm:col-span-2"><Input {...register(`publications.${i}.title`)} placeholder="基于机器学习的A股收益率预测" /></Field>
            <Field label="期刊/会议"><Input {...register(`publications.${i}.journal`)} placeholder="中国金融评论" /></Field>
            <Field label="发表时间"><Input {...register(`publications.${i}.date`)} placeholder="2025-03" /></Field>
            <Field label="摘要" className="sm:col-span-2">
              <Textarea {...register(`publications.${i}.description`)} className="min-h-[60px]" />
            </Field>
          </div>
        ))}
        <AddButton onClick={() => addPub({ title:"" })} label="添加论文" />
      </div>

      <div>
        <SectionTitle>课外活动 / 志愿者</SectionTitle>
        {acts.map((f, i) => (
          <div key={f.id} className="relative rounded-2xl border border-white/10 bg-white/5 p-3 grid gap-2 sm:grid-cols-2 mb-2">
            <RemoveButton onClick={() => rmAct(i)} />
            <Field label="组织名称"><Input {...register(`activities.${i}.organization`)} placeholder="投资协会" /></Field>
            <Field label="职位"><Input {...register(`activities.${i}.role`)} placeholder="副会长" /></Field>
            <Field label="开始时间"><Input {...register(`activities.${i}.startDate`)} placeholder="2023-09" /></Field>
            <Field label="结束时间"><Input {...register(`activities.${i}.endDate`)} placeholder="2024-06" /></Field>
            <Field label="内容" className="sm:col-span-2">
              <Textarea {...register(`activities.${i}.description`)} className="min-h-[60px]"
                placeholder="组织了15场行业讲座，累计参与300人次..." />
            </Field>
          </div>
        ))}
        <AddButton onClick={() => addAct({ organization:"", role:"", description:"" })} label="添加活动" />
      </div>
    </div>
  );
}

function SelfSection({ form }: { form: UseFormReturn<MasterProfile> }) {
  const { register } = form;
  return (
    <div className="space-y-4">
      <Field label="中文自我介绍（100-300字）">
        <Textarea {...register("selfIntro")} className="min-h-[120px]"
          placeholder="本人就读于…，主修…，曾在…实习，擅长…" />
      </Field>
      <Field label="English Self Introduction">
        <Textarea {...register("selfIntroEn")} className="min-h-[120px]"
          placeholder="I am a final-year student at... majoring in..." />
      </Field>
      <Field label="兴趣爱好">
        <Input {...register("hobbies")} placeholder="阅读、羽毛球、编程、摄影" />
      </Field>
      <Field label="个人优势 / 特质">
        <Textarea {...register("strengths")} className="min-h-[80px]"
          placeholder="逻辑思维强、善于跨团队沟通、快速学习..." />
      </Field>
      <Field label="为什么选择金融 / 投行">
        <Textarea {...register("whyFinance")} className="min-h-[90px]" />
      </Field>
      <Field label="为什么选择咨询">
        <Textarea {...register("whyConsulting")} className="min-h-[90px]" />
      </Field>
      <Field label="期望薪资">
        <Input {...register("expectedSalary")} placeholder="面议 / 1.5万/月" />
      </Field>
      <Field label="最早入职时间">
        <Input {...register("earliestStart")} placeholder="2026-07-01" />
      </Field>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MasterProfileForm({ profile, onSave }: { profile: MasterProfile; onSave: (p: MasterProfile) => void }) {
  const form = useForm<MasterProfile>({ defaultValues: profile });
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [parseMsg, setParseMsg] = useState("");

  // Reset form when profile loads from localStorage
  const [synced, setSynced] = useState(false);
  if (!synced && profile.fullName !== form.getValues("fullName")) {
    form.reset(profile);
    setSynced(true);
  }

  const handleParsePdf = useCallback(async (file: File) => {
    setParsing(true);
    setParseMsg("AI 解析中…");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/parse-pdf", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.profile) { setParseMsg("解析失败：" + (data.error || "未知错误")); return; }
      const p = data.profile;
      // Merge parsed data into form, keeping existing non-empty values
      Object.entries(p).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") {
          form.setValue(k as keyof MasterProfile, v as MasterProfile[keyof MasterProfile]);
        }
      });
      setParseMsg("✓ 解析完成，请检查并补充后保存");
    } catch {
      setParseMsg("网络错误");
    } finally {
      setParsing(false);
    }
  }, [form]);

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
      {/* PDF Upload Banner */}
      <div className="rounded-2xl border border-dashed border-white/25 bg-white/5 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">上传简历 PDF，AI 自动填写</p>
          <p className="text-xs text-muted-foreground mt-0.5">解析后只需补充简历上没有的字段（奖项、爱好等）</p>
          {parseMsg && <p className="text-xs text-blue-400 mt-1">{parseMsg}</p>}
        </div>
        <input ref={fileRef} type="file" accept=".pdf" className="hidden"
          onChange={e => e.target.files?.[0] && handleParsePdf(e.target.files[0])} />
        <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()} disabled={parsing}>
          {parsing ? "解析中…" : "📄 上传简历"}
        </Button>
      </div>

      {/* Tab sections */}
      <Tabs defaultValue="basic">
        <TabsList className="w-full flex-wrap h-auto gap-1">
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="education">教育背景</TabsTrigger>
          <TabsTrigger value="experience">实习经历</TabsTrigger>
          <TabsTrigger value="skills">技能证书</TabsTrigger>
          <TabsTrigger value="awards">奖项活动</TabsTrigger>
          <TabsTrigger value="self">自我描述</TabsTrigger>
        </TabsList>

        <Card className="mt-3">
          <CardContent className="pt-5">
            <TabsContent value="basic"><BasicSection form={form} /></TabsContent>
            <TabsContent value="education"><EducationSection form={form} /></TabsContent>
            <TabsContent value="experience"><ExperienceSection form={form} /></TabsContent>
            <TabsContent value="skills"><SkillsSection form={form} /></TabsContent>
            <TabsContent value="awards"><AwardsSection form={form} /></TabsContent>
            <TabsContent value="self"><SelfSection form={form} /></TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit">保存档案</Button>
      </div>
    </form>
  );
}
