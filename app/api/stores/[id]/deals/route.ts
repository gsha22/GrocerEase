import { NextResponse } from "next/server";

// Story 2: GET /api/stores/:id/deals — List active deals (expires_at > now)
// Story 9: GET /api/stores/:id/deals?all=true — List all deals including past (owner, for reuse)
export async function GET() {
  return NextResponse.json({ message: "TODO: List deals" }, { status: 501 });
}

// Story 8: POST /api/stores/:id/deals — Create deal (or duplicate via source_deal_id)
// Story 9: POST with source_deal_id copies fields from original deal
export async function POST() {
  return NextResponse.json({ message: "TODO: Create deal" }, { status: 501 });
}
