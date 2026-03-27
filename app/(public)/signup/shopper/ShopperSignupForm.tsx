"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  isSafeRelativeAppPath,
  safeCallbackPath,
} from "@/lib/safe-callback-path";

interface SignupApiResponse {
  ok?: boolean;
  redirectUrl?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  user?: unknown;
}

export default function ShopperSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackPath(searchParams.get("callbackUrl"), "/");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setPending(true);
    try {
      const res = await fetch("/auth/signup-shopper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          callbackUrl,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SignupApiResponse;

      if (res.status === 400) {
        const fe = data.fieldErrors;
        if (fe && typeof fe === "object") {
          setFieldErrors(fe);
        }
        setError(
          typeof data.error === "string"
            ? data.error
            : "Please fix the errors below."
        );
        return;
      }

      if (res.status === 409) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "This email is already registered."
        );
        return;
      }

      if (res.status === 201 && data.ok) {
        const url = data.redirectUrl;
        if (typeof url === "string" && isSafeRelativeAppPath(url)) {
          router.push(url);
          router.refresh();
          return;
        }
      }

      if (res.status === 201 && data.user) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Account created. Please sign in."
        );
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        router.refresh();
        return;
      }

      setError("Something went wrong. Try again.");
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
          htmlFor="shopper-signup-name"
          className="block text-[13px] font-medium text-gray-600 mb-1.5"
        >
          Your name
        </label>
        <input
          id="shopper-signup-name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Nina Martinez"
          className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
        />
        {fieldErrors.name && (
          <p className="text-[12px] text-red-600 mt-1">{fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="shopper-signup-email"
          className="block text-[13px] font-medium text-gray-600 mb-1.5"
        >
          Email address
        </label>
        <input
          id="shopper-signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
        />
        {fieldErrors.email && (
          <p className="text-[12px] text-red-600 mt-1">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="shopper-signup-password"
          className="block text-[13px] font-medium text-gray-600 mb-1.5"
        >
          Password
        </label>
        <input
          id="shopper-signup-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters, with a letter and a number"
          className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
        />
        {fieldErrors.password && (
          <p className="text-[12px] text-red-600 mt-1">{fieldErrors.password}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="shopper-signup-confirm"
          className="block text-[13px] font-medium text-gray-600 mb-1.5"
        >
          Confirm password
        </label>
        <input
          id="shopper-signup-confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
        />
        {fieldErrors.confirmPassword && (
          <p className="text-[12px] text-red-600 mt-1">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-md text-[15px] font-semibold text-white bg-green-600 hover:bg-green-800 transition-colors mt-1 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create shopper account"}
      </button>

      <p className="text-center text-[13px] text-gray-500">
        Already have an account?{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-green-600 font-medium hover:text-green-800"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
