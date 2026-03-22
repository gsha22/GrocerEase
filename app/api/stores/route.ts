import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type StoreResult = {
  id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  categories: string[];
  hours: unknown;
  isPublished?: boolean;
  is_published?: boolean;
  createdAt?: Date;
  created_at?: Date;
  distance_miles?: number;
};

// Story 3: GET /api/stores?lat=&lng=&radius=&category=
// Story 12: No auth required
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radiusMiles = parseFloat(searchParams.get("radius") ?? "10");
  const categoryParam = searchParams.get("category");

  const categories = categoryParam
    ? categoryParam.split(",").map((c) => c.trim())
    : [];

  let stores: StoreResult[];

  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    stores = await prisma.$queryRawUnsafe<StoreResult[]>(
      `
      SELECT * FROM (
        SELECT *,
          (3959 * acos(
            cos(radians($1)) * cos(radians(lat)) *
            cos(radians(lng) - radians($2)) +
            sin(radians($1)) * sin(radians(lat))
          )) AS distance_miles
        FROM stores
        WHERE is_published = true
      ) AS s
      WHERE distance_miles <= $3
      ORDER BY distance_miles ASC
      `,
      userLat,
      userLng,
      radiusMiles
    );
  } else {
    const rows = await prisma.store.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
    stores = rows as unknown as StoreResult[];
  }

  if (categories.length > 0) {
    stores = stores.filter((store) =>
      categories.every((cat) =>
        (store.categories ?? []).some(
          (sc) => sc.toLowerCase() === cat.toLowerCase()
        )
      )
    );
  }

  const result = stores.map((store) => ({
    id: store.id,
    name: store.name,
    address: store.address,
    lat: store.lat,
    lng: store.lng,
    categories: store.categories,
    hours: store.hours,
    isPublished: store.is_published ?? store.isPublished,
    createdAt: store.created_at ?? store.createdAt,
    distanceMiles:
      store.distance_miles != null
        ? Math.round(store.distance_miles * 10) / 10
        : null,
  }));

  return NextResponse.json(result);
}

// Story 7: POST /api/stores — Create store profile (triggers geocoding)
export async function POST() {
  return NextResponse.json({ message: "TODO: Create store" }, { status: 501 });
}
