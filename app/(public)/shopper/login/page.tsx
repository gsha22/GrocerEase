import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ShopperLoginForm from "./ShopperLoginForm";

export default async function ShopperLoginPage() {
  const session = await auth();
  // Only redirect already-authenticated shoppers — business owners should be
  // allowed to reach this page so they can sign in with a separate shopper account.
  if (session?.user && session.role === "shopper") {
    redirect("/");
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-gray-200 p-10 max-w-[420px] w-full shadow-md">
        <div className="font-display text-2xl font-semibold text-green-600 mb-1.5">
          GrocerEase
        </div>
        <p className="text-[14px] text-gray-400 mb-7">
          Neighbor sign-in — pin favorite markets and see what&apos;s fresh nearby
        </p>

        <Suspense fallback={<div className="text-sm text-gray-500">Loading…</div>}>
          <ShopperLoginForm />
        </Suspense>

        <hr className="border-gray-100 my-5" />

        <p className="text-center text-[13px] text-gray-400">
          Posting for a store?{" "}
          <Link href="/sign-in" className="text-green-600">
            Choose store sign-in &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
