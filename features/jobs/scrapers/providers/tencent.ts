import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

// Tencent campus position API
const SEARCH_URL = "https://join.qq.com/api/v3/search/position";

export class TencentProvider extends JobProvider {
  readonly id = "tencent";
  readonly companyName = "腾讯";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    for (const recruitType of [2, 3]) { // 2=校招, 3=实习
      let pageNum = 1;

      while (true) {
        const res = await this.fetchWithTimeout(SEARCH_URL, {
          method: "POST",
          headers: this.headers({ "Content-Type": "application/json", Referer: "https://join.qq.com/" }),
          body: JSON.stringify({ keyword: "", recruitType, countryId: 52, pageNum, pageSize: 50 }),
        });

        if (!res.ok) break;
        const data = await res.json();
        const list: unknown[] = data?.data?.posts?.postInfo ?? data?.data?.list ?? [];
        if (list.length === 0) break;

        for (const p of list as Record<string, unknown>[]) {
          const isIntern = recruitType === 3;
          const jobId = String(p.postId ?? p.id ?? "");
          jobs.push({
            companyName: this.companyName,
            title: String(p.recruitPostName ?? p.name ?? ""),
            location: this.parseLocation(p),
            workMode: "ONSITE",
            employmentType: isIntern ? "INTERN" : "NEW_GRAD",
            applyUrl: `https://join.qq.com/post.html?pid=${jobId}`,
            sourceJobId: jobId,
            source: this.id,
            sourceType: "campus_api",
            summary: String(p.recruitPostDescription ?? p.description ?? "").slice(0, 500),
            tags: isIntern ? ["实习"] : ["校招"],
            postedAt: this.now(),
            openedAt: this.now(),
            deadlineAt: this.defaultDeadline(),
          });
        }

        if (list.length < 50) break;
        pageNum++;
        if (pageNum > 20) break;
      }
    }

    return jobs;
  }

  private parseLocation(p: Record<string, unknown>): string {
    if (p.cityName) return String(p.cityName);
    if (Array.isArray(p.locationList)) {
      const locs = (p.locationList as Record<string, unknown>[]).map((l) => l.name ?? l.cityName).filter(Boolean);
      if (locs.length > 0) return locs.join("、");
    }
    return "深圳";
  }
}
