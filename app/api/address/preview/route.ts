import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocode-address";
import { requireOwnerSession } from "@/lib/require-owner-session";

/** Preview lat/lng for the store profile map (owner-only; uses server geocoding). */
export async function POST(req: NextRequest) {
  const gate = await requireOwnerSession();
  if (!gate.ok) return gate.response;

  const body = await req.json().catch(() => null);
  const address =
    body && typeof body === "object" && typeof (body as { address?: unknown }).address === "string"
      ? (body as { address: string }).address.trim()
      : "";

  if (address.length < 5) {
    return NextResponse.json({ error: "Address too short" }, { status: 400 });
  }

  const { lat, lng } = await geocodeAddress(address);
  return NextResponse.json({ lat, lng });
}
