"use client";

import Link from "next/link";
import type { ViewerRole } from "@/lib/viewer-role";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function storeAlertCallbackPath(storeId: string): string {
  return `/stores/${storeId}`;
}

export function storeAlertLoginHref(storeId: string): string {
  return `/login?callbackUrl=${encodeURIComponent(storeAlertCallbackPath(storeId))}`;
}

export function storeAlertShopperSignupHref(storeId: string): string {
  return `/signup/shopper?callbackUrl=${encodeURIComponent(storeAlertCallbackPath(storeId))}`;
}

export function pickSubscribeAlertId(payload: { id?: string }): string | null {
  return typeof payload.id === "string" && payload.id ? payload.id : null;
}

export function describeSubscribeFailure(
  status: number,
  payload: { error?: string },
): string {
  if (typeof payload.error === "string" && payload.error) {
    return payload.error;
  }
  if (status === 403) {
    return "This account can’t subscribe (try a shopper login).";
  }
  if (status === 401) {
    return "Sign in again, then retry.";
  }
  return "Could not subscribe.";
}

type Props = {
  storeId: string;
  storeName: string;
  /** Server-known active store_follow subscription */
  initialSubscribed: boolean;
  /** Active store_follow alert row id when subscribed (avoids GET before DELETE) */
  initialStoreFollowAlertId: string | null;
  /** From server auth() — client useSession can lag behind this */
  viewerRole: ViewerRole;
};

export default function StoreAlertSubscribe({
  storeId,
  storeName,
  initialSubscribed,
  initialStoreFollowAlertId,
  viewerRole,
}: Props) {
  const router = useRouter();
  // Must match server on first paint — do not read sessionStorage here (hydration error).
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [followAlertId, setFollowAlertId] = useState<string | null>(
    initialStoreFollowAlertId,
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSubscribed(initialSubscribed);
    setFollowAlertId(initialStoreFollowAlertId);
  }, [initialSubscribed, initialStoreFollowAlertId, storeId]);

  const loginHref = storeAlertLoginHref(storeId);
  const signupHref = storeAlertShopperSignupHref(storeId);

  async function toggle() {
    setError(null);
    if (viewerRole !== "shopper") {
      router.push(loginHref);
      return;
    }

    if (!subscribed) {
      setSubscribed(true);
      setPending(true);
      try {
        const res = await fetch("/api/alerts", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "store_follow", storeId }),
        });
        const payload = (await res.json().catch(() => ({}))) as {
          error?: string;
          id?: string;
        };

        if (!res.ok) {
          setSubscribed(false);
          setFollowAlertId(null);
          setError(describeSubscribeFailure(res.status, payload));
          return;
        }

        setSubscribed(true);
        setFollowAlertId(pickSubscribeAlertId(payload));
      } catch {
        setSubscribed(false);
        setFollowAlertId(null);
        setError("Network error — check your connection and try again.");
      } finally {
        setPending(false);
      }
      return;
    }

    setSubscribed(false);
    setPending(true);
    try {
      let alertId = followAlertId;
      if (!alertId) {
        const listRes = await fetch("/api/alerts", { credentials: "include" });
        if (!listRes.ok) {
          setSubscribed(true);
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
          setFollowAlertId(null);
          setSubscribed(false);
          router.refresh();
          return;
        }
        alertId = row.id;
      }

      const del = await fetch(`/api/alerts/${alertId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!del.ok) {
        setSubscribed(true);
        setError("Could not unsubscribe.");
        return;
      }
      setFollowAlertId(null);
      setSubscribed(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (viewerRole === null) {
    return (
      <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3">
        <p className="text-[14px] text-amber-950 font-medium">
          Get deals &amp; restocks from {storeName}
        </p>
        <p className="text-[13px] text-amber-900/80 mt-1">
          Use a free shopper account so this store can land in{" "}
          <strong className="text-amber-950">My alerts</strong>.
        </p>
        <div className="mt-3 flex flex-col sm:flex-row flex-wrap gap-2">
          <Link
            href={loginHref}
            className="inline-flex justify-center items-center px-4 py-2 rounded-lg text-[13px] font-semibold bg-green-600 text-white hover:bg-green-800 transition-colors text-center"
          >
            Subscribe — log in
          </Link>
          <Link
            href={signupHref}
            className="inline-flex justify-center items-center px-4 py-2 rounded-lg text-[13px] font-semibold border border-amber-200/80 text-amber-950 bg-white/70 hover:bg-white transition-colors text-center"
          >
            Subscribe — sign up free
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[13px] text-gray-600 leading-snug">
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
      {!subscribed && (
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
