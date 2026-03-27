import { auth } from "@/auth";
import MobileNavClient from "@/components/MobileNavClient";

export default async function MobileNav() {
  const session = await auth();
  const accountKind =
    session?.role === "shopper"
      ? "shopper"
      : session?.user
        ? "owner"
        : "guest";
  return <MobileNavClient accountKind={accountKind} />;
}
