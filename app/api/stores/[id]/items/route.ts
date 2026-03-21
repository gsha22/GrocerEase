import { NextResponse } from "next/server";

// Story 5: GET /api/stores/:id/items?q=bok+choy — Search items with fuzzy matching
export async function GET() {
  return NextResponse.json({ message: "TODO: Search items" }, { status: 501 });
}

// Story 7: POST /api/stores/:id/items — Create an item
export async function POST() {
  return NextResponse.json({ message: "TODO: Create item" }, { status: 501 });
}
