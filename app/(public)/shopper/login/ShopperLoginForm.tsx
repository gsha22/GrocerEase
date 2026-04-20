"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  isSafeRelativeAppPath,
  safeCallbackPath,
} from "@/lib/safe-callback-path";

/** Default after shopper login: home page with nearby stores (`/`). `/stores` also resolves to the same view. */
const SHOPPER_HOME = "/";

type LoginSuccessJson = {
  ok?: boolean;
  error?: string;
  redirectUrl?: string;
  role?: string;
};

export default function ShopperLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackPath(
    searchParams.get("callbackUrl"),
    SHOPPER_HOME,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    let didNavigate = false;
    try {
      const res = await fetch("/auth/shopper/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          callbackUrl,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as LoginSuccessJson;

      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Could not sign in. Try again.",
        );
        return;
      }

      if (!data.ok) {
        setError("Unexpected response from server.");
        return;
      }

      let dest: string | null = null;
      if (
        typeof data.redirectUrl === "string" &&
        isSafeRelativeAppPath(data.redirectUrl)
      ) {
        dest = data.redirectUrl;
      } else if (data.role === "shopper") {
        dest = SHOPPER_HOME;
      }

      if (dest) {
        setRedirecting(true);
        didNavigate = true;
        router.push(dest);
        router.refresh();
        return;
      }

      setError("Unexpected response from server.");
    } finally {
      if (!didNavigate) {
        setPending(false);
      }
    }
  }

  const busy = pending || redirecting;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800"
        >
          {error}
        </div>
      )}

      {redirecting && !error && (
        <p
          className="rounded-md border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-[13px] text-emerald-900"
          aria-live="polite"
        >
          Redirecting…
        </p>
      )}

      <div>
        <label
          htmlFor="shopper-login-email"
          className="block text-[13px] font-medium text-gray-600 mb-1.5"
        >
          Email address
        </label>
        <input
          id="shopper-login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={busy}
          className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="shopper-login-password"
          className="block text-[13px] font-medium text-gray-600 mb-1.5"
        >
          Password
        </label>
        <input
          id="shopper-login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          disabled={busy}
          className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors disabled:opacity-60"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full py-3 rounded-md text-[15px] font-semibold text-white bg-green-600 hover:bg-green-800 transition-colors mt-1 disabled:opacity-60"
      >
        {redirecting
          ? "Redirecting…"
          : pending
            ? "Signing in…"
            : "Sign in"}
      </button>

      <p className="text-center text-[13px] text-gray-500">
        New here?{" "}
        <Link
          href="/shopper/signup"
          className="text-green-600 font-medium hover:text-green-800"
        >
          Create a shopper account
        </Link>
      </p>
    </form>
  );
}
