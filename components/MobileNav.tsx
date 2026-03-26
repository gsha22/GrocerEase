import { auth } from "@/auth";
import MobileNavClient from "@/components/MobileNavClient";

export default async function MobileNav() {
  const session = await auth();
  return <MobileNavClient authed={!!session?.user} />;
}
