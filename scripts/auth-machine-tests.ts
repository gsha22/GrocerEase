/**
 * Machine acceptance tests for auth (run against a live server + database).
 *
 * Prerequisites:
 *   1. DATABASE_URL and NEXTAUTH_SECRET set (e.g. `.env`)
 *   2. Migrations applied (`npx prisma migrate deploy`)
 *   3. Seed data loaded (`npm run db:seed`) so fixture owners exist
 *   4. App running: `npm run dev` or `npm start`
 *
 * Run:
 *   TEST_BASE_URL=http://localhost:3000 npx tsx scripts/auth-machine-tests.ts
 */

import "dotenv/config";
import { strict as assert } from "node:assert";
import { fixtureMeta, ids } from "../prisma/fixtures";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";

const OWNER_EMAIL_LINH = "linh@lotus-market.test";
const OWNER_EMAIL_ABDULLAH = "abdullah@crescent-halal.test";
const OWNER_PASSWORD = fixtureMeta.ownerPlaintextPassword;
const STORE_LOTUS_ID = ids.stores.lotus;

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

async function login(email: string, password: string) {
  const { res, json, setCookies } = await postJson("/auth/login", {
    email,
    password,
    callbackUrl: "/dashboard",
  });
  return {
    res,
    json,
    cookieHeader: cookiePairHeader(setCookies),
  };
}

async function main() {
  console.log(`Testing auth against ${BASE}\n`);

  // --- POST /auth/login invalid
  {
    const { res, json } = await postJson("/auth/login", {
      email: OWNER_EMAIL_LINH,
      password: "wrong-password-xyz",
    });
    assert.equal(res.status, 401, "invalid login should be 401");
    assert.ok(
      typeof json === "object" &&
        json !== null &&
        "error" in json &&
        typeof (json as { error: string }).error === "string",
      "invalid login should include error message"
    );
    const body = JSON.stringify(json);
    assert.ok(
      !body.includes("passwordHash") && !body.includes(OWNER_PASSWORD),
      "error response must not leak secrets"
    );
  }

  // --- POST /auth/login valid
  let sessionCookie = "";
  {
    const { res, json, cookieHeader } = await login(
      OWNER_EMAIL_LINH,
      OWNER_PASSWORD
    );
    assert.equal(res.status, 200, "valid login should be 200");
    assert.ok(
      typeof json === "object" &&
        json !== null &&
        (json as { ok?: boolean }).ok === true,
      "valid login should return ok: true"
    );
    assert.ok(cookieHeader.length > 0, "valid login should Set-Cookie");
    const body = JSON.stringify(json);
    assert.ok(
      !body.toLowerCase().includes("password") &&
        !body.includes("passwordHash") &&
        !body.includes(OWNER_PASSWORD),
      "success JSON must not include password material"
    );
    sessionCookie = cookieHeader;
  }

  // --- Dashboard requires auth (middleware)
  {
    const res = await fetch(`${BASE}/dashboard`, { redirect: "manual" });
    assert.ok(
      res.status === 302 || res.status === 307,
      "unauthenticated dashboard should redirect"
    );
    const loc = res.headers.get("location") ?? "";
    assert.ok(loc.includes("/login"), `expected redirect to login, got ${loc}`);
  }

  // --- PATCH store without session
  {
    const res = await fetch(`${BASE}/api/stores/${STORE_LOTUS_ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Hacked" }),
    });
    assert.equal(res.status, 401, "PATCH without session should be 401");
  }

  const originalLotusName = "Lotus Asian Market";

  // --- PATCH store as owning user
  {
    const res = await fetch(`${BASE}/api/stores/${STORE_LOTUS_ID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ name: "Lotus Market (test patch)" }),
    });
    assert.equal(res.status, 200, "owner PATCH should succeed");
    const data = (await res.json()) as { store?: { name?: string } };
    assert.equal(data.store?.name, "Lotus Market (test patch)");

    const restore = await fetch(`${BASE}/api/stores/${STORE_LOTUS_ID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ name: originalLotusName }),
    });
    assert.equal(restore.status, 200, "should restore store name after test");
  }

  // --- PATCH store as different owner
  {
    const { cookieHeader: otherCookie } = await login(
      OWNER_EMAIL_ABDULLAH,
      OWNER_PASSWORD
    );
    const res = await fetch(`${BASE}/api/stores/${STORE_LOTUS_ID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: otherCookie,
      },
      body: JSON.stringify({ name: "Should not apply" }),
    });
    assert.equal(res.status, 403, "non-owner PATCH should be 403");
  }

  // --- POST deals requires owner
  {
    const res = await fetch(`${BASE}/api/stores/${STORE_LOTUS_ID}/deals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "X", expires_at: new Date(Date.now() + 86400000).toISOString() }),
    });
    assert.equal(res.status, 401, "POST deal without session should be 401");
  }

  // --- Password reset start
  {
    const { res, json } = await postJson("/auth/forgot-password", {
      email: OWNER_EMAIL_LINH,
    });
    assert.equal(res.status, 200, "forgot-password should return 200");
    assert.ok(
      typeof json === "object" &&
        json !== null &&
        (json as { ok?: boolean }).ok === true,
      "forgot-password should return ok: true"
    );
    const body = JSON.stringify(json);
    assert.ok(
      !body.includes("passwordHash") && !body.includes(OWNER_PASSWORD),
      "forgot-password response must not leak password"
    );
  }

  console.log("All machine auth tests passed.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
