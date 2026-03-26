"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  isSafeRelativeAppPath,
  safeCallbackPath,
} from "@/lib/safe-callback-path";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackPath(searchParams.get("callbackUrl"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          callbackUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Could not sign in. Try again."
        );
        return;
      }

      if (
        data.ok &&
        typeof data.redirectUrl === "string" &&
        isSafeRelativeAppPath(data.redirectUrl)
      ) {
        router.push(data.redirectUrl);
        router.refresh();
        return;
      }

      setError("Unexpected response from server.");
    } finally {
      setPending(false);
    }
  }

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

      <div>
        <label
          htmlFor="login-email"
          className="block text-[13px] font-medium text-gray-600 mb-1.5"
        >
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourstore.com"
          className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="block text-[13px] font-medium text-gray-600 mb-1.5"
        >
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
        />
        <div className="mt-2">
          <Link
            href="/login/forgot"
            className="text-[13px] text-green-600 hover:text-green-800"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-md text-[15px] font-semibold text-white bg-green-600 hover:bg-green-800 transition-colors mt-1 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in to dashboard"}
      </button>
    </form>
  );
}
