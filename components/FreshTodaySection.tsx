"use client";

import { useEffect, useState } from "react";
import { relativeTime, freshnessLevel } from "@/lib/time";

interface FreshUpdate {
  id: string;
  itemName: string;
  note: string | null;
  createdAt: string;
  isStale: boolean;
}

interface Props {
  storeId: string;
}

export default function FreshTodaySection({ storeId }: Props) {
  const [updates, setUpdates] = useState<FreshUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const res = await fetch(`/api/stores/${storeId}/updates`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (cancelled) return;
      setUpdates(data.updates ?? []);
      setError(false);
    };

    (async () => {
      try {
        await load();
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const source = new EventSource(`/api/stores/${storeId}/posts/events`);
    const refresh = () => {
      void load().catch(() => {
        if (!cancelled) setError(true);
      });
    };
    source.addEventListener("POST_UPDATE", refresh);
    source.addEventListener("POST_DELETE", refresh);
    source.onerror = () => {
      source.close();
    };

    return () => {
      cancelled = true;
      source.removeEventListener("POST_UPDATE", refresh);
      source.removeEventListener("POST_DELETE", refresh);
      source.close();
    };
  }, [storeId]);

  if (loading) return <FreshTodaySkeleton />;
  if (error) return null;

  const visible = updates.filter(
    (u) => freshnessLevel(u.createdAt) !== "hidden",
  );

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
      <h2 className="text-[17px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🌿 Fresh Today
      </h2>

      {visible.length === 0 ? (
        <EmptyState />
      ) : (
        visible.map((update) => {
          const level = freshnessLevel(update.createdAt);
          const stale = level === "stale";

          return (
            <div
              key={update.id}
              className={`flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0 ${
                stale ? "opacity-45" : ""
              }`}
            >
              <div>
                <div
                  className={`font-medium ${stale ? "text-[13px]" : "text-[15px]"}`}
                >
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
                  stale
                    ? "bg-gray-100 text-gray-400"
                    : "text-green-600 bg-green-50"
                }`}
              >
                {relativeTime(update.createdAt)}
              </span>
            </div>
          );
        })
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8 px-5">
      <div className="text-[52px] mb-4">🫙</div>
      <h3 className="text-[18px] font-semibold text-gray-800 mb-2">
        No recent updates
      </h3>
      <p className="text-[14px] text-gray-400 max-w-[300px] mx-auto">
        This store hasn&apos;t posted any inventory updates in the last 7 days.
        Check back soon.
      </p>
    </div>
  );
}

function FreshTodaySkeleton() {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
      <div className="h-5 w-32 bg-gray-100 rounded animate-pulse mb-4" />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0"
        >
          <div className="flex-1">
            <div className="h-4 w-2/5 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-3 w-3/5 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse ml-2 shrink-0" />
        </div>
      ))}
    </section>
  );
}
