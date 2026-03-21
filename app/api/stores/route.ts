import { NextResponse } from "next/server";

// Story 3: GET /api/stores?lat=&lng=&radius= — List stores sorted by distance
// Story 4: GET /api/stores?category=asian,halal — Filter by specialty (AND logic)
export async function GET() {
  return NextResponse.json({ message: "TODO: List/filter stores" }, { status: 501 });
}

// Story 7: POST /api/stores — Create store profile (triggers geocoding)
export async function POST() {
  return NextResponse.json({ message: "TODO: Create store" }, { status: 501 });
}
