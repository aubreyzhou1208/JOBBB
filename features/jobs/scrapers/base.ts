import type { ScrapedJob, ProviderResult } from "./types";

export abstract class JobProvider {
  abstract readonly id: string;
  abstract readonly companyName: string;

  abstract fetchJobs(): Promise<ScrapedJob[]>;

  protected async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs = 20000
  ): Promise<Response> {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(tid);
    }
  }

  protected headers(extra: Record<string, string> = {}): Record<string, string> {
    return {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      ...extra,
    };
  }

  protected now() { return new Date(); }
  protected futureDate(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }

  // Most Chinese campus recruiting cycles run Oct–Dec (秋招) and Mar–May (春招/实习)
  protected defaultDeadline() { return this.futureDate(120); }

  async run(): Promise<ProviderResult> {
    try {
      const jobs = await this.fetchJobs();
      return { providerId: this.id, companyName: this.companyName, jobs };
    } catch (err) {
      console.error(`[${this.id}] failed:`, err);
      return { providerId: this.id, companyName: this.companyName, jobs: [], error: String(err) };
    }
  }
}
