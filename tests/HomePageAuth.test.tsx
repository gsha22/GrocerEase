/**
 * Integration tests for app/(public)/page.tsx auth-to-prop wiring.
 *
 * Uses a relative path for jest.mock so Jest resolves auth.ts directly
 * without going through the @/ alias, avoiding the next-auth ESM chain.
 * The mock is registered under the same absolute path that page.tsx's
 * `import { auth } from "@/auth"` resolves to, so it intercepts correctly.
 */

// Relative path bypasses the @/ alias resolver that fails on auth.ts
jest.mock("../auth", () => ({ auth: jest.fn() }));

import React from "react";
import { default as HomePage } from "../app/(public)/page";

const mockAuth = (jest.requireMock("../auth") as { auth: jest.Mock }).auth;

afterEach(() => {
  jest.resetAllMocks();
});

describe("page.tsx auth wiring", () => {
  it("passes isAuthenticated=true when auth() resolves with a user", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", email: "owner@example.com" } });
    const el = await HomePage();
    expect((el as React.ReactElement<{ isAuthenticated: boolean }>).props.isAuthenticated).toBe(true);
  });

  it("passes isAuthenticated=false when auth() resolves with null", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const el = await HomePage();
    expect((el as React.ReactElement<{ isAuthenticated: boolean }>).props.isAuthenticated).toBe(false);
  });

  it("passes isAuthenticated=false when auth() resolves with a session but no user", async () => {
    mockAuth.mockResolvedValueOnce({ user: null });
    const el = await HomePage();
    expect((el as React.ReactElement<{ isAuthenticated: boolean }>).props.isAuthenticated).toBe(false);
  });
});
