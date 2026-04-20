import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.role === "shopper" ? "/" : "/owner-dashboard");
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-gray-200 p-10 max-w-[420px] w-full shadow-md">
        <div className="font-display text-2xl font-semibold text-emerald-800 mb-1.5">
          GrocerEase
        </div>
        <p className="text-[14px] text-gray-400 mb-7">
          Store team sign-in — manage your GrocerEase listing
        </p>

        <Suspense fallback={<div className="text-sm text-gray-500">Loading…</div>}>
          <LoginForm />
        </Suspense>

        <hr className="border-gray-100 my-5" />

        <p className="text-center text-[13px] text-gray-400">
          New store?{" "}
          <Link href="/signup" className="text-green-600">
            Register &rarr;
          </Link>
        </p>
        <p className="mt-3 text-center text-[13px] text-gray-400">
          Browsing only?{" "}
          <Link href="/sign-in" className="text-green-600">
            Neighbor sign-in &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
