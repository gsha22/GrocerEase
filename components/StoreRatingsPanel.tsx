// Story 15: Shopper-facing lightweight rating + tip panel on a store page.
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ViewerRole } from "@/lib/viewer-role";

type RatingItem = {
  id: string;
  score: number;
  note: string | null;
  createdAt: string;
  authorName: string;
};

type Summary = {
  average: number | null;
  total: number;
  ratings: RatingItem[];
  hasMore: boolean;
};

type OwnRating = {
  id: string;
  score: number;
  note: string | null;
} | null;

type Props = {
  storeId: string;
  viewerRole: ViewerRole;
  initialSummary: Summary;
  /** Own rating if the viewer is a shopper who has already rated. */
  initialOwnRating: OwnRating;
};

function Stars({ score, onPick }: { score: number; onPick?: (n: number) => void }) {
  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Rating stars">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= score;
        const interactive = typeof onPick === "function";
        const className = `text-[20px] leading-none ${
          filled ? "text-amber-500" : "text-gray-300"
        } ${interactive ? "hover:scale-110 transition-transform" : ""}`;
        if (interactive) {
          return (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={filled}
              onClick={() => onPick?.(n)}
              className={className}
            >
              ★
            </button>
          );
        }
        return (
          <span key={n} aria-hidden className={className}>
            ★
          </span>
        );
      })}
    </div>
  );
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export default function StoreRatingsPanel({
  storeId,
  viewerRole,
  initialSummary,
  initialOwnRating,
}: Props) {
  const [summary, setSummary] = useState<Summary>(initialSummary);
  const [ownRating, setOwnRating] = useState<OwnRating>(initialOwnRating);
  const [score, setScore] = useState(0);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSummary(initialSummary);
    setOwnRating(initialOwnRating);
  }, [initialSummary, initialOwnRating, storeId]);

  async function refresh() {
    try {
      const res = await fetch(`/api/stores/${storeId}/ratings`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Could not refresh ratings.");
      }
      const data = await res.json();
      setSummary({
        average: data.average,
        total: data.total,
        ratings: data.ratings,
        hasMore: data.hasMore,
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message} You may need to reload the page.`
          : "Could not refresh ratings. You may need to reload the page.",
      );
    }
  }

  async function submit() {
    setError(null);
    if (score < 1 || score > 5) {
      setError("Pick 1–5 stars first.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/ratings`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, note: note.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not submit rating.");
      }
      setOwnRating({
        id: data.rating.id,
        score: data.rating.score,
        note: data.rating.note,
      });
      setScore(0);
      setNote("");
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit rating.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteOwn() {
    if (!ownRating) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/stores/${storeId}/ratings/${ownRating.id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not delete rating.");
      }
      setOwnRating(null);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete rating.");
    } finally {
      setSubmitting(false);
    }
  }

  const callbackPath = `/stores/${storeId}`;
  const shopperLoginHref = `/shopper/login?callbackUrl=${encodeURIComponent(callbackPath)}`;

  return (
    <section
      className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 space-y-4"
      aria-labelledby="ratings-heading"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2
          id="ratings-heading"
          className="text-[17px] font-semibold text-gray-800 flex items-center gap-2"
        >
          <span aria-hidden>⭐</span>
          Shopper ratings
        </h2>
        <div className="text-[13px] text-gray-500 flex items-center gap-2">
          {summary.average != null ? (
            <>
              <Stars score={Math.round(summary.average)} />
              <span className="font-semibold text-gray-800">
                {summary.average.toFixed(1)}
              </span>
              <span>
                ({summary.total} {summary.total === 1 ? "rating" : "ratings"})
              </span>
            </>
          ) : (
            <span>No ratings yet. Be the first!</span>
          )}
        </div>
      </div>

      {viewerRole === "shopper" ? (
        ownRating ? (
          <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-4">
            <p className="text-[12px] font-semibold text-emerald-900 uppercase tracking-wider">
              Your rating
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Stars score={ownRating.score} />
              <span className="text-[13px] text-gray-600">
                {ownRating.score}/5
              </span>
            </div>
            {ownRating.note ? (
              <p className="mt-2 text-[14px] text-gray-700 leading-relaxed">
                {ownRating.note}
              </p>
            ) : null}
            <button
              type="button"
              onClick={deleteOwn}
              disabled={submitting}
              className="mt-3 text-[12px] font-medium text-red-600 hover:text-red-800 disabled:opacity-60"
            >
              Delete my rating
            </button>
            {error && (
              <p className="mt-2 text-[12px] text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 p-4 space-y-2">
            <p className="text-[13px] text-gray-600">
              Leave a quick rating (and optional tip, 280 chars max):
            </p>
            <Stars score={score} onPick={setScore} />
            <textarea
              maxLength={280}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional — a quick tip for other shoppers"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            />
            {error && (
              <p className="text-[12px] text-red-600" role="alert">
                {error}
              </p>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                disabled={submitting || score < 1}
                onClick={submit}
                className="px-4 py-1.5 rounded-lg text-[13px] font-semibold bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit rating"}
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 p-3 text-[13px] text-gray-600">
          <Link
            href={shopperLoginHref}
            className="text-emerald-800 font-medium hover:underline"
          >
            Sign in as a shopper
          </Link>{" "}
          to leave a rating.
        </div>
      )}

      {summary.ratings.length > 0 && (
        <ul className="divide-y divide-gray-100 pt-1">
          {summary.ratings.map((r) => (
            <li key={r.id} className="py-3">
              <div className="flex items-center gap-2">
                <Stars score={r.score} />
                <span className="text-[12px] text-gray-400">
                  {r.authorName} · {formatDate(r.createdAt)}
                </span>
              </div>
              {r.note ? (
                <p className="mt-1 text-[14px] text-gray-700 leading-relaxed">
                  {r.note}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
