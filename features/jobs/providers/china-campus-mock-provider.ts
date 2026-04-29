import { JobSearchProvider } from "@/features/jobs/providers/types";

const seeds = [
  {
    companyId: "",
    companyName: "字节跳动",
    title: "前端开发工程师-校招",
    location: "北京",
    workMode: "ONSITE" as const,
    employmentType: "NEW_GRAD" as const,
    salaryRange: "",
    tags: ["校招", "前端", "React", "TypeScript"],
    postedAt: "2026-04-26",
    openedAt: "2026-04-26",
    deadlineAt: "2026-05-31",
    applyUrl: "https://campus.example.com/bytedance/frontend",
    source: "校招平台聚合",
    sourceJobId: "campus-bytedance-fe-001",
    sourceType: "校招平台",
    isSaved: false,
    summary: "偏中国校招导向的前端岗位示例，用于验证平台型 provider 的接入形态。",
    rawDescription: "面向 2026 届毕业生，参与 Web 前端开发、工程优化和交互体验建设。",
    notes: "中国校招平台 Mock"
  },
  {
    companyId: "",
    companyName: "小红书",
    title: "软件开发实习生-前端方向",
    location: "上海",
    workMode: "HYBRID" as const,
    employmentType: "INTERN" as const,
    salaryRange: "",
    tags: ["实习", "前端", "校招", "工程化"],
    postedAt: "2026-04-25",
    openedAt: "2026-04-25",
    deadlineAt: "2026-05-20",
    applyUrl: "https://campus.example.com/xiaohongshu/intern-frontend",
    source: "校招平台聚合",
    sourceJobId: "campus-red-fe-002",
    sourceType: "校招平台",
    isSaved: false,
    summary: "用于模拟来自实习僧、学校就业网或企业校招站的中国校招前端岗位。",
    rawDescription: "面向在校学生，参与前端开发、页面性能优化及业务支持。",
    notes: "中国校招平台 Mock"
  }
];

export const chinaCampusMockProvider: JobSearchProvider = {
  id: "campus_portal_mock",
  label: "校招平台 Mock",
  description: "模拟来自中国校招平台、企业校招站和学校就业网的岗位结果。",
  channel: "CHINA_CAMPUS",
  async search({ query }) {
    const normalized = query.trim().toLowerCase();
    const jobs = seeds.filter((seed) => {
      if (!normalized) return true;
      const haystack = [seed.companyName, seed.title, seed.location, seed.summary, seed.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });

    return {
      providerId: "campus_portal_mock",
      providerLabel: "校招平台 Mock",
      jobs
    };
  }
};
