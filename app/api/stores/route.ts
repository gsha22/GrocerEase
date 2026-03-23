import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Story 3: GET /api/stores?lat=&lng=&radius= — List stores sorted by distance
// Story 4: GET /api/stores?category=asian,halal — Filter by specialty (AND logic)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const categoryParam = searchParams.get("category");

    const requestedTags = categoryParam
      ? categoryParam.split(",").map((c) => c.trim().toLowerCase()).filter(Boolean)
      : [];

    const where: Record<string, unknown> = { isPublished: true };

    if (requestedTags.length > 0) {
      where.AND = requestedTags.map((tag) => ({
        categories: { has: tag },
      }));
    }

    const stores = await prisma.store.findMany({
      where,
      select: {
        id: true,
        name: true,
        address: true,
        lat: true,
        lng: true,
        categories: true,
        hours: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error("GET /api/stores error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 },
    );
  }
}

// Story 7: POST /api/stores — Create store profile (triggers geocoding)
export async function POST() {
  return NextResponse.json({ message: "TODO: Create store" }, { status: 501 });
}
