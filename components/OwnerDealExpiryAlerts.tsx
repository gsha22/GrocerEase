"use client";

import { useState } from "react";

type AlertItem = { id: string; message: string };

export default function OwnerDealExpiryAlerts({
  initial,
}: {
  initial: AlertItem[];
}) {
  const [items, setItems] = useState(initial);
  const [dismissError, setDismissError] = useState<string | null>(null);

  if (items.length === 0) return null;

  async function dismiss(id: string) {
    setDismissError(null);
    const res = await fetch("/api/owner/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      return;
    }
    let detail = "Could not dismiss. Try again.";
    try {
      const data = (await res.json()) as { error?: string };
      if (typeof data.error === "string" && data.error) detail = data.error;
    } catch {
      /* ignore */
    }
    console.error("OwnerDealExpiryAlerts: PATCH /api/owner/notifications failed", res.status);
    setDismissError(detail);
  }

  return (
    <div
      className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
      role="status"
    >
      <div className="text-[13px] font-semibold text-amber-900 mb-2">
        Deal expiring soon
      </div>
      {dismissError && (
        <p className="text-[12px] text-red-800 bg-red-50 border border-red-100 rounded-md px-2 py-1.5 mb-2">
          {dismissError}
        </p>
      )}
      <ul className="space-y-2">
        {items.map((a) => (
          <li
            key={a.id}
            className="flex gap-2 items-start justify-between text-[14px] text-amber-950"
          >
            <span className="flex-1 min-w-0">{a.message}</span>
            <button
              type="button"
              onClick={() => dismiss(a.id)}
              className="shrink-0 text-[12px] font-medium text-amber-800 hover:underline"
            >
              Dismiss
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
