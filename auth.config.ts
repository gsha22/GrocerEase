import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateShopper } from "@/lib/authenticate-shopper";
import { authenticateStoreOwner } from "@/lib/authenticate-store-owner";

export const authConfig = {
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        // Owner session is tried first, then shopper. Same /login form for both; wrong-type
        // credentials simply fail with a generic error (no role hint) — see README for QA emails.
        const owner = await authenticateStoreOwner(email, password);
        if (owner) {
          return {
            id: owner.id,
            email: owner.email,
            name: owner.name,
            storeId: owner.storeId,
            role: "owner" as const,
          };
        }

        const shopper = await authenticateShopper(email, password);
        if (shopper) {
          return {
            id: shopper.id,
            email: shopper.email,
            name: shopper.name,
            storeId: null,
            role: "shopper" as const,
          };
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? "owner";
        token.storeId = user.storeId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      session.role = (token.role as "owner" | "shopper" | undefined) ?? "owner";
      session.storeId = (token.storeId as string | null) ?? null;
      return session;
    },
  },
} satisfies NextAuthConfig;
