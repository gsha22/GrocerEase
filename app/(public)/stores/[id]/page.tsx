import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DealsThisWeekSection from "@/components/DealsThisWeekSection";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StoreProfilePage({ params }: Props) {
  const { id } = await params;

  const store = await prisma.store.findUnique({
    where: { id, isPublished: true },
    select: {
      id: true,
      name: true,
      address: true,
      hours: true,
      categories: true,
    },
  });

  if (!store) notFound();

  const hours = store.hours as { open?: string; close?: string } | null;
  const isOpen = getOpenStatus(hours);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] text-gray-400 mb-5">
        <a href="/" className="text-green-600 hover:underline">
          Discover Stores
        </a>
        <span className="text-gray-200">&rsaquo;</span>
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
              <span
                className={
                  isOpen
                    ? "text-green-600 font-medium"
                    : "text-gray-400 font-medium"
                }
              >
                {isOpen ? "Open now" : "Closed"}
              </span>
              {hours.close && (
                <span className="text-gray-400">
                  &middot; {isOpen ? `Closes ${hours.close}` : `Opens ${hours.open}`}
                </span>
              )}
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

      {/* Fresh Today — Story 1 (placeholder, implemented on story-1 branch) */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <h2 className="text-[17px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
          🌿 Fresh Today
        </h2>
        <p className="text-[14px] text-gray-400 py-4">
          No recent updates. Check back soon.
        </p>
      </section>

      {/* Deals This Week — Story 2 */}
      <DealsThisWeekSection storeId={store.id} />
    </div>
  );
}

function getOpenStatus(
  hours: { open?: string; close?: string } | null,
): boolean {
  if (!hours?.open || !hours?.close) return false;
  const now = new Date();
  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);
  const currentMins = now.getHours() * 60 + now.getMinutes();
  return currentMins >= openH * 60 + openM && currentMins < closeH * 60 + closeM;
}
