import { redirect } from "next/navigation";

/** Alias URL for the store-owner portal (`/dashboard`). */
export default function OwnerDashboardAliasPage() {
  redirect("/dashboard");
}
