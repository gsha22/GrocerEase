import { NextResponse } from "next/server";

// Story 5: DELETE /api/alerts/:id — Deactivate alert (shopper auth required)
export async function DELETE() {
  return NextResponse.json({ message: "TODO: Delete alert" }, { status: 501 });
}
