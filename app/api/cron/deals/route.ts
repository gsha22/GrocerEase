import { NextRequest, NextResponse } from "next/server";
import { runDealMaintenance } from "@/lib/deal-maintenance";

export const dynamic = "force-dynamic";

function authorizeCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) {
    return true;
  }
  if (process.env.VERCEL === "1" && req.headers.get("x-vercel-cron") === "1") {
    return true;
  }
  return false;
}

export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDealMaintenance();
  return NextResponse.json({ ok: true, ...result });
}
