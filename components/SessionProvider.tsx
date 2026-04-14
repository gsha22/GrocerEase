"use client";

import type { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <NextAuthSessionProvider
      session={session}
      basePath="/api/auth"
      // Root layout already passes `session` from `auth()`. Refetch-on-focus
      // causes noisy GET /api/auth/session in dev (tab/DevTools focus, Strict Mode).
      refetchOnWindowFocus={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
