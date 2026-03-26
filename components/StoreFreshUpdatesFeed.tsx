"use client";

import { useCallback, useEffect, useState } from "react";
import { relativeTime } from "@/lib/time";

type FreshUpdate = {
  id: string;
  itemName: string;
  note: string | null;
  createdAt: string;
  isStale: boolean;
};

type ApiResponse = { updates?: FreshUpdate[] };

export default function StoreFreshUpdatesFeed({
  storeId,
  initialUpdates,
}: {
  storeId: string;
  initialUpdates: FreshUpdate[];
}) {
  const [updates, setUpdates] = useState<FreshUpdate[]>(initialUpdates);

  const reload = useCallback(async () => {
    const res = await fetch(`/api/stores/${storeId}/updates`, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = (await res.json()) as ApiResponse;
    setUpdates(data.updates ?? []);
  }, [storeId]);

  useEffect(() => {
    const es = new EventSource(`/api/stores/${storeId}/posts/events`);
    const onPostEvent = () => {
      void reload();
    };
    es.addEventListener("post-event", onPostEvent);
    es.onerror = () => {
      es.close();
    };
    return () => {
      es.removeEventListener("post-event", onPostEvent);
      es.close();
    };
  }, [reload, storeId]);

  if (updates.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-[42px] mb-3">🫙</div>
        <h3 className="text-[16px] font-semibold text-gray-800 mb-1">
          No recent updates
        </h3>
        <p className="text-[14px] text-gray-400">
          This store hasn&apos;t posted any inventory updates in the last 7 days.
        </p>
      </div>
    );
  }

  return (
    <>
      {updates.map((update) => (
        <div
          key={update.id}
          className={`flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0 ${
            update.isStale ? "opacity-40" : ""
          }`}
        >
          <div>
            <div className="font-medium text-[15px]">{update.itemName}</div>
            {update.note && (
              <div className="text-[13px] text-gray-400 mt-0.5">{update.note}</div>
            )}
          </div>
          <span
            className={`text-[12px] px-2 py-0.5 rounded-full whitespace-nowrap ml-2 shrink-0 ${
              update.isStale
                ? "bg-gray-100 text-gray-400"
                : "bg-green-50 text-green-600"
            }`}
          >
            {relativeTime(update.createdAt) ?? "—"}
          </span>
        </div>
      ))}
    </>
  );
}
