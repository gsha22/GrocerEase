/**
 * Integration tests for app/(public)/page.tsx auth-to-prop wiring.
 *
 * Uses a root-level __mocks__/auth.ts file-based mock so jest.mock("@/auth")
 * never loads the real auth.ts (which imports next-auth ESM).
 */

jest.mock("@/auth");

import React from "react";
import { auth } from "@/auth";
import HomePage from "@/app/(public)/page";

afterEach(() => {
  jest.resetAllMocks();
});

describe("page.tsx auth wiring", () => {
  it("passes isAuthenticated=true when auth() resolves with a user", async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: "u1", email: "owner@example.com" } });
    const el = await HomePage();
    expect((el as React.ReactElement<{ isAuthenticated: boolean }>).props.isAuthenticated).toBe(true);
  });

  it("passes isAuthenticated=false when auth() resolves with null", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(null);
    const el = await HomePage();
    expect((el as React.ReactElement<{ isAuthenticated: boolean }>).props.isAuthenticated).toBe(false);
  });

  it("passes isAuthenticated=false when auth() resolves with a session but no user", async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: null });
    const el = await HomePage();
    expect((el as React.ReactElement<{ isAuthenticated: boolean }>).props.isAuthenticated).toBe(false);
  });
});
