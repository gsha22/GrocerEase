import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { geocodeAddress } from "@/lib/geocode-address";
import { prisma } from "@/lib/prisma";
import { validateStoreProfileCreate } from "@/lib/store-profile";

type StoreResult = {
  id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  categories: string[];
  hours: unknown;
  is_published?: boolean;
  isPublished?: boolean;
  created_at?: Date;
  createdAt?: Date;
  distance_miles?: number;
};

// Story 3: GET /api/stores?lat=&lng=&radius= — sorted by distance (Haversine)
// Story 4: GET /api/stores?category=asian,halal — filter by specialty (AND logic)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radiusMiles = parseFloat(searchParams.get("radius") ?? "10");
    const categoryParam = searchParams.get("category");

    const categories = categoryParam
      ? categoryParam.split(",").map((c) => c.trim().toLowerCase()).filter(Boolean)
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
        orderBy: { name: "asc" },
      });
      stores = rows as unknown as StoreResult[];
    }

    if (categories.length > 0) {
      stores = stores.filter((store) =>
        categories.every((cat) =>
          (store.categories ?? []).some(
            (sc) => sc.toLowerCase() === cat
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
      distanceMiles:
        store.distance_miles != null
          ? Math.round(store.distance_miles * 10) / 10
          : null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/stores error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 },
    );
  }
}

// Story 7: POST /api/stores — Create store profile (triggers geocoding)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const validated = validateStoreProfileCreate(body);
  if (!validated.ok) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: validated.errors },
      { status: 400 }
    );
  }

  const existing = await prisma.store.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Store already exists for this owner." },
      { status: 409 }
    );
  }

  const coords = await geocodeAddress(validated.data.address);

  const store = await prisma.store.create({
    data: {
      ownerId: session.user.id,
      name: validated.data.name,
      address: validated.data.address,
      hours: validated.data.hours,
      categories: validated.data.categories,
      isPublished: true,
      lat: coords.lat,
      lng: coords.lng,
    },
  });

  return NextResponse.json({ store }, { status: 201 });
}
