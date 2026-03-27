import "dotenv/config";
import { strict as assert } from "node:assert";
import { fixtureMeta, ids } from "../prisma/fixtures";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const SHOPPER_EMAIL = "nina.shopper@testmail.com";
const SHOPPER_PASSWORD = fixtureMeta.shopperPlaintextPassword;
const STORE_ID = ids.stores.lotus;
const ITEM_ID = ids.items.bokChoy;

function cookiePairHeader(setCookieLines: string[]): string {
  return setCookieLines
    .map((line) => line.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
}

async function loginShopper() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: SHOPPER_EMAIL,
      password: SHOPPER_PASSWORD,
      callbackUrl: "/",
    }),
  });
  const setCookies = res.headers.getSetCookie?.() ?? [];
  return { res, cookieHeader: cookiePairHeader(setCookies) };
}

async function main() {
  const { res: loginRes, cookieHeader } = await loginShopper();
  assert.equal(loginRes.status, 200, "Shopper login should succeed");
  assert.ok(cookieHeader, "Expected session cookie from /auth/login");

  const headersJson = {
    "Content-Type": "application/json",
    Cookie: cookieHeader,
  };

  // POST store_follow
  const follow = await fetch(`${BASE}/api/alerts`, {
    method: "POST",
    headers: headersJson,
    body: JSON.stringify({ type: "store_follow", storeId: STORE_ID }),
  });
  assert.equal(follow.status, 201, "POST store_follow should return 201");
  const followBody = (await follow.json()) as { type: string; storeId: string | null };
  assert.equal(followBody.type, "store_follow");
  assert.equal(followBody.storeId, STORE_ID);

  // POST item_restock
  const restock = await fetch(`${BASE}/api/alerts`, {
    method: "POST",
    headers: headersJson,
    body: JSON.stringify({
      type: "item_restock",
      storeId: STORE_ID,
      itemId: ITEM_ID,
    }),
  });
  assert.equal(restock.status, 201, "POST item_restock should return 201");
  const restockBody = (await restock.json()) as { type: string; itemId: string | null };
  assert.equal(restockBody.type, "item_restock");
  assert.equal(restockBody.itemId, ITEM_ID);

  // GET active alerts
  const listRes = await fetch(`${BASE}/api/alerts`, {
    headers: { Cookie: cookieHeader },
  });
  assert.equal(listRes.status, 200, "GET /api/alerts should return 200");
  const list = (await listRes.json()) as {
    alerts: Array<{ id: string; type: string; isActive: boolean }>;
  };
  assert.ok(Array.isArray(list.alerts), "Response should include alerts array");
  assert.ok(
    list.alerts.length >= 2,
    "Should include at least the two alerts created in this run",
  );
  assert.ok(
    list.alerts.every((a) => a.isActive),
    "GET should only return active alerts",
  );

  const firstId = list.alerts[0]!.id;
  const delRes = await fetch(`${BASE}/api/alerts/${firstId}`, {
    method: "DELETE",
    headers: { Cookie: cookieHeader },
  });
  assert.equal(delRes.status, 200, "DELETE should return 200");
  const delBody = (await delRes.json()) as { isActive: boolean };
  assert.equal(delBody.isActive, false);

  const list2 = await fetch(`${BASE}/api/alerts`, {
    headers: { Cookie: cookieHeader },
  });
  const list2Json = (await list2.json()) as { alerts: Array<{ id: string }> };
  assert.ok(
    !list2Json.alerts.some((a) => a.id === firstId),
    "Soft-deleted alert should not appear in GET",
  );

  // Unauthorized without cookie
  const anon = await fetch(`${BASE}/api/alerts`);
  assert.equal(anon.status, 401, "GET without session should be 401");

  console.log("All shopper alerts machine checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
