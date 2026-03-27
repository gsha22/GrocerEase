"use client";

import { useCallback, useEffect, useState } from "react";

type AlertRow = {
  id: string;
  type: string;
  storeId: string | null;
  itemId: string | null;
  createdAt: string;
  store: { id: string; name: string } | null;
  item: { id: string; name: string } | null;
};

export default function MyAlertsClient() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/alerts", { credentials: "include" });
    if (!res.ok) {
      let msg = "Could not load alerts.";
      try {
        const d = (await res.json()) as { error?: string };
        if (d.error) msg = d.error;
      } catch {
        /* ignore */
      }
      setError(msg);
      setAlerts([]);
      return;
    }
    const data = (await res.json()) as { alerts?: AlertRow[] };
    setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function unsubscribe(alert: AlertRow) {
    const previous = alerts;
    setAlerts((list) => list.filter((a) => a.id !== alert.id));
    setError(null);
    const res = await fetch(`/api/alerts/${alert.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      setAlerts(previous);
      setError("Could not turn off that alert. Try again.");
    }
  }

  if (loading) {
    return <p className="text-[14px] text-gray-400">Loading your alerts…</p>;
  }

  if (error && alerts.length === 0) {
    return (
      <p className="text-[14px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
        {error}
      </p>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
        <div className="text-[40px] mb-2">🔔</div>
        <p className="text-[15px] text-gray-700 font-medium mb-1">
          No active alerts
        </p>
        <p className="text-[13px] text-gray-500 max-w-[280px] mx-auto">
          Follow a store or turn on item notifications from a store page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-[13px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <ul className="space-y-2">
        {alerts.map((a) => (
          <li
            key={a.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wide text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  Active
                </span>
                <span className="text-[11px] font-medium text-gray-500 uppercase">
                  {a.type === "store_follow" ? "Store" : "Item restock"}
                </span>
              </div>
              <p className="text-[15px] font-semibold text-gray-800 mt-1">
                {a.type === "store_follow"
                  ? a.store?.name ?? "Store"
                  : a.item?.name ?? "Item"}
              </p>
              <p className="text-[13px] text-gray-500 mt-0.5">
                {a.type === "item_restock" && a.store?.name
                  ? `${a.store.name} · `
                  : null}
                Subscribed{" "}
                {new Date(a.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => unsubscribe(a)}
              className="shrink-0 px-3 py-2 rounded-lg text-[13px] font-medium border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-800 hover:border-red-100 transition-colors"
            >
              Turn off
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
