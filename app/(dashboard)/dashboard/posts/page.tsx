import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ManagePostsClient from "./ManagePostsClient";

export default async function ManagePostsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (!session.storeId) {
    return (
      <div className="max-w-[700px]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Owner portal
        </p>
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Fresh updates
        </h1>
        <p className="text-[15px] text-gray-600 mt-4">
          Complete your store profile first, then you can post updates.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[700px]">
      <div className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Owner portal
        </p>
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Fresh updates
        </h1>
        <p className="text-[15px] text-gray-600 mt-1.5">
          Let shoppers know what just arrived or is back in stock.
        </p>
      </div>
      <ManagePostsClient storeId={session.storeId} />
    </div>
  );
}
