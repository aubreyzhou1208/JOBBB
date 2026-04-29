import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";
import * as cheerio from "cheerio";

const JOBS_URL = "https://www.janestreet.com/join-jane-street/positions/";

export class JaneStreetProvider extends JobProvider {
  readonly id = "jane-street";
  readonly companyName = "Jane Street";

  async fetchJobs(): Promise<ScrapedJob[]> {
    const res = await this.fetchWithTimeout(JOBS_URL, {
      headers: this.headers({ Accept: "text/html,application/xhtml+xml" }),
    });

    if (!res.ok) throw new Error(`Jane Street: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const jobs: ScrapedJob[] = [];

    $(".position-row, .job-listing, article.position, .positions-list li, .js-positions-item").each((_, el) => {
      const title = $(el).find(".position-title, h3, h2, .title").first().text().trim();
      const location = $(el).find(".position-location, .location").first().text().trim() || "New York";
      const link = $(el).find("a").first().attr("href") ?? "";
      const applyUrl = link.startsWith("http") ? link : `https://www.janestreet.com${link}`;
      const jobId = link.split("/").filter(Boolean).pop() ?? title.toLowerCase().replace(/\s+/g, "-");

      if (!title) return;

      const isIntern = /intern/i.test(title);
      // Jane Street China is Hong Kong office
      const isChinaRelated = /hong kong|hk|china|asia/i.test(location) || /hk|asia/i.test(title);
      if (!isChinaRelated && jobs.length > 0) return; // keep all if no China filter, otherwise filter

      jobs.push({
        companyName: this.companyName,
        title,
        location,
        workMode: "ONSITE",
        employmentType: isIntern ? "INTERN" : "NEW_GRAD",
        applyUrl,
        sourceJobId: jobId,
        source: this.id,
        sourceType: "html_scrape",
        summary: $(el).find(".position-description, .description, p").first().text().trim().slice(0, 500),
        tags: isIntern ? ["Intern", "实习"] : ["New Grad", "校招"],
        postedAt: this.now(),
        openedAt: this.now(),
        deadlineAt: this.defaultDeadline(),
      });
    });

    return jobs;
  }
}
