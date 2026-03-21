import { NextResponse } from "next/server";

// Story 3: GET /api/stores/:id — Get single store profile
export async function GET() {
  return NextResponse.json({ message: "TODO: Get store by ID" }, { status: 501 });
}

// Story 7: PATCH /api/stores/:id — Update store profile (owner only)
export async function PATCH() {
  return NextResponse.json({ message: "TODO: Update store" }, { status: 501 });
}
