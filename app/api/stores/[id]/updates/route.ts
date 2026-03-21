import { NextResponse } from "next/server";

// Story 1: GET /api/stores/:id/updates — List fresh updates (newest first, 48h staleness)
export async function GET() {
  return NextResponse.json({ message: "TODO: List fresh updates" }, { status: 501 });
}

// Story 11: POST /api/stores/:id/updates — Post a fresh update (item_name required)
export async function POST() {
  return NextResponse.json({ message: "TODO: Create fresh update" }, { status: 501 });
}
