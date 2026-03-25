import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-gray-200 p-10 max-w-[420px] w-full shadow-md">
        <div className="font-display text-2xl font-semibold text-green-600 mb-1.5">
          LocalGrocer
        </div>
        <p className="text-[14px] text-gray-400 mb-7">
          Owner portal — manage your store&apos;s listings
        </p>

        <Suspense fallback={<div className="text-sm text-gray-500">Loading…</div>}>
          <LoginForm />
        </Suspense>

        <hr className="border-gray-100 my-5" />

        <p className="text-center text-[13px] text-gray-400">
          New store owner?{" "}
          <Link href="/dashboard/profile" className="text-green-600">
            Create your store &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
