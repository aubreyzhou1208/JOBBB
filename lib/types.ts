export const applicationStatuses = [
  "SAVED",
  "APPLIED",
  "OA",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "GHOSTED"
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export type User = {
  id: string;
  name: string;
  email: string;
  timezone: string;
  createdAt: string;
};

export type ResumeProfile = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  school: string;
  major: string;
  degree: string;
  skills: string[];
  projects: string;
  internships: string;
  updatedAt: string;
};

export type Company = {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  location?: string;
};

export const jobWorkModes = ["REMOTE", "HYBRID", "ONSITE"] as const;
export type JobWorkMode = (typeof jobWorkModes)[number];

export const jobEmploymentTypes = ["FULL_TIME", "INTERN", "NEW_GRAD", "CONTRACT"] as const;
export type JobEmploymentType = (typeof jobEmploymentTypes)[number];

export type JobTagSet = {
  normalizedTags: string[];
  regionTags: string[];
  roleTags: string[];
  programTags: string[];
};

export type JobPosting = {
  id: string;
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
  sourceJobId?: string;
  sourceType: string;
  isSaved: boolean;
  normalizedTags: string[];
  regionTags: string[];
  roleTags: string[];
  programTags: string[];
  summary: string;
  rawDescription?: string;
  notes?: string;
};

export type JobPostingInput = Omit<JobPosting, "id" | "normalizedTags" | "regionTags" | "roleTags" | "programTags">;

export const jobSyncStatuses = ["SUCCESS", "FAILED"] as const;
export type JobSyncStatus = (typeof jobSyncStatuses)[number];

export type JobSyncRun = {
  id: string;
  providerId: string;
  providerLabel: string;
  syncLabel: string;
  status: JobSyncStatus;
  query: string;
  startedAt: string;
  finishedAt: string;
  fetchedCount: number;
  createdCount: number;
  updatedCount: number;
  message: string;
};

export type Application = {
  id: string;
  jobPostingId?: string;
  companyId?: string;
  companyName: string;
  roleTitle: string;
  appliedAt: string;
  status: ApplicationStatus;
  trackingUrl?: string;
  notes?: string;
};

export type SourceDocument = {
  id: string;
  type: "resume" | "job-description" | "transcript" | "other";
  name: string;
  fileUrl?: string;
  parsedText?: string;
  createdAt: string;
};

export type AppState = {
  user: User;
  resumeProfile: ResumeProfile;
  companies: Company[];
  jobPostings: JobPosting[];
  jobSyncRuns: JobSyncRun[];
  applications: Application[];
  sourceDocuments: SourceDocument[];
};
