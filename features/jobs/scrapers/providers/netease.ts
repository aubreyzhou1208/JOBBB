import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

const BASE_URL = "https://campus.163.com/app/sys/social/experience/ug/positionList.do";

export class NetEaseProvider extends JobProvider {
  readonly id = "netease";
  readonly companyName = "网易";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    for (const positionType of [1, 2]) { // 1=校招, 2=实习
      let pageNo = 1;

      while (true) {
        const res = await this.fetchWithTimeout(BASE_URL, {
          method: "POST",
          headers: this.headers({ "Content-Type": "application/x-www-form-urlencoded", Referer: "https://campus.163.com/" }),
          body: new URLSearchParams({ pageNo: String(pageNo), pageSize: "50", positionType: String(positionType) }).toString(),
        });

        if (!res.ok) break;
        const data = await res.json();
        const list: unknown[] = data?.data?.list ?? data?.result?.list ?? [];
        if (list.length === 0) break;

        for (const p of list as Record<string, unknown>[]) {
          const isIntern = positionType === 2;
          jobs.push({
            companyName: this.companyName,
            title: String(p.positionName ?? p.name ?? ""),
            location: String(p.workCity ?? p.location ?? "杭州"),
            workMode: "ONSITE",
            employmentType: isIntern ? "INTERN" : "NEW_GRAD",
            applyUrl: `https://campus.163.com/app/sys/social/experience/ug/positionDetail.do?positionId=${p.positionId ?? p.id}`,
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

        const total: number = data?.data?.total ?? 0;
        if (pageNo * 50 >= total || list.length < 50) break;
        pageNo++;
        if (pageNo > 20) break;
      }
    }

    return jobs;
  }
}
