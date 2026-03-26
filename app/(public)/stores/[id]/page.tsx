// Story 1: Fresh Today (Shopper view)
// Story 2: Deals This Week (Shopper view)
// Story 12: No auth required

import DealCard from "@/components/DealCard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ItemAvailabilitySearch from "@/components/ItemAvailabilitySearch";
import FreshTodaySection from "@/components/FreshTodaySection";

export default async function StoreProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const store = await prisma.store.findUnique({
    where: { id },
    include: {
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
      <div className="bg-linear-to-br from-green-50 to-white rounded-3xl border border-gray-200 p-8 flex flex-col sm:flex-row items-start gap-6 mb-6">
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
          {store.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {store.categories.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-800 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <ItemAvailabilitySearch
        storeId={store.id}
        storeName={store.name}
        storeAddress={store.address}
      />

      <FreshTodaySection storeId={store.id} />

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
            <DealCard
              key={deal.id}
              deal={{
                id: deal.id,
                title: deal.title,
                description: deal.description,
                price: deal.price != null ? deal.price.toString() : null,
                expiresAt: deal.expiresAt.toISOString(),
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
