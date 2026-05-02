"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get("token") ?? "";

  const [token, setToken] = useState(tokenFromQuery);
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
      const res = await fetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: Record<string, string>;
        message?: string;
      };
      if (!res.ok) {
        setFieldErrors(data.fieldErrors ?? {});
        setError(data.error ?? "Could not reset password.");
        return;
      }
      router.push("/login?reset=1");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] rounded-3xl border border-gray-200 bg-white p-10 shadow-md">
        <div className="mb-1.5 font-display text-2xl font-semibold text-green-600">Set new password</div>
        <p className="mb-6 text-[14px] text-gray-400">
          {tokenFromQuery
            ? "Enter and confirm your new password below."
            : "Paste the reset token from your email, then choose a new password."}
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

          {!tokenFromQuery && (
            <div>
              <label htmlFor="reset-token" className="mb-1.5 block text-[13px] font-medium text-gray-600">
                Reset token
              </label>
              <input
                id="reset-token"
                type="text"
                autoComplete="off"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full rounded-md border-[1.5px] border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-800 outline-none transition-colors focus:border-green-400"
              />
            </div>
          )}

          <div>
            <label htmlFor="reset-password" className="mb-1.5 block text-[13px] font-medium text-gray-600">
              New password
            </label>
            <input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border-[1.5px] border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-800 outline-none transition-colors focus:border-green-400"
            />
            {fieldErrors.password ? (
              <p className="mt-1 text-[12px] text-red-700">{fieldErrors.password}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="reset-confirm"
              className="mb-1.5 block text-[13px] font-medium text-gray-600"
            >
              Confirm password
            </label>
            <input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border-[1.5px] border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-800 outline-none transition-colors focus:border-green-400"
            />
            {fieldErrors.confirmPassword ? (
              <p className="mt-1 text-[12px] text-red-700">{fieldErrors.confirmPassword}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-green-600 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Update password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center p-8 text-gray-500">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
