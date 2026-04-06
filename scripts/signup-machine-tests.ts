/**
 * Machine acceptance tests for POST /auth/signup (run against a live server + database).
 *
 * Prerequisites: same as scripts/auth-machine-tests.ts (env, migrate, seed optional).
 * Start the app, then:
 *   npm run test:signup
 *   TEST_BASE_URL=http://localhost:3000 npm run test:signup
 *
 * Creates real StoreOwner rows with unique emails (left in DB for inspection).
 */

import "dotenv/config";
import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";

function cookiePairHeader(setCookieLines: string[]): string {
  return setCookieLines
    .map((line) => line.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
}

async function postSignup(
  body: Record<string, unknown>,
  cookieHeader?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cookieHeader) headers.Cookie = cookieHeader;

  const res = await fetch(`${BASE}/auth/signup`, {
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

async function fetchAuthSession(cookieHeader?: string) {
  const headers: Record<string, string> = {};
  if (cookieHeader) headers.Cookie = cookieHeader;
  const res = await fetch(`${BASE}/api/auth/session`, { headers });
  const json = await res.json().catch(() => null);
  return { res, json };
}

async function postLogin(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, callbackUrl: "/dashboard" }),
  });
  const setCookies = res.headers.getSetCookie?.() ?? [];
  return { res, cookieHeader: cookiePairHeader(setCookies) };
}

function assertNoPasswordLeak(json: unknown, plaintext: string) {
  const raw = JSON.stringify(json);
  assert.ok(
    !raw.includes(plaintext),
    "response must not contain plaintext password"
  );
  assert.ok(
    !raw.toLowerCase().includes("passwordhash") &&
      !raw.includes("password_hash"),
    "response must not expose password hash field names/values"
  );
}

async function main() {
  console.log(`Testing POST /auth/signup against ${BASE}\n`);

  const suffix = randomUUID().slice(0, 8);
  const email = `signup-test-${suffix}@example.test`;
  const password = "SecurePass1";
  const name = "Signup Test Owner";

  // --- Invalid JSON
  {
    const res = await fetch(`${BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json{",
    });
    assert.equal(res.status, 400, "invalid JSON should be 400");
  }

  // --- Missing / weak validation
  {
    const { res, json } = await postSignup({});
    assert.equal(res.status, 400, "empty body should be 400");
    const body = json as { fieldErrors?: Record<string, string> };
    assert.ok(body.fieldErrors, "should include fieldErrors");
    assert.ok(
      Object.keys(body.fieldErrors ?? {}).length > 0,
      "should list field errors"
    );
  }

  {
    const { res, json } = await postSignup({
      name,
      email,
      password: "short1",
      confirmPassword: "short1",
    });
    assert.equal(res.status, 400, "short password should be 400");
    assert.ok(
      (json as { fieldErrors?: { password?: string } }).fieldErrors?.password,
      "should mention password rule"
    );
  }

  {
    const { res } = await postSignup({
      name,
      email,
      password: "allletters",
      confirmPassword: "allletters",
    });
    assert.equal(res.status, 400, "letters-only password should be 400");
  }

  {
    const { res } = await postSignup({
      name,
      email,
      password: "12345678",
      confirmPassword: "12345678",
    });
    assert.equal(res.status, 400, "digits-only password should be 400");
  }

  {
    const { res, json } = await postSignup({
      name,
      email: "not-an-email",
      password,
      confirmPassword: password,
    });
    assert.equal(res.status, 400, "invalid email should be 400");
    assert.ok(
      (json as { fieldErrors?: { email?: string } }).fieldErrors?.email,
      "should mention email"
    );
  }

  {
    const { res, json } = await postSignup({
      name,
      email: `mismatch-${suffix}@example.test`,
      password,
      confirmPassword: "OtherPass1",
    });
    assert.equal(res.status, 400, "password mismatch should be 400");
    assert.ok(
      (json as { fieldErrors?: { confirmPassword?: string } }).fieldErrors
        ?.confirmPassword,
      "should mention confirm password"
    );
  }

  // --- Successful registration + session cookies + no secrets in body
  let sessionCookie = "";
  {
    const { res, json, setCookies } = await postSignup({
      name,
      email,
      password,
      confirmPassword: password,
      callbackUrl: "/dashboard",
    });
    assert.equal(res.status, 201, "valid signup should be 201");
    const body = json as {
      ok?: boolean;
      user?: { id?: string; email?: string; name?: string };
      redirectUrl?: string;
    };
    assert.equal(body.ok, true, "should return ok: true");
    assert.ok(body.user?.id && body.user.email === email && body.user.name === name);
    assert.ok(typeof body.redirectUrl === "string", "should include redirectUrl");
    assertNoPasswordLeak(json, password);

    sessionCookie = cookiePairHeader(setCookies);
    assert.ok(sessionCookie.length > 0, "should Set-Cookie session after signup");
  }

  // --- Session reflects new user (immediate auth)
  {
    const { res, json } = await fetchAuthSession(sessionCookie);
    assert.equal(res.status, 200);
    assert.equal(
      (json as { user?: { email?: string } })?.user?.email?.toLowerCase(),
      email
    );
  }

  // --- Can still log in with same password (bcrypt stored correctly)
  {
    const { res } = await postLogin(email, password);
    assert.ok(res.ok, "POST /auth/login after signup should succeed");
  }

  // --- Duplicate email rejected
  {
    const { res, json } = await postSignup({
      name: "Someone Else",
      email,
      password: "OtherPass2a",
      confirmPassword: "OtherPass2a",
    });
    assert.equal(res.status, 409, "duplicate email should be 409");
    assert.ok(
      typeof (json as { error?: string }).error === "string",
      "should include error message"
    );
    assertNoPasswordLeak(json, "OtherPass2a");
  }

  console.log("All signup machine tests passed.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
