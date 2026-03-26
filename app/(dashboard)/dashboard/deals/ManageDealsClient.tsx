"use client";

import { useCallback, useEffect, useState } from "react";
import { formatExpiry, formatPriceUsd } from "@/lib/deals";

const PAST_DEALS_PAGE_SIZE = 20;

type ApiDeal = {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  expiresAt: string;
  isExpired: boolean;
  createdAt: string;
};

function dateInputToIso(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999)).toISOString();
}

function dealIsActive(d: ApiDeal): boolean {
  return !d.isExpired && new Date(d.expiresAt).getTime() > Date.now();
}

function formatDealMeta(d: ApiDeal): string {
  const price = formatPriceUsd(d.price);
  const bits = [price, formatExpiry(d.expiresAt)].filter(Boolean);
  return bits.join(" · ");
}

export default function ManageDealsClient({ storeId }: { storeId: string }) {
  const [deals, setDeals] = useState<ApiDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [expiresDate, setExpiresDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reuseDates, setReuseDates] = useState<Record<string, string>>({});
  const [pastDealsVisible, setPastDealsVisible] = useState(PAST_DEALS_PAGE_SIZE);

  const load = useCallback(async () => {
    setLoadError(null);
    const res = await fetch(`/api/stores/${storeId}/deals?all=true`);
    if (!res.ok) {
      let msg = "Could not load deals. Refresh the page or sign in again.";
      try {
        const data = (await res.json()) as { error?: string };
        if (typeof data.error === "string" && data.error) msg = data.error;
      } catch {
        /* ignore */
      }
      setLoadError(msg);
      setDeals([]);
      return;
    }
    const data = await res.json();
    setDeals(data.deals ?? []);
  }, [storeId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!expiresDate) {
      setError("Expiry date is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: price.trim(),
          description: description.trim() || undefined,
          title: title.trim() || undefined,
          expires_at: dateInputToIso(expiresDate),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not post deal.");
        return;
      }
      setPrice("");
      setDescription("");
      setTitle("");
      setExpiresDate("");
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function reuseDeal(sourceId: string) {
    const dateStr = reuseDates[sourceId];
    if (!dateStr) {
      setError("Choose a new expiry date before reusing a past deal.");
      return;
    }
    setError(null);
    const res = await fetch(`/api/stores/${storeId}/deals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_deal_id: sourceId,
        expires_at: dateInputToIso(dateStr),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not reuse deal.");
      return;
    }
    await load();
  }

  async function removeDeal(dealId: string) {
    setError(null);
    const res = await fetch(`/api/stores/${storeId}/deals/${dealId}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not remove deal.");
      return;
    }
    setPastDealsVisible(PAST_DEALS_PAGE_SIZE);
    await load();
  }

  const activeDeals = deals.filter(dealIsActive);
  const inactiveDeals = deals.filter((d) => !dealIsActive(d));
  const visibleInactive = inactiveDeals.slice(0, pastDealsVisible);
  const hasMorePast = inactiveDeals.length > pastDealsVisible;

  return (
    <>
      <div className="mb-7">
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Deals
        </h1>
        <p className="text-[15px] text-gray-600 mt-1.5">
          Create and manage your store&apos;s promotions
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-[17px] font-semibold text-gray-800 mb-4">Post a deal</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="text-[13px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
              Price (USD) *
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0.01}
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] bg-white outline-none focus:border-green-400 transition-colors"
              placeholder="e.g. 4.99"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] bg-white outline-none focus:border-green-400 transition-colors resize-y"
              placeholder="What shoppers get and any conditions"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
              Short title (optional)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] bg-white outline-none focus:border-green-400 transition-colors"
              placeholder="Defaults to your description if empty"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
              Expiry date *
            </label>
            <input
              type="date"
              required
              value={expiresDate}
              onChange={(e) => setExpiresDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] bg-white outline-none focus:border-green-400 transition-colors"
            />
          </div>
          <p className="text-[12px] text-gray-400">
            Deals auto-hide when they expire &mdash; shoppers only see active promotions.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-md text-sm font-semibold text-white bg-green-600 hover:bg-green-800 transition-colors disabled:opacity-50"
          >
            {submitting ? "Posting…" : "Post deal"}
          </button>
        </form>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[17px] font-semibold text-gray-800">Your deals</h2>
        <span className="text-[13px] text-gray-400">Past deals can be reused</span>
      </div>

      {loading ? (
        <p className="text-[14px] text-gray-400">Loading deals…</p>
      ) : loadError ? (
        <p className="text-[14px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {loadError}
        </p>
      ) : deals.length === 0 ? (
        <p className="text-[14px] text-gray-400">No deals yet. Post your first one above.</p>
      ) : (
        <div className="space-y-2">
          {activeDeals.map((deal) => (
            <div
              key={deal.id}
              className="flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
            >
              <div className="text-2xl w-11 h-11 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
                🏷
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[15px] truncate">{deal.title}</div>
                <div className="text-[12px] text-gray-400 mt-0.5">{formatDealMeta(deal)}</div>
              </div>
              <button
                type="button"
                onClick={() => removeDeal(deal.id)}
                className="shrink-0 px-2.5 py-1 rounded-md text-[12px] font-medium text-gray-500 border border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-100 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          {visibleInactive.map((deal) => (
            <div
              key={deal.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-xl opacity-80"
            >
              <div className="text-2xl w-11 h-11 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
                🏷
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[15px] truncate line-through">{deal.title}</div>
                <div className="text-[12px] text-gray-400 mt-0.5">
                  {deal.isExpired || new Date(deal.expiresAt) <= new Date()
                    ? "Expired — hidden from shoppers"
                    : "Inactive"}
                  {" · "}
                  {formatDealMeta(deal)}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                <input
                  type="date"
                  value={reuseDates[deal.id] ?? ""}
                  onChange={(e) =>
                    setReuseDates((prev) => ({ ...prev, [deal.id]: e.target.value }))
                  }
                  className="px-2 py-1.5 rounded-md border border-gray-200 text-[13px]"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => reuseDeal(deal.id)}
                    className="px-3 py-1.5 rounded-md text-[12px] font-medium border border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors text-gray-600"
                  >
                    Reuse with new expiry
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDeal(deal.id)}
                    className="px-3 py-1.5 rounded-md text-[12px] font-medium border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-700 hover:border-red-100 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          {hasMorePast && (
            <button
              type="button"
              onClick={() =>
                setPastDealsVisible((n) => n + PAST_DEALS_PAGE_SIZE)
              }
              className="w-full py-2.5 text-[13px] font-medium text-gray-600 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Show more past deals ({inactiveDeals.length - visibleInactive.length}{" "}
              remaining)
            </button>
          )}
        </div>
      )}
    </>
  );
}
