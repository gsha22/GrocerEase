import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FRESH_UPDATE_PUBLIC_WINDOW_MS } from "@/lib/fresh-updates";
import { requireStoreOwnerForStore } from "@/lib/require-store-owner";

const MAX_RESULTS = 50;
const MAX_CANDIDATES = 250;

function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const row = new Array(b.length + 1).fill(0);
  for (let j = 0; j <= b.length; j += 1) {
    row[j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    let previousDiagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cached = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previousDiagonal + cost);
      previousDiagonal = cached;
    }
  }

  return row[b.length];
}

// Story 5: GET /api/stores/:id/items?q=bok+choy — Search items with fuzzy matching
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storeId } = await params;
    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    const location = req.nextUrl.searchParams.get("location")?.trim() ?? "";

    if (q.length === 0) {
      return NextResponse.json([]);
    }

    const query = normalizeForSearch(q);
    if (query.length === 0) {
      return NextResponse.json([]);
    }

    const windowStart = new Date(Date.now() - FRESH_UPDATE_PUBLIC_WINDOW_MS);
    const hasActiveFreshUpdate = {
      some: { deletedAt: null, createdAt: { gte: windowStart } },
    };
    const freshUpdateSelect = {
      where: { deletedAt: null, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "desc" as const },
      take: 1,
      select: { createdAt: true },
    };

    const [store, directMatches, broadMatches] = await Promise.all([
      prisma.store.findUnique({
        where: { id: storeId },
        select: { id: true, address: true, name: true, isPublished: true },
      }),
      prisma.item.findMany({
        where: {
          storeId,
          freshUpdates: hasActiveFreshUpdate,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          inStock: true,
          lastUpdated: true,
          freshUpdates: freshUpdateSelect,
          store: { select: { id: true, name: true, address: true } },
        },
        take: MAX_CANDIDATES,
      }),
      prisma.item.findMany({
        where: { storeId, freshUpdates: hasActiveFreshUpdate },
        select: {
          id: true,
          name: true,
          inStock: true,
          lastUpdated: true,
          freshUpdates: freshUpdateSelect,
          store: { select: { id: true, name: true, address: true } },
        },
        take: MAX_CANDIDATES,
      }),
    ]);

    if (!store || !store.isPublished) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    void prisma.storeItemSearch
      .create({
        data: { storeId, query: query.slice(0, 200) },
      })
      .catch(() => undefined);

    const locationQuery = normalizeForSearch(location);
    if (
      locationQuery &&
      !normalizeForSearch(`${store.name} ${store.address}`).includes(locationQuery)
    ) {
      return NextResponse.json([]);
    }

    const deduped = new Map<string, (typeof directMatches)[number]>();
    for (const item of [...directMatches, ...broadMatches]) {
      deduped.set(item.id, item);
    }

    const scored = Array.from(deduped.values())
      .map((item) => {
        const normalizedName = normalizeForSearch(item.name);
        const tokenDistances = normalizedName
          .split(" ")
          .filter(Boolean)
          .map((token) => levenshteinDistance(query, token));

        const fullDistance = levenshteinDistance(query, normalizedName);
        const minDistance = Math.min(fullDistance, ...tokenDistances);
        const includesQuery = normalizedName.includes(query);

        return {
          ...item,
          matchScore: includesQuery ? 0 : minDistance,
        };
      })
      .filter((item) => item.matchScore <= 2 || normalizeForSearch(item.name).includes(query))
      .sort((a, b) => {
        if (a.matchScore !== b.matchScore) return a.matchScore - b.matchScore;
        if (a.inStock !== b.inStock) return Number(b.inStock) - Number(a.inStock);
        return a.name.localeCompare(b.name);
      })
      .slice(0, MAX_RESULTS)
      .map((item) => ({
        id: item.id,
        name: item.name,
        stock_count: item.inStock ? 1 : 0,
        in_stock: item.inStock,
        store_id: item.store.id,
        store_name: item.store.name,
        store_location: item.store.address,
        last_updated: (item.freshUpdates[0]?.createdAt ?? item.lastUpdated).toISOString(),
      }));

    return NextResponse.json(scored);
  } catch (error) {
    console.error("GET /api/stores/:id/items error:", error);
    return NextResponse.json(
      { error: "Failed to search store items" },
      { status: 500 }
    );
  }
}

// Story 7: POST /api/stores/:id/items — Create an item (store owner only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: storeId } = await params;
  const gate = await requireStoreOwnerForStore(storeId);
  if ("response" in gate) return gate.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const name = typeof o.name === "string" ? o.name.trim() : "";
  if (!name) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: { name: "Item name is required." } },
      { status: 400 },
    );
  }
  if (name.length > 200) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: { name: "Name must be at most 200 characters." } },
      { status: 400 },
    );
  }

  const descriptionRaw = typeof o.description === "string" ? o.description.trim() : "";
  const description = descriptionRaw.length > 0 ? descriptionRaw : null;
  const inStock = typeof o.inStock === "boolean" ? o.inStock : true;

  const item = await prisma.item.create({
    data: {
      storeId: gate.store.id,
      name,
      description,
      inStock,
    },
    select: {
      id: true,
      name: true,
      description: true,
      inStock: true,
      lastUpdated: true,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
