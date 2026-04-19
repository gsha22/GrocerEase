import { redirect } from "next/navigation";

/** Canonical shopper signup is `/shopper/signup` — this preserves old links and query params. */
export default async function ShopperSignupLegacyRedirect({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  if (typeof sp.callbackUrl === "string" && sp.callbackUrl.length > 0) {
    q.set("callbackUrl", sp.callbackUrl);
  }
  const suffix = q.toString() ? `?${q.toString()}` : "";
  redirect(`/shopper/signup${suffix}`);
}
