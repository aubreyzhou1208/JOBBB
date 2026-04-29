import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

const BASE_URL = "https://talent.baidu.com/http/baidu-college-content/v2/position/list";

export class BaiduProvider extends JobProvider {
  readonly id = "baidu";
  readonly companyName = "百度";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    for (const projectType of ["校园招聘", "实习生招募"]) {
      let pageNo = 1;

      while (true) {
        const url = `${BASE_URL}?pageNo=${pageNo}&pageSize=50&projectType=${encodeURIComponent(projectType)}`;
        const res = await this.fetchWithTimeout(url, {
          headers: this.headers({ Referer: "https://talent.baidu.com/external/baidu/campus.html" }),
        });

        if (!res.ok) break;
        const data = await res.json();
        const list: unknown[] = data?.data?.list ?? data?.result?.list ?? [];
        if (list.length === 0) break;

        for (const p of list as Record<string, unknown>[]) {
          const isIntern = projectType.includes("实习");
          jobs.push({
            companyName: this.companyName,
            title: String(p.positionName ?? p.name ?? ""),
            location: String(p.workPlace ?? p.location ?? "北京"),
            workMode: "ONSITE",
            employmentType: isIntern ? "INTERN" : "NEW_GRAD",
            applyUrl: `https://talent.baidu.com/external/baidu/campus.html#/index?position=${p.positionId ?? p.id}`,
            sourceJobId: String(p.positionId ?? p.id ?? ""),
            source: this.id,
            sourceType: "campus_api",
            summary: String(p.description ?? p.positionDescription ?? "").slice(0, 500),
            tags: isIntern ? ["实习"] : ["校招"],
            postedAt: this.now(),
            openedAt: this.now(),
            deadlineAt: this.defaultDeadline(),
          });
        }

        const total: number = data?.data?.total ?? data?.result?.total ?? 0;
        if (pageNo * 50 >= total) break;
        pageNo++;
        if (pageNo > 20) break;
      }
    }

    return jobs;
  }
}
