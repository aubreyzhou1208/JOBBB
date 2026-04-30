import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [
    totalJobs,
    byEmploymentType,
    byCompany,
    lastSync,
    recentJobs,
  ] = await Promise.all([
    prisma.jobPosting.count({ where: { isActive: true } }),

    prisma.jobPosting.groupBy({
      by: ["employmentType"],
      where: { isActive: true },
      _count: { _all: true },
    }),

    prisma.jobPosting.groupBy({
      by: ["companyName"],
      where: { isActive: true },
      _count: { _all: true },
      orderBy: { _count: { companyName: "desc" } },
      take: 15,
    }),

    prisma.jobSyncRun.findFirst({
      orderBy: { createdAt: "desc" },
    }),

    prisma.jobPosting.findMany({
      where: { isActive: true },
      orderBy: { deadlineAt: "asc" },
      take: 5,
      select: {
        id: true, companyName: true, title: true, location: true,
        employmentType: true, deadlineAt: true, applyUrl: true,
        roleTags: true, programTags: true,
      },
    }),
  ]);

  return NextResponse.json({
    totalJobs,
    byEmploymentType: byEmploymentType.map((r) => ({
      type: r.employmentType,
      count: r._count._all,
    })),
    byCompany: byCompany.map((r) => ({
      company: r.companyName,
      count: r._count._all,
    })),
    lastSync: lastSync
      ? {
          startedAt: lastSync.startedAt,
          finishedAt: lastSync.finishedAt,
          message: lastSync.message,
          status: lastSync.status,
          fetchedCount: lastSync.fetchedCount,
          createdCount: lastSync.createdCount,
          updatedCount: lastSync.updatedCount,
        }
      : null,
    recentJobs,
  });
}
