/**
 * Chinese financial institutions – all use HTML scraping since none expose public JSON APIs.
 * Each provider targets their career/campus recruitment page.
 */
import * as cheerio from "cheerio";
import { JobProvider } from "../base";
import type { ScrapedJob } from "../types";

abstract class CnFinanceProvider extends JobProvider {
  protected abstract readonly careerUrl: string;
  protected abstract readonly jobSelector: string;
  protected abstract readonly titleSelector: string;
  protected abstract readonly locationSelector: string;
  protected abstract readonly linkSelector: string;
  protected abstract readonly defaultLocation: string;

  async fetchJobs(): Promise<ScrapedJob[]> {
    const res = await this.fetchWithTimeout(this.careerUrl, {
      headers: this.headers({ Accept: "text/html,application/xhtml+xml", Referer: this.careerUrl }),
    });
    if (!res.ok) throw new Error(`${this.companyName}: HTTP ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    const jobs: ScrapedJob[] = [];

    $(this.jobSelector).each((_, el) => {
      const title = $(el).find(this.titleSelector).first().text().trim()
        || $(el).text().trim().split("\n")[0].trim();
      if (!title || title.length < 2) return;

      const href = $(el).find(this.linkSelector).attr("href") ?? $(el).find("a").attr("href") ?? "";
      const applyUrl = href.startsWith("http") ? href : href ? `${new URL(this.careerUrl).origin}${href}` : this.careerUrl;
      const location = $(el).find(this.locationSelector).first().text().trim() || this.defaultLocation;
      const jobId = href.split(/[?#/]/).filter(Boolean).pop() ?? title.toLowerCase().replace(/\s+/g, "-");

      const isIntern = /实习|intern/i.test(title);
      jobs.push({
        companyName: this.companyName,
        title,
        location,
        workMode: "ONSITE",
        employmentType: isIntern ? "INTERN" : "NEW_GRAD",
        applyUrl,
        sourceJobId: `${this.id}-${jobId}`,
        source: this.id,
        sourceType: "html_scrape",
        summary: $(el).find(".desc, .description, p").first().text().trim().slice(0, 500),
        tags: isIntern ? ["实习", "金融"] : ["校招", "金融"],
        postedAt: this.now(),
        openedAt: this.now(),
        deadlineAt: this.defaultDeadline(),
      });
    });

    return jobs;
  }
}

export class CICCProvider extends CnFinanceProvider {
  readonly id = "cicc";
  readonly companyName = "中金公司";
  readonly careerUrl = "https://campus.cicc.com.cn/campus/home";
  readonly jobSelector = ".position-item, .job-item, tr.position, li.position";
  readonly titleSelector = ".position-name, .job-name, .title, td:first-child, h3";
  readonly locationSelector = ".location, .city, td:nth-child(2)";
  readonly linkSelector = "a";
  readonly defaultLocation = "北京";
}

export class CITICProvider extends CnFinanceProvider {
  readonly id = "citic";
  readonly companyName = "中信证券";
  readonly careerUrl = "https://career.citics.com/campus";
  readonly jobSelector = ".position-item, .job-row, .recruit-item, li.item";
  readonly titleSelector = ".position-name, .job-title, h3, h4";
  readonly locationSelector = ".location, .work-location, .city";
  readonly linkSelector = "a";
  readonly defaultLocation = "北京";
}

export class HuataiProvider extends CnFinanceProvider {
  readonly id = "huatai";
  readonly companyName = "华泰证券";
  readonly careerUrl = "https://www.htsc.com.cn/join-us/campus.html";
  readonly jobSelector = ".position-item, .job-item, .recruit-item, tr";
  readonly titleSelector = ".name, .title, td:first-child, h3";
  readonly locationSelector = ".location, .city, td:nth-child(3)";
  readonly linkSelector = "a";
  readonly defaultLocation = "南京";
}

export class EFundProvider extends CnFinanceProvider {
  readonly id = "efund";
  readonly companyName = "易方达基金";
  readonly careerUrl = "https://www.efundcn.com/join/campus.html";
  readonly jobSelector = ".position-item, .job-item, tr.item, li.position";
  readonly titleSelector = ".position-name, td:first-child, .title, h3";
  readonly locationSelector = ".location, .city, td:nth-child(2)";
  readonly linkSelector = "a";
  readonly defaultLocation = "广州";
}

export class ChinaAMCProvider extends CnFinanceProvider {
  readonly id = "chinaamc";
  readonly companyName = "华夏基金";
  readonly careerUrl = "https://www.chinaamc.com/join/campus/";
  readonly jobSelector = ".position-item, .job-row, tr.position, li.item";
  readonly titleSelector = ".position-name, .title, td:first-child, h3";
  readonly locationSelector = ".location, .city, td:nth-child(2)";
  readonly linkSelector = "a";
  readonly defaultLocation = "北京";
}
