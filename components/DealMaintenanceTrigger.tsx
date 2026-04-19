"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Calls deal maintenance once when the app shell loads (any page). Throttled on the server.
 */
export default function DealMaintenanceOnAppOpen() {
  useEffect(() => {
    void fetch("/api/deals/maintenance", { cache: "no-store" }).catch(() => {
      /* non-blocking */
    });
  }, []);
  return null;
}

/** Optional manual trigger + `router.refresh()` — e.g. deals listing page. */
export function DealMaintenanceRefreshButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      await fetch("/api/deals/maintenance", { cache: "no-store" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={pending}
      className="rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-stone-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/60 disabled:opacity-50"
    >
      {pending ? "Updating…" : "Refresh deal statuses"}
    </button>
  );
}
