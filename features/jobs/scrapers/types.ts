export interface ScrapedJob {
  companyName: string;
  title: string;
  location: string;
  workMode: "REMOTE" | "HYBRID" | "ONSITE";
  employmentType: "FULL_TIME" | "INTERN" | "NEW_GRAD" | "CONTRACT";
  applyUrl: string;
  sourceJobId: string;
  source: string;
  sourceType: string;
  summary: string;
  rawDescription?: string;
  postedAt: Date;
  openedAt: Date;
  deadlineAt: Date;
  salaryRange?: string;
  tags: string[];
}

export interface ProviderResult {
  providerId: string;
  companyName: string;
  jobs: ScrapedJob[];
  error?: string;
}

export interface SyncReport {
  providers: { id: string; company: string; fetched: number; error?: string }[];
  totalFetched: number;
  saved: number;
  updated: number;
  startedAt: Date;
  finishedAt: Date;
}
