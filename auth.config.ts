import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
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
        const user = await authenticateStoreOwner(
          credentials?.email as string | undefined,
          credentials?.password as string | undefined
        );
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          storeId: user.storeId,
        };
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
        token.ownerId = user.id!;
        token.storeId = (user as { storeId?: string | null }).storeId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.ownerId as string;
      (session as { storeId?: string | null }).storeId =
        token.storeId as string | null;
      return session;
    },
  },
} satisfies NextAuthConfig;
