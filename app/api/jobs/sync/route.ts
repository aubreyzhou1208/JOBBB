import { NextResponse } from "next/server";
import { runFullSync } from "@/features/jobs/scrapers/sync-engine";

// Protect with a secret so only the cron job (or you) can trigger it
const SYNC_SECRET = process.env.SYNC_SECRET ?? "dev-secret";

export async function POST(request: Request) {
  const secret = request.headers.get("x-sync-secret") ?? new URL(request.url).searchParams.get("secret");
  if (secret !== SYNC_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({})) as { providerIds?: string[] };
    const report = await runFullSync(body.providerIds);
    return NextResponse.json({ ok: true, report });
  } catch (err) {
    console.error("[sync] fatal error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
