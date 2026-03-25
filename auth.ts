import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/** Shared config (mutated by NextAuth with env defaults). Re-exported for internal Auth() calls. */
export { authConfig };
