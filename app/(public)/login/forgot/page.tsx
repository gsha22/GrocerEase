"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      const res = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Something went wrong."
        );
        return;
      }
      if (data.ok && typeof data.message === "string") {
        setMessage(data.message);
        setEmail("");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-gray-200 p-10 max-w-[420px] w-full shadow-md">
        <div className="font-display text-2xl font-semibold text-green-600 mb-1.5">
          Reset password
        </div>
        <p className="text-[14px] text-gray-400 mb-6">
          Enter the email you use for your store owner account. We&apos;ll send
          reset instructions if we find a match.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800"
            >
              {error}
            </div>
          )}
          {message && (
            <div
              role="status"
              className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-900"
            >
              {message}
            </div>
          )}

          <div>
            <label
              htmlFor="forgot-email"
              className="block text-[13px] font-medium text-gray-600 mb-1.5"
            >
              Email address
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-md text-[15px] font-semibold text-white bg-green-600 hover:bg-green-800 transition-colors disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px]">
          <Link href="/login" className="text-green-600 hover:text-green-800">
            &larr; Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
