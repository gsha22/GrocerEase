"use client";

import { useEffect, useState } from "react";
import DealCard, { type DealData } from "@/components/DealCard";

interface Props {
  storeId: string;
}

export default function DealsThisWeekSection({ storeId }: Props) {
  const [deals, setDeals] = useState<DealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/stores/${storeId}/deals`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) setDeals(data.deals ?? []);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [storeId]);

  if (loading) return <DealsSkeleton />;
  if (error) return null;

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
      <h2 className="text-[17px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🏷 Deals This Week
      </h2>

      {deals.length === 0 ? (
        <EmptyState />
      ) : (
        deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <p className="text-[14px] text-gray-400 py-4">
      No active deals right now. Check back next week.
    </p>
  );
}

function DealsSkeleton() {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
      <div className="h-5 w-36 bg-gray-100 rounded animate-pulse mb-4" />
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex gap-3.5 p-3.5 bg-amber-50/50 rounded-xl border border-amber-100/50 mb-2.5"
        >
          <div className="w-8 h-8 bg-gray-100 rounded animate-pulse shrink-0" />
          <div className="flex-1">
            <div className="h-4 w-3/5 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-3 w-2/5 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </section>
  );
}
