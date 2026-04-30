import { NextResponse } from "next/server";
import { runFullSync } from "@/features/jobs/scrapers/sync-engine";

// No-auth endpoint for UI-triggered syncs (same origin only)
export async function POST() {
  try {
    const report = await runFullSync();
    return NextResponse.json({ ok: true, report });
  } catch (err) {
    console.error("[trigger] fatal error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
