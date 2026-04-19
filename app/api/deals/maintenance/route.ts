import { NextResponse } from "next/server";
import { runDealMaintenance } from "@/lib/deal-maintenance";

export const dynamic = "force-dynamic";

/** Minimum time between full maintenance runs per server instance (reduces load when many pages load at once). */
const THROTTLE_MS = 4 * 60 * 1000;

let lastRunAt = 0;

/**
 * Traffic-driven deal maintenance: marks expired deals and sends expiring-soon owner notifications.
 * Safe to call from the browser; work is throttled so regular traffic does not hammer the database.
 */
export async function GET() {
  const now = Date.now();
  const elapsed = now - lastRunAt;
  if (elapsed < THROTTLE_MS && lastRunAt > 0) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "throttled",
      retryAfterMs: THROTTLE_MS - elapsed,
    });
  }

  lastRunAt = now;

  try {
    const result = await runDealMaintenance();
    return NextResponse.json({
      ok: true,
      ...result,
      ranAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET /api/deals/maintenance:", error);
    lastRunAt = 0;
    return NextResponse.json(
      { ok: false, error: "Deal maintenance failed" },
      { status: 500 },
    );
  }
}
