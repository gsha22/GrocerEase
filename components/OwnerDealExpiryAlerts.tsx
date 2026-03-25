"use client";

import { useState } from "react";

type AlertItem = { id: string; message: string };

export default function OwnerDealExpiryAlerts({
  initial,
}: {
  initial: AlertItem[];
}) {
  const [items, setItems] = useState(initial);

  if (items.length === 0) return null;

  async function dismiss(id: string) {
    const res = await fetch("/api/owner/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }
  }

  return (
    <div
      className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
      role="status"
    >
      <div className="text-[13px] font-semibold text-amber-900 mb-2">
        Deal expiring soon
      </div>
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
