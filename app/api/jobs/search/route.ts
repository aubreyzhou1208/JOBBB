import { NextResponse } from "next/server";

import { searchChinaCampusLiveSources, searchChinaWechatSources } from "@/features/jobs/providers/china-campus-live-provider";
import { chinaCampusMockProvider } from "@/features/jobs/providers/china-campus-mock-provider";
import { greenhouseMockProvider } from "@/features/jobs/providers/greenhouse-mock-provider";
import { leverMockProvider } from "@/features/jobs/providers/lever-mock-provider";
import { searchGreenhouseLiveSources } from "@/features/jobs/providers/greenhouse-live-provider";
import { searchLeverLiveSources } from "@/features/jobs/providers/lever-live-provider";
import { JobProviderId } from "@/features/jobs/providers/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    query?: string;
    providerIds?: JobProviderId[];
  };

  const query = body.query ?? "";
  const providerIds = body.providerIds ?? [];

  const results = await Promise.all(
    providerIds.map(async (providerId) => {
      if (providerId === "greenhouse_live") {
        return searchGreenhouseLiveSources(query);
      }

      if (providerId === "lever_live") {
        return searchLeverLiveSources(query);
      }

      if (providerId === "campus_portal_live") {
        return searchChinaCampusLiveSources(query);
      }

      if (providerId === "campus_wechat_live") {
        return searchChinaWechatSources(query);
      }

      if (providerId === "greenhouse_mock") {
        return greenhouseMockProvider.search({ query });
      }

      if (providerId === "campus_portal_mock") {
        return chinaCampusMockProvider.search({ query });
      }

      return leverMockProvider.search({ query });
    })
  );

  return NextResponse.json({
    results,
    totalJobs: results.reduce((sum, result) => sum + result.jobs.length, 0)
  });
}
