import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const owner = await prisma.storeOwner.findUnique({
          where: { email: credentials.email as string },
          include: { store: { select: { id: true } } },
        });

        if (!owner) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          owner.passwordHash
        );
        if (!valid) return null;

        return {
          id: owner.id,
          email: owner.email,
          name: owner.name,
          storeId: owner.store?.id ?? null, // Handles when the owner has account but no store
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
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
});
