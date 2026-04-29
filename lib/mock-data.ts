import { normalizeJobPosting } from "@/features/jobs/job-tagging";
import { AppState } from "@/lib/types";

export const mockAppState: AppState = {
  user: {
    id: "user_1",
    name: "Zhou Mingxuan",
    email: "mingxuan@example.com",
    timezone: "America/New_York",
    createdAt: "2026-04-01T09:00:00.000Z"
  },
  resumeProfile: {
    id: "resume_1",
    userId: "user_1",
    fullName: "Zhou Mingxuan",
    email: "mingxuan@example.com",
    phone: "+1 (917) 555-0123",
    school: "Northeastern University",
    major: "Computer Science",
    degree: "Master",
    skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Python"],
    projects:
      "Built a full-stack creator royalty portal with CSV exports, Supabase sync, and AI-assisted extraction workflows.",
    internships:
      "Software Engineer Intern at a fintech startup, focusing on internal dashboards, ETL reliability, and product analytics.",
    updatedAt: "2026-04-26T16:30:00.000Z"
  },
  companies: [
    { id: "company_1", name: "Vercel", website: "https://vercel.com", industry: "Developer Tools", location: "New York, NY" },
    { id: "company_2", name: "Linear", website: "https://linear.app", industry: "SaaS", location: "Remote" },
    { id: "company_3", name: "Notion", website: "https://notion.so", industry: "Productivity", location: "San Francisco, CA" },
    { id: "company_4", name: "Stripe", website: "https://stripe.com", industry: "Fintech", location: "South San Francisco, CA" }
  ],
  jobPostings: [
    normalizeJobPosting({
      id: "job_1",
      companyId: "company_1",
      companyName: "Vercel",
      title: "Frontend Engineer",
      location: "New York, NY",
      workMode: "HYBRID",
      employmentType: "FULL_TIME",
      salaryRange: "$170k - $210k",
      tags: ["Next.js", "TypeScript", "Design Systems", "Product UI"],
      postedAt: "2026-04-09",
      openedAt: "2026-04-10",
      deadlineAt: "2026-05-04",
      applyUrl: "https://vercel.com/careers/frontend-engineer",
      source: "Official Career Page",
      sourceType: "官方渠道",
      sourceJobId: "vercel-frontend-engineer-001",
      isSaved: true,
      summary: "偏产品感的前端岗位，强调 React / Next.js、设计协作和高质量交付。",
      rawDescription:
        "Build product surfaces for developers, collaborate with design, own quality across responsive UI, and help shape the future of the Vercel dashboard.",
      notes: "High-priority role with strong product fit."
    }),
    normalizeJobPosting({
      id: "job_2",
      companyId: "company_2",
      companyName: "Linear",
      title: "Product Engineer",
      location: "Remote",
      workMode: "REMOTE",
      employmentType: "FULL_TIME",
      salaryRange: "$180k - $230k",
      tags: ["React", "Product Thinking", "Performance", "UX"],
      postedAt: "2026-04-14",
      openedAt: "2026-04-15",
      deadlineAt: "2026-05-01",
      applyUrl: "https://linear.app/careers/product-engineer",
      source: "LinkedIn",
      sourceType: "聚合平台",
      sourceJobId: "linear-product-engineer-042",
      isSaved: false,
      summary: "偏强产品工程导向，适合喜欢打磨交互、性能和用户体验的候选人。",
      rawDescription:
        "Own high-impact product areas end to end, build polished interfaces, and collaborate closely with design and product in a small high-leverage team."
    }),
    normalizeJobPosting({
      id: "job_3",
      companyId: "company_3",
      companyName: "Notion",
      title: "Software Engineer, Growth",
      location: "San Francisco, CA",
      workMode: "ONSITE",
      employmentType: "FULL_TIME",
      salaryRange: "$185k - $240k",
      tags: ["Growth", "Experimentation", "Data", "Frontend"],
      postedAt: "2026-04-04",
      openedAt: "2026-04-05",
      deadlineAt: "2026-05-12",
      applyUrl: "https://notion.so/careers/growth-engineer",
      source: "Referral",
      sourceType: "内推",
      sourceJobId: "notion-growth-318",
      isSaved: true,
      summary: "更偏增长和实验平台，适合兼顾工程实现与数据意识的候选人。",
      rawDescription:
        "Ship growth-facing product experiments, collaborate across growth and product, and use data to guide iteration on activation and retention surfaces."
    }),
    normalizeJobPosting({
      id: "job_4",
      companyId: "company_4",
      companyName: "Stripe",
      title: "Frontend Engineer, Dashboard",
      location: "Seattle, WA",
      workMode: "HYBRID",
      employmentType: "FULL_TIME",
      salaryRange: "$190k - $250k",
      tags: ["Dashboard", "Fintech", "React", "Systems UI"],
      postedAt: "2026-04-17",
      openedAt: "2026-04-18",
      deadlineAt: "2026-05-08",
      applyUrl: "https://stripe.com/jobs/frontend-dashboard",
      source: "Official Career Page",
      sourceType: "官方渠道",
      sourceJobId: "stripe-dashboard-778",
      isSaved: false,
      summary: "大规模业务后台场景，强调系统性、数据密度和复杂交互的可用性。",
      rawDescription:
        "Build dashboard experiences for business users, work with complex data workflows, and maintain high standards for consistency, accessibility, and scale."
    }),
    normalizeJobPosting({
      id: "job_5",
      companyId: "company_1",
      companyName: "Vercel",
      title: "New Grad Software Engineer",
      location: "Remote",
      workMode: "REMOTE",
      employmentType: "NEW_GRAD",
      salaryRange: "$140k - $165k",
      tags: ["New Grad", "Fullstack", "Developer Tools"],
      postedAt: "2026-04-20",
      openedAt: "2026-04-20",
      deadlineAt: "2026-05-20",
      applyUrl: "https://vercel.com/careers/new-grad-software-engineer",
      source: "University Career Center",
      sourceType: "校园渠道",
      sourceJobId: "vercel-ng-014",
      isSaved: true,
      summary: "校招向岗位，适合作为主投递池的基础盘。",
      rawDescription:
        "Join an engineering team working on developer tools and product infrastructure, with broad exposure across frontend and platform surfaces."
    }),
    normalizeJobPosting({
      id: "job_6",
      companyId: "company_2",
      companyName: "Linear",
      title: "Frontend Engineering Intern",
      location: "Remote",
      workMode: "REMOTE",
      employmentType: "INTERN",
      salaryRange: "$55/hr - $70/hr",
      tags: ["Intern", "React", "Craft", "Design Collaboration"],
      postedAt: "2026-04-21",
      openedAt: "2026-04-22",
      deadlineAt: "2026-05-14",
      applyUrl: "https://linear.app/careers/frontend-intern",
      source: "Official Career Page",
      sourceType: "官方渠道",
      sourceJobId: "linear-intern-2026",
      isSaved: false,
      summary: "实习向，强调对 UI 细节和工程质量的敏感度。",
      rawDescription:
        "Partner with the product engineering team, implement polished interfaces, and contribute to small but high-impact frontend improvements."
    })
  ],
  jobSyncRuns: [
    {
      id: "sync_1",
      providerId: "seed",
      providerLabel: "初始化数据",
      syncLabel: "岗位库初始化",
      status: "SUCCESS",
      query: "",
      startedAt: "2026-04-28T09:00:00.000Z",
      finishedAt: "2026-04-28T09:00:10.000Z",
      fetchedCount: 6,
      createdCount: 6,
      updatedCount: 0,
      message: "已初始化 6 条示例岗位。"
    }
  ],
  applications: [
    {
      id: "application_1",
      jobPostingId: "job_1",
      companyId: "company_1",
      companyName: "Vercel",
      roleTitle: "Frontend Engineer",
      appliedAt: "2026-04-12",
      status: "INTERVIEW",
      trackingUrl: "https://vercel.greenhouse.io/status/123",
      notes: "Recruiter screen completed."
    },
    {
      id: "application_2",
      jobPostingId: "job_2",
      companyId: "company_2",
      companyName: "Linear",
      roleTitle: "Product Engineer",
      appliedAt: "2026-04-18",
      status: "APPLIED",
      trackingUrl: "https://jobs.ashbyhq.com/linear/track/xyz",
      notes: "Waiting on async follow-up."
    },
    {
      id: "application_3",
      jobPostingId: "job_3",
      companyId: "company_3",
      companyName: "Notion",
      roleTitle: "Software Engineer, Growth",
      appliedAt: "2026-04-08",
      status: "OA",
      trackingUrl: "https://jobs.lever.co/notion/check",
      notes: "OA due this week."
    },
    {
      id: "application_4",
      jobPostingId: "job_4",
      companyId: "company_4",
      companyName: "Stripe",
      roleTitle: "Frontend Engineer, Dashboard",
      appliedAt: "2026-04-20",
      status: "OFFER",
      trackingUrl: "https://stripe.com/careers/portal/offer",
      notes: "Offer package pending review."
    }
  ],
  sourceDocuments: [
    {
      id: "doc_1",
      type: "resume",
      name: "resume-2026.pdf",
      createdAt: "2026-04-22T12:00:00.000Z"
    }
  ]
};
