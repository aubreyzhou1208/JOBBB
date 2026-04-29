import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

// ByteDance campus API – portal_type: 1=校招, 3=实习
const BASE_URL = "https://jobs.bytedance.com/campus/api/search/position/";

export class ByteDanceProvider extends JobProvider {
  readonly id = "bytedance";
  readonly companyName = "字节跳动";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    for (const portalType of [1, 3]) {
      let offset = 0;
      const limit = 50;

      while (true) {
        const res = await this.fetchWithTimeout(BASE_URL, {
          method: "POST",
          headers: this.headers({ "Content-Type": "application/json", Referer: "https://jobs.bytedance.com/" }),
          body: JSON.stringify({ keyword: "", portal_type: portalType, portal_id: 1, location_codes: [], category_ids: [], offset, limit }),
        });

        if (!res.ok) break;
        const data = await res.json();
        const positions: unknown[] = data?.data?.job_post_list ?? [];
        if (positions.length === 0) break;

        for (const p of positions as Record<string, unknown>[]) {
          jobs.push({
            companyName: this.companyName,
            title: String(p.job_title ?? p.name ?? ""),
            location: this.parseLocation(p),
            workMode: "ONSITE",
            employmentType: portalType === 3 ? "INTERN" : "NEW_GRAD",
            applyUrl: `https://jobs.bytedance.com/campus/position/${p.id}/detail`,
            sourceJobId: String(p.id ?? p.job_id ?? ""),
            source: this.id,
            sourceType: "campus_api",
            summary: String(p.description ?? p.requirement ?? "").slice(0, 500),
            tags: portalType === 3 ? ["实习"] : ["校招"],
            postedAt: this.now(),
            openedAt: this.now(),
            deadlineAt: this.defaultDeadline(),
          });
        }

        if (positions.length < limit) break;
        offset += limit;
        if (offset > 500) break; // safety cap
      }
    }

    return jobs;
  }

  private parseLocation(p: Record<string, unknown>): string {
    if (p.city_name) return String(p.city_name);
    if (Array.isArray(p.location_list) && p.location_list.length > 0) {
      const locs = (p.location_list as Record<string, unknown>[]).map((l) => l.name ?? l.city_name).filter(Boolean);
      return locs.join("、");
    }
    return "中国";
  }
}
