import { NextResponse } from "next/server";

// Story 5: GET /api/alerts — List own active alerts (shopper auth required)
export async function GET() {
  return NextResponse.json({ message: "TODO: List alerts" }, { status: 501 });
}

// Story 5: POST /api/alerts — Create alert (item_restock or store_follow)
export async function POST() {
  return NextResponse.json({ message: "TODO: Create alert" }, { status: 501 });
}
