export interface Education {
  school: string;
  major: string;
  degree: string;
  graduationYear: string;
  gpa?: string;
  gpaTotal?: string;
  rank?: string;       // e.g. "3/120"
  courses?: string;    // notable courses
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;     // or "至今"
  location?: string;
  description: string;
}

export interface Award {
  name: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface Publication {
  title: string;
  journal?: string;
  date?: string;
  description?: string;
}

export interface Activity {
  organization: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Certification {
  name: string;        // e.g. "CFA Level 1", "托福"
  score?: string;
  date?: string;
}

export interface MasterProfile {
  // ── 基本信息 ─────────────────────────────────
  fullName: string;
  fullNameEn?: string;
  email: string;
  phone: string;
  wechat?: string;
  linkedin?: string;
  github?: string;
  hometown?: string;

  // ── 教育背景 ─────────────────────────────────
  education: Education[];

  // ── 语言考试 ─────────────────────────────────
  toefl?: string;
  ielts?: string;
  gre?: string;
  gmat?: string;
  cet4?: string;
  cet6?: string;

  // ── 实习/工作经历 ─────────────────────────────
  internships: Experience[];

  // ── 技能 ─────────────────────────────────────
  skills: string[];          // ["Python", "Excel", "SQL"]
  certifications: Certification[];

  // ── 荣誉奖项 ─────────────────────────────────
  awards: Award[];

  // ── 科研/论文 ─────────────────────────────────
  publications: Publication[];

  // ── 课外活动/志愿者 ───────────────────────────
  activities: Activity[];

  // ── 自我描述 ─────────────────────────────────
  selfIntro?: string;        // 中文自我介绍（100-300字）
  selfIntroEn?: string;      // English version
  hobbies?: string;          // 兴趣爱好
  strengths?: string;        // 优势/个人特质
  whyFinance?: string;       // 为什么选择金融
  whyConsulting?: string;    // 为什么选择咨询

  // ── 求职偏好 ─────────────────────────────────
  expectedSalary?: string;
  earliestStart?: string;    // e.g. "2026-07-01"
  willingToRelocate?: boolean;

  updatedAt: string;
}

export const EMPTY_PROFILE: MasterProfile = {
  fullName: "",
  email: "",
  phone: "",
  education: [{ school: "", major: "", degree: "本科", graduationYear: "" }],
  internships: [],
  skills: [],
  certifications: [],
  awards: [],
  publications: [],
  activities: [],
  updatedAt: new Date().toISOString(),
};
