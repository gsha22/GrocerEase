import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import StoreProfileForm from "./StoreProfileForm";

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
        open: typeof rawHours.open === "string" ? rawHours.open : "08:00",
        close: typeof rawHours.close === "string" ? rawHours.close : "20:00",
        isPublished: existingStore.isPublished,
      }
    : null;

  return (
    <div className="max-w-[600px]">
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
