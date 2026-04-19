// Story 17: Shopper-facing "report incorrect info" button + lightweight form.
"use client";

import Link from "next/link";
import { useState } from "react";
import type { ViewerRole } from "@/lib/viewer-role";

type ReportType =
  | "out_of_stock"
  | "incorrect_hours"
  | "wrong_price"
  | "other";

const TYPE_OPTIONS: { value: ReportType; label: string; hint: string }[] = [
  { value: "out_of_stock", label: "Out of stock", hint: "Item listed as in stock wasn't there" },
  { value: "incorrect_hours", label: "Hours wrong", hint: "Store hours look incorrect" },
  { value: "wrong_price", label: "Price wrong", hint: "Posted price didn't match in-store" },
  { value: "other", label: "Other", hint: "Anything else that seems off" },
];

type Props = {
  storeId: string;
  viewerRole: ViewerRole;
};

export default function StoreReportButton({ storeId, viewerRole }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ReportType>("out_of_stock");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  const callbackPath = `/stores/${storeId}`;
  const shopperLoginHref = `/shopper/login?callbackUrl=${encodeURIComponent(callbackPath)}`;

  if (viewerRole !== "shopper") {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-3 text-[13px] text-gray-600 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
        <span>See something wrong with this page?</span>
        <Link
          href={shopperLoginHref}
          className="text-emerald-800 font-medium hover:underline"
        >
          Sign in as a shopper to report →
        </Link>
      </div>
    );
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/stores/${storeId}/report`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, comment: comment.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not submit report.");
      }
      setAcknowledged(true);
      setComment("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit report.");
    } finally {
      setSubmitting(false);
    }
  }

  if (acknowledged) {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-[13px] text-emerald-900 flex items-center justify-between">
        <span>Thanks — your report was submitted.</span>
        <button
          type="button"
          onClick={() => {
            setAcknowledged(false);
            setOpen(false);
          }}
          className="text-emerald-800 font-medium hover:underline"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-emerald-800 transition-colors"
      >
        <span aria-hidden>🚩</span>
        Report incorrect info
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[14px] font-semibold text-gray-800">
            Report incorrect info
          </p>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Quick tip to help us keep the platform trustworthy.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-gray-400 hover:text-gray-600 text-[16px]"
          aria-label="Close report form"
        >
          ×
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            title={opt.hint}
            aria-pressed={type === opt.value}
            onClick={() => setType(opt.value)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
              type === opt.value
                ? "bg-emerald-700 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <textarea
        maxLength={280}
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional — what did you see? (280 chars max)"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
      />
      {error && (
        <p className="text-[12px] text-red-600" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 text-[13px] text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="px-4 py-1.5 rounded-lg text-[13px] font-semibold bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send report"}
        </button>
      </div>
    </div>
  );
}
