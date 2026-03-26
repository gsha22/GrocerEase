import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateShopper } from "@/lib/authenticate-shopper";
import { authenticateStoreOwner } from "@/lib/authenticate-store-owner";

type OwnerUser = {
  id: string;
  email: string;
  name: string;
  storeId: string | null;
  role: "owner";
};

type ShopperUser = {
  id: string;
  email: string;
  name: string;
  role: "shopper";
};

export const authConfig = {
  providers: [
    Credentials({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        accountType: { label: "Account type", type: "text" },
      },
      async authorize(credentials): Promise<OwnerUser | ShopperUser | null> {
        const rawType =
          typeof credentials?.accountType === "string"
            ? credentials.accountType.trim().toLowerCase()
            : "owner";
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (rawType === "shopper") {
          const user = await authenticateShopper(email, password);
          if (!user) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: "shopper",
          };
        }

        const user = await authenticateStoreOwner(email, password);
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          storeId: user.storeId,
          role: "owner",
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
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        const role = user.role ?? "owner";
        token.role = role;
        if (role === "shopper") {
          token.shopperId = user.id;
          token.ownerId = undefined;
          token.storeId = null;
        } else {
          token.ownerId = user.id;
          token.shopperId = undefined;
          token.storeId =
            (user as { storeId?: string | null }).storeId ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      const role: "owner" | "shopper" =
        token.role === "shopper" || token.shopperId
          ? "shopper"
          : "owner";
      session.role = role;
      if (role === "shopper") {
        session.user.id = (token.shopperId as string) ?? session.user.id;
        session.storeId = null;
      } else {
        session.user.id =
          (token.ownerId as string) ?? token.sub ?? session.user.id;
        session.storeId = (token.storeId as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
