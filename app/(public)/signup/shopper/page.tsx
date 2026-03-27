import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { safeCallbackPath } from "@/lib/safe-callback-path";
import ShopperSignupForm from "./ShopperSignupForm";

export default async function ShopperSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  if (session?.user) {
    if (session.role === "shopper") {
      redirect(safeCallbackPath(sp.callbackUrl, "/"));
    }
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-gray-200 p-10 max-w-[420px] w-full shadow-md">
        <div className="font-display text-2xl font-semibold text-green-600 mb-1.5">
          LocalGrocer
        </div>
        <p className="text-[14px] text-gray-400 mb-7">
          Create a free shopper account for deal and restock alerts
        </p>

        <Suspense fallback={<div className="text-sm text-gray-500">Loading…</div>}>
          <ShopperSignupForm />
        </Suspense>

        <hr className="border-gray-100 my-5" />

        <p className="text-center text-[13px] text-gray-400">
          Run a store?{" "}
          <Link href="/signup" className="text-green-600">
            Owner signup
          </Link>
          {" · "}
          <Link href="/" className="text-green-600">
            Home
          </Link>
        </p>
      </div>
    </div>
  );
}
