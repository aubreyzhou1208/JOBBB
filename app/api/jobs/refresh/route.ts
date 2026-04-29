import { NextResponse } from "next/server";

import { runJobSync } from "@/features/jobs/job-sync-service";
import { JobProviderId } from "@/features/jobs/providers/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    query?: string;
    providerIds?: JobProviderId[];
  };

  const providerIds: JobProviderId[] = body.providerIds?.length ? body.providerIds : ["campus_portal_live"];
  const query = body.query ?? "";

  try {
    const payload = await runJobSync({
      query,
      providerIds,
      providerLabel: "企业校招官网",
      syncLabel: "刷新岗位库"
    });

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      {
        error: "岗位库刷新失败"
      },
      { status: 500 }
    );
  }
}
