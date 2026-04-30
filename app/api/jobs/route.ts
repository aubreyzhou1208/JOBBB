import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? "";
  const employmentType = searchParams.get("employmentType") ?? "";
  const regionTag = searchParams.get("regionTag") ?? "";
  const roleTag = searchParams.get("roleTag") ?? "";
  const programTag = searchParams.get("programTag") ?? "";
  const company = searchParams.get("company") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(500, Number(searchParams.get("pageSize") ?? 50));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    isActive: true,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(employmentType && { employmentType: employmentType as "INTERN" | "NEW_GRAD" | "FULL_TIME" | "CONTRACT" }),
    ...(company && { companyName: { contains: company, mode: "insensitive" } }),
    ...(regionTag && { regionTags: { has: regionTag } }),
    ...(roleTag && { roleTags: { has: roleTag } }),
    ...(programTag && { programTags: { has: programTag } }),
  };

  const [total, jobs] = await Promise.all([
    prisma.jobPosting.count({ where }),
    prisma.jobPosting.findMany({
      where,
      orderBy: { lastSyncedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        dedupeKey: true,
        companyName: true,
        title: true,
        location: true,
        workMode: true,
        employmentType: true,
        salaryRange: true,
        tags: true,
        normalizedTags: true,
        regionTags: true,
        roleTags: true,
        programTags: true,
        postedAt: true,
        openedAt: true,
        deadlineAt: true,
        applyUrl: true,
        source: true,
        sourceType: true,
        summary: true,
        rawDescription: true,
        firstSeenAt: true,
        lastSyncedAt: true,
      },
    }),
  ]);

  return NextResponse.json({ jobs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}
