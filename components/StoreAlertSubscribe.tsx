"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

type Props = {
  storeId: string;
  storeName: string;
  /** Server-known active store_follow subscription */
  initialSubscribed: boolean;
};

export default function StoreAlertSubscribe({
  storeId,
  storeName,
  initialSubscribed,
}: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackPath = `/stores/${storeId}`;
  const loginHref = `/login?callbackUrl=${encodeURIComponent(callbackPath)}`;
  const signupHref = `/signup/shopper?callbackUrl=${encodeURIComponent(callbackPath)}`;

  async function toggle() {
    setError(null);
    if (status !== "authenticated" || session?.role !== "shopper") {
      router.push(loginHref);
      return;
    }

    if (!subscribed) {
      setSubscribed(true);
      setPending(true);
      const res = await fetch("/api/alerts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "store_follow", storeId }),
      });
      setPending(false);
      if (!res.ok) {
        setSubscribed(false);
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error ?? "Could not subscribe.");
      }
      router.refresh();
      return;
    }

    setSubscribed(false);
    setPending(true);
    const listRes = await fetch("/api/alerts", { credentials: "include" });
    if (!listRes.ok) {
      setSubscribed(true);
      setPending(false);
      setError("Could not update subscription.");
      return;
    }
    const data = (await listRes.json()) as {
      alerts?: Array<{ id: string; type: string; storeId: string | null }>;
    };
    const row = (data.alerts ?? []).find(
      (a) => a.type === "store_follow" && a.storeId === storeId,
    );
    if (!row) {
      setPending(false);
      router.refresh();
      return;
    }
    const del = await fetch(`/api/alerts/${row.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setPending(false);
    if (!del.ok) {
      setSubscribed(true);
      setError("Could not unsubscribe.");
      return;
    }
    router.refresh();
  }

  if (status === "loading") {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-[13px] text-gray-400">
        Checking alerts…
      </div>
    );
  }

  if (session?.role === "owner") {
    return null;
  }

  if (status !== "authenticated") {
    return (
      <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3">
        <p className="text-[14px] text-amber-950 font-medium">
          Get deals &amp; restocks from {storeName}
        </p>
        <p className="text-[13px] text-amber-900/80 mt-1">
          <Link href={loginHref} className="font-semibold text-green-700 hover:underline">
            Sign in
          </Link>{" "}
          or{" "}
          <Link href={signupHref} className="font-semibold text-green-700 hover:underline">
            create a free shopper account
          </Link>{" "}
          to subscribe — you&apos;ll return here after.
        </p>
      </div>
    );
  }

  if (session.role !== "shopper") {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold text-gray-800">
            {subscribed ? "You’re subscribed" : "Follow this store"}
          </p>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {subscribed
              ? `We’ll highlight activity for ${storeName}.`
              : `Get notified about new deals and restocks at ${storeName}.`}
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={toggle}
          className={`shrink-0 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-60 ${
            subscribed
              ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
              : "bg-green-600 text-white hover:bg-green-800"
          }`}
        >
          {pending ? "…" : subscribed ? "Unsubscribe" : "Subscribe"}
        </button>
      </div>
      {subscribed && (
        <p className="text-[11px] text-green-700 font-medium mt-2">Active · store alerts on</p>
      )}
      {!subscribed && session && (
        <p className="text-[11px] text-gray-400 mt-2">Inactive · not following this store</p>
      )}
      {error && (
        <p className="text-[12px] text-red-700 mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
