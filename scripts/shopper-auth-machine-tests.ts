/**
 * Machine acceptance tests for shopper registration and login (live server + DB).
 *
 * Story #39 (separate from owner URLs; owner keeps /auth/login and /auth/signup):
 *   - POST /auth/shopper/signup — create shopper + session cookies
 *   - POST /auth/shopper/login — shopper session cookies
 *
 * Auth.js uses one credentials provider; these routes pass accountType=shopper in the
 * internal callback body (see lib/credentials-sign-in-response.ts).
 *
 * Prerequisites: DATABASE_URL, NEXTAUTH_SECRET; migrations + seed (`npm run db:seed`).
 * App running: `npm run dev` or `npm start`.
 *
 *   npm run test:shopper-auth
 *   TEST_BASE_URL=http://localhost:3000 npm run test:shopper-auth
 */

import "dotenv/config";
import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { fixtureMeta, ids } from "../prisma/fixtures";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";

const NINA_EMAIL = "nina.shopper@testmail.com";
const SHOPPER_PASSWORD = fixtureMeta.shopperPlaintextPassword;
const OWNER_EMAIL = "linh@lotus-market.test";
const OWNER_PASSWORD = fixtureMeta.ownerPlaintextPassword;

function cookiePairHeader(setCookieLines: string[]): string {
  return setCookieLines
    .map((line) => line.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
}

async function postJson(
  path: string,
  body: unknown,
  cookieHeader?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cookieHeader) headers.Cookie = cookieHeader;

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  const setCookies = res.headers.getSetCookie?.() ?? [];
  return { res, json, setCookies };
}

async function shopperLogin(email: string, password: string) {
  return postJson("/auth/shopper/login", {
    email,
    password,
    callbackUrl: "/shopper/account",
  });
}

async function fetchAuthSession(cookieHeader?: string) {
  const headers: Record<string, string> = {};
  if (cookieHeader) headers.Cookie = cookieHeader;
  const res = await fetch(`${BASE}/api/auth/session`, { headers });
  const json = await res.json().catch(() => null);
  return { res, json };
}

function assertNoPasswordLeak(json: unknown, plaintext: string) {
  const raw = JSON.stringify(json);
  assert.ok(!raw.includes(plaintext), "response must not contain plaintext password");
  assert.ok(
    !raw.toLowerCase().includes("passwordhash") && !raw.includes("password_hash"),
    "response must not expose password hash markers"
  );
}

async function main() {
  console.log(`Testing shopper auth against ${BASE}\n`);

  // --- POST /auth/shopper/login invalid credentials
  {
    const { res, json } = await shopperLogin(NINA_EMAIL, "wrong-password-xyz");
    assert.equal(res.status, 401, "invalid shopper login should be 401");
    assert.ok(
      typeof json === "object" &&
        json !== null &&
        typeof (json as { error?: string }).error === "string",
      "invalid login should include error string"
    );
    assertNoPasswordLeak(json, SHOPPER_PASSWORD);
  }

  // --- POST /auth/shopper/login valid (fixture shopper)
  let shopperCookie = "";
  {
    const { res, json, setCookies } = await shopperLogin(NINA_EMAIL, SHOPPER_PASSWORD);
    assert.equal(res.status, 200, "valid shopper login should be 200");
    assert.ok(
      typeof json === "object" &&
        json !== null &&
        (json as { ok?: boolean }).ok === true,
      "valid shopper login should return ok: true"
    );
    shopperCookie = cookiePairHeader(setCookies);
    assert.ok(shopperCookie.length > 0, "shopper login should Set-Cookie");
    assertNoPasswordLeak(json, SHOPPER_PASSWORD);
  }

  // --- Session: role shopper + stable id (cookies / JWT)
  {
    const { res, json } = await fetchAuthSession(shopperCookie);
    assert.equal(res.status, 200);
    const body = json as {
      user?: { id?: string; email?: string };
      role?: string;
    };
    assert.equal(body.role, "shopper", "session.role should be shopper");
    assert.equal(
      body.user?.email?.toLowerCase(),
      NINA_EMAIL,
      "session email should match shopper"
    );
    assert.equal(
      body.user?.id,
      ids.shoppers.nina,
      "session user id should match fixture shopper id"
    );
    assertNoPasswordLeak(json, SHOPPER_PASSWORD);
  }

  // --- GET /api/alerts without session → 401
  {
    const res = await fetch(`${BASE}/api/alerts`);
    assert.equal(res.status, 401, "GET /api/alerts without cookie should be 401");
    const j = await res.json().catch(() => ({}));
    assert.ok(
      typeof (j as { error?: string }).error === "string",
      "401 should include error message"
    );
  }

  // --- GET /api/alerts as owner session → 401 (shopper-only)
  {
    const ownerLoginRes = await postJson("/auth/login", {
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
      callbackUrl: "/dashboard",
    });
    const ownerCookie = cookiePairHeader(ownerLoginRes.setCookies);
    assert.equal(ownerLoginRes.res.status, 200, "owner login for contrast should succeed");
    const res = await fetch(`${BASE}/api/alerts`, {
      headers: { Cookie: ownerCookie },
    });
    assert.equal(
      res.status,
      401,
      "owner session must not access shopper alerts API"
    );
  }

  // --- GET /api/alerts as shopper → 200
  {
    const res = await fetch(`${BASE}/api/alerts`, {
      headers: { Cookie: shopperCookie },
    });
    assert.equal(res.status, 200, "shopper GET /api/alerts should succeed");
    const data = (await res.json()) as
      | unknown[]
      | { alerts?: unknown[] };
    const alerts = Array.isArray(data)
      ? data
      : Array.isArray(data.alerts)
        ? data.alerts
        : null;
    assert.ok(Array.isArray(alerts), "alerts response should include an alerts array");
    assertNoPasswordLeak(data, SHOPPER_PASSWORD);
  }

  // --- Shopper cannot create store (owner-only)
  {
    const res = await fetch(`${BASE}/api/stores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: shopperCookie,
      },
      body: JSON.stringify({
        name: "Fake",
        address: "1 Test St, Pittsburgh, PA 15213",
        categories: ["organic"],
        hours: {},
      }),
    });
    assert.equal(res.status, 401, "POST /api/stores as shopper should be 401");
  }

  // --- /dashboard as shopper → redirect away from owner portal
  {
    const res = await fetch(`${BASE}/dashboard`, {
      redirect: "manual",
      headers: { Cookie: shopperCookie },
    });
    assert.ok(res.status === 302 || res.status === 307, "dashboard should redirect shopper");
    const loc = res.headers.get("location") ?? "";
    assert.ok(
      loc.includes("/shopper/account"),
      `expected redirect toward shopper account, got: ${loc}`
    );
  }

  // --- /vendor as shopper → same protection as owner dashboard (local feed vendor tools)
  {
    const res = await fetch(`${BASE}/vendor`, {
      redirect: "manual",
      headers: { Cookie: shopperCookie },
    });
    assert.ok(res.status === 302 || res.status === 307, "vendor should redirect shopper");
    const loc = res.headers.get("location") ?? "";
    assert.ok(
      loc.includes("/shopper/account"),
      `expected redirect toward shopper account, got: ${loc}`
    );
  }

  // --- POST /auth/shopper/signup valid → 201 + password hashed in DB
  const suffix = randomUUID().slice(0, 8);
  const newEmail = `shopper-machine-${suffix}@example.test`;
  const newPassword = "NewShopper1";
  const newName = "Machine Test Shopper";

  {
    const { res, json, setCookies } = await postJson("/auth/shopper/signup", {
      name: newName,
      email: newEmail,
      password: newPassword,
      confirmPassword: newPassword,
      callbackUrl: "/shopper/account",
    });
    assert.equal(res.status, 201, "signup should return 201");
    assert.ok(
      typeof json === "object" &&
        json !== null &&
        (json as { ok?: boolean }).ok === true,
      "signup should auto sign-in with ok: true"
    );
    assert.ok(cookiePairHeader(setCookies).length > 0, "signup should set session cookies");
    assertNoPasswordLeak(json, newPassword);
    const u = (json as { user?: { email?: string; name?: string } }).user;
    assert.equal(u?.email, newEmail);
    assert.equal(u?.name, newName);
  }

  if (process.env.DATABASE_URL) {
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
    try {
      const row = await prisma.shopper.findUnique({
        where: { email: newEmail },
        select: { passwordHash: true },
      });
      assert.ok(row?.passwordHash, "shopper row should have passwordHash");
      assert.ok(
        /^\$2[aby]\$/.test(row.passwordHash),
        "stored password must be a bcrypt hash"
      );
      assert.ok(
        row.passwordHash !== newPassword,
        "stored password must not equal plaintext"
      );
    } finally {
      await prisma.$disconnect();
    }
  } else {
    console.warn("Skipping DB hash check (DATABASE_URL not set in test env)");
  }

  // --- Duplicate shopper email → 409
  {
    const { res, json } = await postJson("/auth/shopper/signup", {
      name: newName,
      email: newEmail,
      password: newPassword,
      confirmPassword: newPassword,
      callbackUrl: "/shopper/account",
    });
    assert.equal(res.status, 409, "duplicate shopper email should be 409");
    assertNoPasswordLeak(json, newPassword);
  }

  // --- Email already used by store owner → 409
  {
    const { res, json } = await postJson("/auth/shopper/signup", {
      name: "Should Fail",
      email: OWNER_EMAIL,
      password: newPassword,
      confirmPassword: newPassword,
      callbackUrl: "/shopper/account",
    });
    assert.equal(res.status, 409, "shopper signup with owner email should be 409");
    assertNoPasswordLeak(json, newPassword);
  }

  // --- Best-effort cleanup for ad-hoc runs against shared DBs
  if (process.env.DATABASE_URL) {
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
    try {
      await prisma.shopper.deleteMany({ where: { email: newEmail } });
    } finally {
      await prisma.$disconnect();
    }
  }

  console.log("\nAll shopper auth machine tests passed.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
