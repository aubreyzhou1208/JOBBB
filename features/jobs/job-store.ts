import { JobEmploymentType, JobSyncStatus, JobWorkMode, Prisma } from "@prisma/client";

import { normalizeJobPosting } from "@/features/jobs/job-tagging";
import { mockAppState } from "@/lib/mock-data";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { JobPosting, JobPostingInput, JobSyncRun } from "@/lib/types";
import { createId } from "@/lib/utils";

const defaultUserSeed = {
  name: mockAppState.user.name,
  email: mockAppState.user.email,
  timezone: mockAppState.user.timezone
};

type StorageMode = "database" | "memory";

type JobCatalogSnapshot = {
  jobs: JobPosting[];
  syncRuns: JobSyncRun[];
  latestSyncRun: JobSyncRun | null;
  storageMode: StorageMode;
};

let memoryJobs = [...mockAppState.jobPostings];
let memorySyncRuns = [...mockAppState.jobSyncRuns];

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateString(value: Date) {
  return value.toISOString().slice(0, 10);
}

function toEnumWorkMode(value: JobPostingInput["workMode"]): JobWorkMode {
  return value as JobWorkMode;
}

function toEnumEmploymentType(value: JobPostingInput["employmentType"]): JobEmploymentType {
  return value as JobEmploymentType;
}

function toEnumSyncStatus(value: JobSyncRun["status"]): JobSyncStatus {
  return value as JobSyncStatus;
}

function buildDedupeKey(job: Pick<JobPostingInput, "sourceType" | "sourceJobId" | "companyName" | "title" | "location">) {
  if (job.sourceJobId) {
    return `${job.sourceType}::${job.sourceJobId}`.toLowerCase();
  }

  return `${job.companyName}::${job.title}::${job.location}`.trim().toLowerCase();
}

async function ensureDefaultUser(db: Prisma.TransactionClient | typeof prisma) {
  return db.user.upsert({
    where: { email: defaultUserSeed.email },
    update: {
      name: defaultUserSeed.name,
      timezone: defaultUserSeed.timezone
    },
    create: defaultUserSeed
  });
}

async function ensureCompany(
  db: Prisma.TransactionClient | typeof prisma,
  input: Pick<JobPostingInput, "companyName" | "location">
) {
  const name = input.companyName.trim();

  if (!name) {
    return null;
  }

  return db.company.upsert({
    where: { name },
    update: input.location ? { location: input.location } : {},
    create: {
      name,
      location: input.location || null
    }
  });
}

function mapJobPostingRecord(
  job: {
    id: string;
    companyId: string | null;
    companyName: string;
    title: string;
    location: string;
    workMode: JobWorkMode;
    employmentType: JobEmploymentType;
    salaryRange: string | null;
    tags: string[];
    normalizedTags: string[];
    regionTags: string[];
    roleTags: string[];
    programTags: string[];
    postedAt: Date;
    openedAt: Date;
    deadlineAt: Date;
    applyUrl: string;
    source: string;
    sourceJobId: string | null;
    sourceType: string;
    summary: string;
    rawDescription: string | null;
    notes: string | null;
    bookmarks?: Array<{ id: string }>;
  },
  isSaved = false
): JobPosting {
  return {
    id: job.id,
    companyId: job.companyId ?? "",
    companyName: job.companyName,
    title: job.title,
    location: job.location,
    workMode: job.workMode,
    employmentType: job.employmentType,
    salaryRange: job.salaryRange ?? "",
    tags: job.tags,
    normalizedTags: job.normalizedTags,
    regionTags: job.regionTags,
    roleTags: job.roleTags,
    programTags: job.programTags,
    postedAt: toDateString(job.postedAt),
    openedAt: toDateString(job.openedAt),
    deadlineAt: toDateString(job.deadlineAt),
    applyUrl: job.applyUrl,
    source: job.source,
    sourceJobId: job.sourceJobId ?? "",
    sourceType: job.sourceType,
    isSaved: isSaved || Boolean(job.bookmarks?.length),
    summary: job.summary,
    rawDescription: job.rawDescription ?? "",
    notes: job.notes ?? ""
  };
}

function mapJobSyncRunRecord(run: {
  id: string;
  providerId: string;
  providerLabel: string;
  syncLabel: string;
  status: JobSyncStatus;
  query: string;
  startedAt: Date;
  finishedAt: Date;
  fetchedCount: number;
  createdCount: number;
  updatedCount: number;
  message: string;
}): JobSyncRun {
  return {
    id: run.id,
    providerId: run.providerId,
    providerLabel: run.providerLabel,
    syncLabel: run.syncLabel,
    status: run.status,
    query: run.query,
    startedAt: run.startedAt.toISOString(),
    finishedAt: run.finishedAt.toISOString(),
    fetchedCount: run.fetchedCount,
    createdCount: run.createdCount,
    updatedCount: run.updatedCount,
    message: run.message
  };
}

function buildSyncMessage(status: JobSyncRun["status"], createdCount: number, updatedCount: number) {
  if (status === "FAILED") {
    return "岗位库刷新失败，请稍后再试。";
  }

  return `岗位库已刷新：新增 ${createdCount} 条，更新 ${updatedCount} 条。`;
}

function dedupeJobInputs(jobs: JobPostingInput[]) {
  const deduped = new Map<string, JobPostingInput & ReturnType<typeof normalizeJobPosting>>();

  for (const job of jobs) {
    deduped.set(buildDedupeKey(job), normalizeJobPosting(job));
  }

  return Array.from(deduped.entries()).map(([dedupeKey, job]) => ({
    dedupeKey,
    job
  }));
}

export async function listJobCatalog(): Promise<JobCatalogSnapshot> {
  if (!isDatabaseConfigured) {
    return {
      jobs: memoryJobs,
      syncRuns: memorySyncRuns,
      latestSyncRun: memorySyncRuns[0] ?? null,
      storageMode: "memory"
    };
  }

  const user = await ensureDefaultUser(prisma);
  const [jobs, syncRuns] = await prisma.$transaction([
    prisma.jobPosting.findMany({
      orderBy: [{ postedAt: "desc" }, { updatedAt: "desc" }],
      include: {
        bookmarks: {
          where: { userId: user.id },
          select: { id: true }
        }
      }
    }),
    prisma.jobSyncRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 20
    })
  ]);

  const mappedJobs = jobs.map((job) => mapJobPostingRecord(job));
  const mappedRuns = syncRuns.map((run) => mapJobSyncRunRecord(run));

  return {
    jobs: mappedJobs,
    syncRuns: mappedRuns,
    latestSyncRun: mappedRuns[0] ?? null,
    storageMode: "database"
  };
}

export async function createJobPostingInStore(input: JobPostingInput) {
  const normalized = normalizeJobPosting(input);

  if (!isDatabaseConfigured) {
    const nextJob: JobPosting = {
      id: createId("job"),
      ...normalized
    };

    memoryJobs = [nextJob, ...memoryJobs];
    return nextJob;
  }

  const user = await ensureDefaultUser(prisma);

  const job = await prisma.$transaction(async (tx) => {
    const company = await ensureCompany(tx, normalized);
    const created = await tx.jobPosting.create({
      data: {
        dedupeKey: buildDedupeKey(normalized),
        companyId: company?.id,
        createdByUserId: user.id,
        companyName: normalized.companyName,
        title: normalized.title,
        location: normalized.location,
        workMode: toEnumWorkMode(normalized.workMode),
        employmentType: toEnumEmploymentType(normalized.employmentType),
        salaryRange: normalized.salaryRange || null,
        tags: normalized.tags,
        normalizedTags: normalized.normalizedTags,
        regionTags: normalized.regionTags,
        roleTags: normalized.roleTags,
        programTags: normalized.programTags,
        postedAt: toDate(normalized.postedAt),
        openedAt: toDate(normalized.openedAt),
        deadlineAt: toDate(normalized.deadlineAt),
        applyUrl: normalized.applyUrl,
        source: normalized.source,
        sourceJobId: normalized.sourceJobId || null,
        sourceType: normalized.sourceType,
        summary: normalized.summary,
        rawDescription: normalized.rawDescription || null,
        notes: normalized.notes || null
      },
      include: {
        bookmarks: {
          where: { userId: user.id },
          select: { id: true }
        }
      }
    });

    if (normalized.isSaved) {
      await tx.jobBookmark.upsert({
        where: {
          userId_jobPostingId: {
            userId: user.id,
            jobPostingId: created.id
          }
        },
        update: {},
        create: {
          userId: user.id,
          jobPostingId: created.id
        }
      });
    }

    return created;
  });

  return mapJobPostingRecord(job, normalized.isSaved);
}

export async function updateJobPostingInStore(id: string, input: JobPostingInput) {
  const normalized = normalizeJobPosting(input);

  if (!isDatabaseConfigured) {
    memoryJobs = memoryJobs.map((job) => (job.id === id ? { id, ...normalized } : job));
    return memoryJobs.find((job) => job.id === id) ?? null;
  }

  const user = await ensureDefaultUser(prisma);
  const job = await prisma.$transaction(async (tx) => {
    const company = await ensureCompany(tx, normalized);
    const updated = await tx.jobPosting.update({
      where: { id },
      data: {
        dedupeKey: buildDedupeKey(normalized),
        companyId: company?.id ?? null,
        companyName: normalized.companyName,
        title: normalized.title,
        location: normalized.location,
        workMode: toEnumWorkMode(normalized.workMode),
        employmentType: toEnumEmploymentType(normalized.employmentType),
        salaryRange: normalized.salaryRange || null,
        tags: normalized.tags,
        normalizedTags: normalized.normalizedTags,
        regionTags: normalized.regionTags,
        roleTags: normalized.roleTags,
        programTags: normalized.programTags,
        postedAt: toDate(normalized.postedAt),
        openedAt: toDate(normalized.openedAt),
        deadlineAt: toDate(normalized.deadlineAt),
        applyUrl: normalized.applyUrl,
        source: normalized.source,
        sourceJobId: normalized.sourceJobId || null,
        sourceType: normalized.sourceType,
        summary: normalized.summary,
        rawDescription: normalized.rawDescription || null,
        notes: normalized.notes || null
      },
      include: {
        bookmarks: {
          where: { userId: user.id },
          select: { id: true }
        }
      }
    });

    if (normalized.isSaved) {
      await tx.jobBookmark.upsert({
        where: {
          userId_jobPostingId: {
            userId: user.id,
            jobPostingId: updated.id
          }
        },
        update: {},
        create: {
          userId: user.id,
          jobPostingId: updated.id
        }
      });
    } else {
      await tx.jobBookmark.deleteMany({
        where: {
          userId: user.id,
          jobPostingId: updated.id
        }
      });
    }

    return updated;
  });

  return mapJobPostingRecord(job, normalized.isSaved);
}

export async function deleteJobPostingFromStore(id: string) {
  if (!isDatabaseConfigured) {
    memoryJobs = memoryJobs.filter((job) => job.id !== id);
    return;
  }

  await prisma.jobPosting.delete({
    where: { id }
  });
}

export async function toggleSavedJobInStore(id: string) {
  if (!isDatabaseConfigured) {
    const target = memoryJobs.find((job) => job.id === id);

    if (!target) {
      return null;
    }

    memoryJobs = memoryJobs.map((job) => (job.id === id ? { ...job, isSaved: !job.isSaved } : job));
    return memoryJobs.find((job) => job.id === id) ?? null;
  }

  const user = await ensureDefaultUser(prisma);
  const existing = await prisma.jobBookmark.findUnique({
    where: {
      userId_jobPostingId: {
        userId: user.id,
        jobPostingId: id
      }
    }
  });

  if (existing) {
    await prisma.jobBookmark.delete({
      where: {
        userId_jobPostingId: {
          userId: user.id,
          jobPostingId: id
        }
      }
    });
  } else {
    await prisma.jobBookmark.create({
      data: {
        userId: user.id,
        jobPostingId: id
      }
    });
  }

  const job = await prisma.jobPosting.findUnique({
    where: { id },
    include: {
      bookmarks: {
        where: { userId: user.id },
        select: { id: true }
      }
    }
  });

  return job ? mapJobPostingRecord(job) : null;
}

export async function persistJobSyncRun(input: {
  run: Omit<JobSyncRun, "id" | "createdCount" | "updatedCount" | "message">;
  jobs: JobPostingInput[];
}) {
  const dedupedJobs = dedupeJobInputs(input.jobs);
  let createdCount = 0;
  let updatedCount = 0;

  if (!isDatabaseConfigured) {
    for (const { dedupeKey, job } of dedupedJobs) {
      const existingIndex = memoryJobs.findIndex((item) => buildDedupeKey(item) === dedupeKey);

      if (existingIndex >= 0) {
        memoryJobs[existingIndex] = {
          ...memoryJobs[existingIndex],
          ...job,
          id: memoryJobs[existingIndex].id,
          isSaved: memoryJobs[existingIndex].isSaved || job.isSaved
        };
        updatedCount += 1;
      } else {
        memoryJobs.unshift({
          id: createId("job"),
          ...job
        });
        createdCount += 1;
      }
    }

    const run: JobSyncRun = {
      ...input.run,
      id: createId("sync"),
      createdCount,
      updatedCount,
      message: buildSyncMessage(input.run.status, createdCount, updatedCount)
    };

    memorySyncRuns = [run, ...memorySyncRuns].slice(0, 20);

    return {
      run,
      storageMode: "memory" as const
    };
  }

  const user = await ensureDefaultUser(prisma);

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.jobPosting.findMany({
      where: {
        dedupeKey: {
          in: dedupedJobs.map((item) => item.dedupeKey)
        }
      },
      select: {
        id: true,
        dedupeKey: true
      }
    });

    const existingMap = new Map(existing.map((item) => [item.dedupeKey, item.id]));

    for (const { dedupeKey, job } of dedupedJobs) {
      const company = await ensureCompany(tx, job);
      const existingId = existingMap.get(dedupeKey);

      await tx.jobPosting.upsert({
        where: { dedupeKey },
        update: {
          companyId: company?.id ?? null,
          companyName: job.companyName,
          title: job.title,
          location: job.location,
          workMode: toEnumWorkMode(job.workMode),
          employmentType: toEnumEmploymentType(job.employmentType),
          salaryRange: job.salaryRange || null,
          tags: job.tags,
          normalizedTags: job.normalizedTags,
          regionTags: job.regionTags,
          roleTags: job.roleTags,
          programTags: job.programTags,
          postedAt: toDate(job.postedAt),
          openedAt: toDate(job.openedAt),
          deadlineAt: toDate(job.deadlineAt),
          applyUrl: job.applyUrl,
          source: job.source,
          sourceJobId: job.sourceJobId || null,
          sourceType: job.sourceType,
          summary: job.summary,
          rawDescription: job.rawDescription || null,
          notes: job.notes || null,
          isActive: true,
          lastSyncedAt: new Date()
        },
        create: {
          dedupeKey,
          companyId: company?.id ?? null,
          companyName: job.companyName,
          title: job.title,
          location: job.location,
          workMode: toEnumWorkMode(job.workMode),
          employmentType: toEnumEmploymentType(job.employmentType),
          salaryRange: job.salaryRange || null,
          tags: job.tags,
          normalizedTags: job.normalizedTags,
          regionTags: job.regionTags,
          roleTags: job.roleTags,
          programTags: job.programTags,
          postedAt: toDate(job.postedAt),
          openedAt: toDate(job.openedAt),
          deadlineAt: toDate(job.deadlineAt),
          applyUrl: job.applyUrl,
          source: job.source,
          sourceJobId: job.sourceJobId || null,
          sourceType: job.sourceType,
          summary: job.summary,
          rawDescription: job.rawDescription || null,
          notes: job.notes || null,
          isActive: true,
          firstSeenAt: new Date(),
          lastSyncedAt: new Date()
        }
      });

      if (existingId) {
        updatedCount += 1;
      } else {
        createdCount += 1;
      }
    }

    return tx.jobSyncRun.create({
      data: {
        userId: user.id,
        providerId: input.run.providerId,
        providerLabel: input.run.providerLabel,
        syncLabel: input.run.syncLabel,
        status: toEnumSyncStatus(input.run.status),
        query: input.run.query,
        startedAt: new Date(input.run.startedAt),
        finishedAt: new Date(input.run.finishedAt),
        fetchedCount: input.run.fetchedCount,
        createdCount,
        updatedCount,
        message: buildSyncMessage(input.run.status, createdCount, updatedCount)
      }
    });
  });

  return {
    run: mapJobSyncRunRecord(result),
    storageMode: "database" as const
  };
}
