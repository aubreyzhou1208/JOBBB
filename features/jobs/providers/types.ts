import { JobEmploymentType, JobPosting, JobPostingInput, JobWorkMode } from "@/lib/types";

export type JobProviderId =
  | "greenhouse_live"
  | "lever_live"
  | "campus_portal_live"
  | "campus_wechat_live"
  | "greenhouse_mock"
  | "lever_mock"
  | "campus_portal_mock";

export type JobProviderChannel = "ATS" | "CHINA_CAMPUS";

export type JobSearchParams = {
  query: string;
};

export type JobIngestionDraft = JobPostingInput;

export type JobSearchResult = {
  providerId: JobProviderId;
  providerLabel: string;
  jobs: JobIngestionDraft[];
};

export type JobSearchProvider = {
  id: JobProviderId;
  label: string;
  description: string;
  channel: JobProviderChannel;
  search: (params: JobSearchParams) => Promise<JobSearchResult>;
};

export type ExternalJobSeed = {
  companyId: string;
  companyName: string;
  title: string;
  location: string;
  workMode: JobWorkMode;
  employmentType: JobEmploymentType;
  salaryRange?: string;
  tags: string[];
  postedAt: string;
  openedAt: string;
  deadlineAt: string;
  applyUrl: string;
  source: string;
  sourceJobId: string;
  sourceType: string;
  summary: string;
  rawDescription: string;
  notes?: string;
};
