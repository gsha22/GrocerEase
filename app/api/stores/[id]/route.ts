import type { Prisma } from "@/app/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocode-address";
import { prisma } from "@/lib/prisma";
import { requireStoreOwnerForStore } from "@/lib/require-store-owner";
import { validateStoreProfilePatch } from "@/lib/store-profile";

// Story 3: GET /api/stores/:id — Get single store profile
// Story 12: No auth required
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      freshUpdates: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      deals: {
        where: {
          deletedAt: null,
          isExpired: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { expiresAt: "asc" },
      },
    },
  });

  if (!store || !store.isPublished) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json(store);
}

// Story 7: PATCH /api/stores/:id — Update store profile (owner only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: storeId } = await params;
  const gate = await requireStoreOwnerForStore(storeId);
  if ("response" in gate) return gate.response;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = validateStoreProfilePatch(body as Record<string, unknown>);
  if (!validated.ok) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: validated.errors },
      { status: 400 }
    );
  }

  const patch: Prisma.StoreUpdateInput = {};
  const v = validated.data;
  if (v.name !== undefined) patch.name = v.name;
  if (v.address !== undefined) patch.address = v.address;
  if (v.hours !== undefined) patch.hours = v.hours as Prisma.InputJsonValue;
  if (v.categories !== undefined) patch.categories = v.categories;
  if (v.isPublished !== undefined) patch.isPublished = v.isPublished;

  const nextPublished = (patch.isPublished as boolean | undefined) ?? gate.store.isPublished;
  const togglingToPublished = patch.isPublished === true && !gate.store.isPublished;
  const nextAddress = (patch.address as string | undefined) ?? gate.store.address;
  const nextCategories = (patch.categories as string[] | undefined) ?? gate.store.categories;
  const nextHours =
    (patch.hours as Prisma.InputJsonValue | undefined) ?? (gate.store.hours as Prisma.JsonValue);

  if (
    togglingToPublished &&
    (!nextAddress || !nextHours || !Array.isArray(nextCategories) || nextCategories.length === 0)
  ) {
    return NextResponse.json(
      {
        error:
          "Published profiles require address, hours, and at least one specialty category.",
      },
      { status: 400 }
    );
  }

  const shouldGeocode = Boolean(nextPublished && patch.address);
  if (shouldGeocode) {
    const coords = await geocodeAddress(nextAddress);
    patch.lat = coords.lat;
    patch.lng = coords.lng;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update." },
      { status: 400 }
    );
  }

  const updated = await prisma.store.update({
    where: { id: storeId },
    data: patch,
  });

  return NextResponse.json({ store: updated });
}