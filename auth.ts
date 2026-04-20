import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { getAuthSecret } from "@/lib/auth-secret";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: getAuthSecret(),
});

/** Shared config (mutated by NextAuth with env defaults). Re-exported for internal Auth() calls. */
export { authConfig };
