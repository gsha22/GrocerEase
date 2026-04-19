"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);
    try {
      const res = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        ok?: boolean;
      };
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong.");
        return;
      }
      if (data.ok && typeof data.message === "string") {
        setSuccess(data.message);
      } else {
        setSuccess("If an account exists for that email, check your inbox for next steps.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] rounded-3xl border border-gray-200 bg-white p-10 shadow-md">
        <div className="mb-1.5 font-display text-2xl font-semibold text-green-600">Reset password</div>
        <p className="mb-6 text-[14px] text-gray-400">
          Enter the email you use for your store owner account. If outbound email is configured for this
          app, you&apos;ll receive a reset link shortly. In local development without email, check the server
          terminal for the URL.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          {success && (
            <div
              role="status"
              className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-900"
            >
              {success}
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="forgot-email" className="mb-1.5 block text-[13px] font-medium text-gray-600">
              Email address
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border-[1.5px] border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-800 outline-none transition-colors focus:border-green-400"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-green-600 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-60"
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
