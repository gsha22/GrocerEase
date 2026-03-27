import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignOutButton from "@/components/SignOutButton";

type Props = { searchParams: Promise<{ notice?: string }> };

export default async function ShopperAccountPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || session.role !== "shopper") {
    redirect("/shopper/login?callbackUrl=/shopper/account");
  }

  const { notice } = await searchParams;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-gray-200 p-10 max-w-[480px] w-full shadow-md">
        <h1 className="font-display text-2xl font-semibold text-gray-800 mb-1">
          Your account
        </h1>
        <p className="text-[14px] text-gray-500 mb-6">
          Signed in as {session.user.name} ({session.user.email})
        </p>

        {notice === "owner-only" && (
          <div
            role="status"
            className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900 mb-6"
          >
            The store owner dashboard is only for business accounts. This space
            is for shoppers.
          </div>
        )}

        <p className="text-[14px] text-gray-600 mb-6">
          More personalized features are coming soon. For now you can use{" "}
          <Link href="/" className="text-green-600 hover:text-green-800">
            Discover Stores
          </Link>{" "}
          and set restock alerts when you are logged in.
        </p>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-800 transition-colors"
          >
            Browse stores
          </Link>
          <SignOutButton className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors" />
        </div>
      </div>
    </div>
  );
}
