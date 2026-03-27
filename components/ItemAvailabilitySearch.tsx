"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ViewerRole } from "@/lib/viewer-role";

type SearchResult = {
  id: string;
  name: string;
  stock_count: number;
  in_stock: boolean;
  store_id: string;
  store_name: string;
  store_location: string;
  last_updated: string;
};

type AlertRow = {
  id: string;
  itemId: string | null;
  storeId: string | null;
  type: string;
};

function normalizeAlertsPayload(payload: unknown): AlertRow[] {
  if (Array.isArray(payload)) return payload as AlertRow[];
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { alerts?: unknown }).alerts)
  ) {
    return (payload as { alerts: AlertRow[] }).alerts;
  }
  return [];
}

type Props = {
  storeId: string;
  storeName: string;
  storeAddress: string;
  viewerRole?: ViewerRole;
};

function toRelativeTime(isoDate: string): string {
  const timestamp = new Date(isoDate).getTime();
  if (Number.isNaN(timestamp)) return "updated recently";

  const diffMs = timestamp - Date.now();
  const absMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absMs < hour) {
    const minutes = Math.max(1, Math.round(diffMs / minute));
    return rtf.format(minutes, "minute");
  }
  if (absMs < day) {
    const hours = Math.round(diffMs / hour);
    return rtf.format(hours, "hour");
  }
  const days = Math.round(diffMs / day);
  return rtf.format(days, "day");
}

export default function ItemAvailabilitySearch({
  storeId,
  storeName,
  storeAddress,
  viewerRole,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notifyByItemId, setNotifyByItemId] = useState<Record<string, boolean>>(
    {}
  );
  const [authRequired, setAuthRequired] = useState(false);

  const hasQuery = query.trim().length > 0;
  const queryHint = useMemo(() => (hasQuery ? query.trim() : ""), [hasQuery, query]);

  const loginHref = `/login?callbackUrl=${encodeURIComponent(`/stores/${storeId}`)}`;

  useEffect(() => {
    if (results.length === 0) return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/alerts", { credentials: "include" });
      if (cancelled) return;
      if (res.status === 401) {
        setAuthRequired(true);
        return;
      }
      setAuthRequired(false);
      if (!res.ok) return;
      const alerts = normalizeAlertsPayload(await res.json().catch(() => null));
      setNotifyByItemId((prev) => {
        const next = { ...prev };
        for (const item of results) {
          const on = alerts.some(
            (a) =>
              a.type === "item_restock" &&
              a.itemId === item.id &&
              (a.storeId ?? item.store_id) === item.store_id
          );
          next[item.id] = on;
        }
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [results]);

  async function runSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hasQuery) return;

    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        location: storeAddress,
      });
      const response = await fetch(`/api/stores/${storeId}/items?${params.toString()}`);
      if (!response.ok) {
        setResults([]);
        return;
      }
      const data = (await response.json()) as SearchResult[];
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  async function toggleNotify(item: SearchResult) {
    const probe = await fetch("/api/alerts", { credentials: "include" });
    if (probe.status === 401) {
      setAuthRequired(true);
      return;
    }
    setAuthRequired(false);

    const currentlyOn = Boolean(notifyByItemId[item.id]);
    if (!currentlyOn) {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: "item_restock",
          itemId: item.id,
          storeId: item.store_id,
        }),
      });
      if (res.ok) {
        setNotifyByItemId((prev) => ({ ...prev, [item.id]: true }));
      }
      return;
    }

    const listRes = await fetch("/api/alerts", { credentials: "include" });
    if (!listRes.ok) return;
    const alerts = normalizeAlertsPayload(await listRes.json().catch(() => null));
    const existing = alerts.find(
      (alert) => alert.type === "item_restock" && alert.itemId === item.id
    );
    if (!existing) {
      setNotifyByItemId((prev) => ({ ...prev, [item.id]: false }));
      return;
    }

    const deleteRes = await fetch(`/api/alerts/${existing.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (deleteRes.ok) {
      setNotifyByItemId((prev) => ({ ...prev, [item.id]: false }));
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
      <h2 className="text-[17px] font-semibold text-gray-800 mb-1.5">
        Search Inventory
      </h2>
      <p className="text-[13px] text-gray-500 mb-4">
        Check {storeName} stock before you head out.
      </p>

      <form onSubmit={runSearch} className="flex flex-col sm:flex-row gap-2.5 mb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try: bok choy, shin ramen"
          className="flex-1 px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] bg-white outline-none focus:border-green-400 transition-colors"
        />
        <button
          type="submit"
          disabled={!hasQuery || loading}
          className="px-4 py-2.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300 transition-colors"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {searched && !loading && results.length === 0 && (
        <p className="text-[14px] text-gray-500">
          No matches found for &quot;{queryHint}&quot; at this location.
        </p>
      )}

      {authRequired && results.length > 0 && (
        <p className="text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-4">
          <Link href={loginHref} className="font-medium text-green-700 underline">
            {viewerRole === "owner" ? "Switch to shopper login" : "Log in as a shopper"}
          </Link>{" "}
          to turn on restock alerts for items at this store.
        </p>
      )}

      <div className="space-y-2.5">
        {results.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-xl px-3.5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="font-medium text-[15px] text-gray-800">{item.name}</div>
              <div className="text-[12px] text-gray-500 mt-0.5">
                Updated {toRelativeTime(item.last_updated)} (
                {new Date(item.last_updated).toISOString()})
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span
                className={`text-[12px] px-2.5 py-1 rounded-full font-medium ${
                  item.stock_count === 0
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {item.stock_count === 0 ? "Out of Stock" : "In-Stock"}
              </span>
              <button
                type="button"
                onClick={() => toggleNotify(item)}
                disabled={authRequired}
                title={
                  authRequired
                    ? "Log in as a shopper to use alerts"
                    : undefined
                }
                className={`text-[12px] px-2.5 py-1 rounded-full border transition-colors ${
                  notifyByItemId[item.id]
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:text-green-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {notifyByItemId[item.id] ? "Notify me: On" : "Notify me"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
