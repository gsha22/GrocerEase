import Link from "next/link";
import { auth } from "@/auth";
import OwnerDealExpiryAlerts from "@/components/OwnerDealExpiryAlerts";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ManageDealsClient from "./ManageDealsClient";

function getMissingProfileFields(store: {
  name: string;
  address: string;
  hours: unknown;
  categories: string[];
}): string[] {
  const missing: string[] = [];
  if (!store.name?.trim()) missing.push("store name");
  if (!store.address?.trim()) missing.push("store address");
  const hours = store.hours as { open?: unknown; close?: unknown } | null;
  if (!hours || !hours.open || !hours.close) missing.push("store hours");
  if (!Array.isArray(store.categories) || store.categories.length === 0)
    missing.push("specialty category");
  return missing;
}

export default async function ManageDealsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Always look up the store from the database by owner ID so that owners who
  // completed their profile after logging in are not incorrectly blocked by a
  // stale storeId in their session JWT (fixes #163).
  const store = await prisma.store.findUnique({
    where: { ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      address: true,
      hours: true,
      categories: true,
      isPublished: true,
    },
  });

  const pageHeader = (
    <div className="mb-7">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
        Owner portal
      </p>
      <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
        Deals
      </h1>
    </div>
  );

  if (!store) {
    return (
      <div className="max-w-[700px]">
        {pageHeader}
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-900">
          <p className="font-semibold mb-1">Store profile required</p>
          <p>
            You need to create your store profile before you can post deals.{" "}
            <Link
              href="/dashboard/profile"
              className="font-medium text-amber-800 underline hover:text-amber-950"
            >
              Set up your store profile →
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const missingFields = getMissingProfileFields(store);
  if (missingFields.length > 0) {
    return (
      <div className="max-w-[700px]">
        {pageHeader}
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-900">
          <p className="font-semibold mb-1">Your store profile must be complete before posting deals.</p>
          <p className="mb-2">
            Missing:{" "}
            <span className="font-medium">{missingFields.join(", ")}</span>.
          </p>
          <Link
            href="/dashboard/profile"
            className="font-medium text-amber-800 underline hover:text-amber-950"
          >
            Complete your store profile →
          </Link>
        </div>
      </div>
    );
  }

  const alerts = await prisma.ownerNotification.findMany({
    where: {
      ownerId: session.user.id,
      readAt: null,
      kind: "deal_expiring_soon",
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="max-w-[700px]">
      <div className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Owner portal
        </p>
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Deals
        </h1>
        <p className="text-[15px] text-gray-600 mt-1.5">
          Create promotions shoppers see on your store and the deals feed.
        </p>
      </div>

      <OwnerDealExpiryAlerts
        initial={alerts.map((a) => ({ id: a.id, message: a.message }))}
      />
      <ManageDealsClient storeId={store.id} />
    </div>
  );
}
