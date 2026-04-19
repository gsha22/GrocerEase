import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import MyAlertsClient from "./MyAlertsClient";

export default async function MyAlertsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(`/sign-in?next=${encodeURIComponent("/my-alerts")}`);
  }
  if (session.role !== "shopper") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-[640px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="text-[13px] text-green-600 hover:underline"
        >
          ← Discover stores
        </Link>
      </div>
      <h1 className="font-display text-[26px] font-semibold text-gray-800 mb-1">
        Saved shops
      </h1>
      <p className="text-[14px] text-gray-500 mb-8">
        Markets you&apos;ve pinned, plus alerts for restocks and new deals — discovery only, no
        checkout.
      </p>
      <MyAlertsClient />
    </div>
  );
}
