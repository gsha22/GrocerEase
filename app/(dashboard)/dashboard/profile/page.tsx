import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import StoreProfileForm from "./StoreProfileForm";

function parseHHmm(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const m = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

export default async function StoreProfileEditPage() {
  const session = await auth();
  const ownerId = session?.user?.id ?? "";
  const existingStore = ownerId
    ? await prisma.store.findUnique({
        where: { ownerId },
        select: {
          id: true,
          name: true,
          address: true,
          categories: true,
          hours: true,
          isPublished: true,
          lat: true,
          lng: true,
        },
      })
    : null;

  const rawHours =
    existingStore?.hours && typeof existingStore.hours === "object"
      ? (existingStore.hours as { open?: unknown; close?: unknown })
      : {};
  const initial = existingStore
    ? {
        id: existingStore.id,
        name: existingStore.name,
        address: existingStore.address,
        categories: existingStore.categories,
        open: parseHHmm(rawHours.open) ?? "",
        close: parseHHmm(rawHours.close) ?? "",
        isPublished: existingStore.isPublished,
        lat: existingStore.lat,
        lng: existingStore.lng,
      }
    : null;

  return (
    <div className="max-w-[600px] overflow-visible">
      <div className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Owner portal
        </p>
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Store profile
        </h1>
        <p className="text-[15px] text-gray-600 mt-1.5">
          Shoppers see this on the directory and your store page.
        </p>
        <Link href="/" className="inline-flex mt-3 text-[13px] text-green-600 font-medium hover:text-green-800">
          ← Back to site
        </Link>
      </div>
      <StoreProfileForm initial={initial} />
    </div>
  );
}
