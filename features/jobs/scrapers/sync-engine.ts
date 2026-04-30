import { prisma } from "@/lib/db";
import { buildJobTagSet } from "@/features/jobs/job-tagging";
import { ALL_PROVIDERS, getProvider } from "./registry";
import type { ScrapedJob, SyncReport } from "./types";
import type { JobProvider } from "./base";

function dedupeKey(job: ScrapedJob): string {
  const co = job.companyName.toLowerCase().replace(/\s+/g, "-");
  const id = job.sourceJobId || [job.title, job.location].join(":").toLowerCase().replace(/\s+/g, "-");
  return `${co}::${id}`;
}

async function upsertJob(job: ScrapedJob): Promise<"created" | "updated"> {
  const key = dedupeKey(job);
  const taggable = {
    companyName: job.companyName,
    title: job.title,
    location: job.location,
    employmentType: job.employmentType,
    summary: job.summary,
    rawDescription: job.rawDescription,
    tags: job.tags,
  };
  const tagSet = buildJobTagSet(taggable);

  const payload = {
    dedupeKey: key,
    companyName: job.companyName,
    title: job.title,
    location: job.location,
    workMode: job.workMode,
    employmentType: job.employmentType,
    applyUrl: job.applyUrl,
    source: job.source,
    sourceJobId: job.sourceJobId,
    sourceType: job.sourceType,
    summary: job.summary,
    rawDescription: job.rawDescription ?? null,
    salaryRange: job.salaryRange ?? null,
    tags: job.tags,
    normalizedTags: tagSet.normalizedTags,
    regionTags: tagSet.regionTags,
    roleTags: tagSet.roleTags,
    programTags: tagSet.programTags,
    postedAt: job.postedAt,
    openedAt: job.openedAt,
    deadlineAt: job.deadlineAt,
    isActive: true,
    lastSyncedAt: new Date(),
  };

  const existing = await prisma.jobPosting.findUnique({ where: { dedupeKey: key } });

  if (existing) {
    await prisma.jobPosting.update({ where: { dedupeKey: key }, data: payload });
    return "updated";
  } else {
    await prisma.jobPosting.create({ data: { ...payload, firstSeenAt: new Date() } });
    return "created";
  }
}

export async function runFullSync(providerIds?: string[]): Promise<SyncReport> {
  const startedAt = new Date();
  const providers: JobProvider[] = providerIds
    ? providerIds.map((id) => getProvider(id)).filter((p): p is JobProvider => !!p)
    : ALL_PROVIDERS;

  // Run all providers in parallel
  const results = await Promise.all(providers.map((p) => p.run()));

  let saved = 0;
  let updated = 0;
  const report: SyncReport["providers"] = [];

  for (const result of results) {
    report.push({
      id: result.providerId,
      company: result.companyName,
      fetched: result.jobs.length,
      error: result.error,
    });

    // Upsert jobs sequentially per provider to avoid overwhelming the DB
    for (const job of result.jobs) {
      try {
        const outcome = await upsertJob(job);
        if (outcome === "created") saved++;
        else updated++;
      } catch (err) {
        console.error(`[sync] upsert failed for ${job.companyName} – ${job.title}:`, err);
      }
    }
  }

  const finishedAt = new Date();

  // Deactivate jobs whose source provider is no longer in the registry
  const activeSourceIds = new Set(ALL_PROVIDERS.map((p) => p.id));
  await prisma.jobPosting.updateMany({
    where: { isActive: true, source: { notIn: [...activeSourceIds] } },
    data: { isActive: false },
  });

  // Record the sync run
  await prisma.jobSyncRun.create({
    data: {
      providerId: "full_sync",
      providerLabel: "全量同步",
      syncLabel: `同步 ${providers.length} 家公司`,
      status: "SUCCESS",
      query: "",
      startedAt,
      finishedAt,
      fetchedCount: results.reduce((s, r) => s + r.jobs.length, 0),
      createdCount: saved,
      updatedCount: updated,
      failedCount: results.filter((r) => r.error).length,
      message: `新增 ${saved} 条，更新 ${updated} 条，${results.filter((r) => r.error).length} 家抓取失败`,
    },
  });

  return {
    providers: report,
    totalFetched: results.reduce((s, r) => s + r.jobs.length, 0),
    saved,
    updated,
    startedAt,
    finishedAt,
  };
}
