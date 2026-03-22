// Story 1: Fresh Today (Shopper view)
// Story 2: Deals This Week (Shopper view)
// Story 12: No auth required

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

function timeAgo(date: Date): string {
  const ms = Date.now() - new Date(date).getTime();
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return "posted just now";
  if (hours < 24) return `posted ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function isStale(date: Date): boolean {
  return Date.now() - new Date(date).getTime() > 48 * 3_600_000;
}

export default async function StoreProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
          expiresAt: { gt: new Date() },
        },
        orderBy: { expiresAt: "asc" },
      },
    },
  });

  if (!store || !store.isPublished) notFound();

  const hours = store.hours as { open?: string; close?: string } | null;

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] text-gray-400 mb-5">
        <Link href="/" className="text-green-600 hover:underline">
          Discover Stores
        </Link>
        <span className="text-gray-200">›</span>
        <span>{store.name}</span>
      </div>

      {/* Profile hero */}
      <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl border border-gray-200 p-8 flex flex-col sm:flex-row items-start gap-6 mb-6">
        <div className="text-[56px] w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center shrink-0 border-2 border-green-100">
          🏪
        </div>
        <div>
          <h1 className="font-display text-[26px] font-semibold text-gray-800">
            {store.name}
          </h1>
          <p className="text-[14px] text-gray-400 mt-1">
            📍 {store.address}
          </p>
          {hours && (
            <div className="flex gap-2 items-center mt-2 text-[13px]">
              <span className="text-green-600 font-medium">Hours</span>
              <span className="text-gray-400">
                {hours.open} – {hours.close}
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {store.categories.map((tag) => (
              <span
                key={tag}
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  tag === "EBT Accepted"
                    ? "bg-amber-50 text-amber-800"
                    : tag === "Halal"
                      ? "bg-blue-50 text-blue-800"
                      : "bg-green-50 text-green-800"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Fresh Today — Story 1 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <h2 className="text-[17px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
          🌿 Fresh Today
        </h2>
        {store.freshUpdates.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-[42px] mb-3">🫙</div>
            <h3 className="text-[16px] font-semibold text-gray-800 mb-1">
              No recent updates
            </h3>
            <p className="text-[14px] text-gray-400">
              This store hasn&apos;t posted any inventory updates in the last 7
              days.
            </p>
          </div>
        ) : (
          store.freshUpdates.map((update) => (
            <div
              key={update.id}
              className={`flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0 ${
                isStale(update.createdAt) ? "opacity-40" : ""
              }`}
            >
              <div>
                <div className="font-medium text-[15px]">
                  {update.itemName}
                </div>
                {update.note && (
                  <div className="text-[13px] text-gray-400 mt-0.5">
                    {update.note}
                  </div>
                )}
              </div>
              <span
                className={`text-[12px] px-2 py-0.5 rounded-full whitespace-nowrap ml-2 shrink-0 ${
                  isStale(update.createdAt)
                    ? "bg-gray-100 text-gray-400"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {timeAgo(update.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Deals This Week — Story 2 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-[17px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
          🏷 Deals This Week
        </h2>
        {store.deals.length === 0 ? (
          <p className="text-[14px] text-gray-400 py-4">
            No active deals right now. Check back next week.
          </p>
        ) : (
          store.deals.map((deal) => (
            <div
              key={deal.id}
              className="flex gap-3.5 p-3.5 bg-amber-50 rounded-xl border border-amber-100 mb-2.5 last:mb-0"
            >
              <span className="text-[22px]">🏷</span>
              <div>
                <div className="font-semibold text-[15px] text-gray-800">
                  {deal.title}
                </div>
                {deal.description && (
                  <div className="text-[13px] text-gray-600 mt-0.5">
                    {deal.description}
                  </div>
                )}
                <div className="text-[12px] text-amber-400 font-medium mt-1">
                  Expires{" "}
                  {new Date(deal.expiresAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
