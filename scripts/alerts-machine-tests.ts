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
  const res = await fetch(`${BASE}/auth/shopper/login`, {
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
  assert.ok(cookieHeader, "Expected session cookie from /auth/shopper/login");

  const headersJson = {
    "Content-Type": "application/json",
    Cookie: cookieHeader,
  };

  // POST validation (acceptance criteria)
  const noStoreFollow = await fetch(`${BASE}/api/alerts`, {
    method: "POST",
    headers: headersJson,
    body: JSON.stringify({ type: "store_follow" }),
  });
  assert.equal(noStoreFollow.status, 400, "store_follow without storeId should be 400");

  const noItemRestock = await fetch(`${BASE}/api/alerts`, {
    method: "POST",
    headers: headersJson,
    body: JSON.stringify({ type: "item_restock", storeId: STORE_ID }),
  });
  assert.equal(
    noItemRestock.status,
    400,
    "item_restock without itemId should be 400",
  );

  const noStoreItemRestock = await fetch(`${BASE}/api/alerts`, {
    method: "POST",
    headers: headersJson,
    body: JSON.stringify({ type: "item_restock", itemId: ITEM_ID }),
  });
  assert.equal(
    noStoreItemRestock.status,
    400,
    "item_restock without storeId should be 400",
  );

  // POST store_follow
  const follow = await fetch(`${BASE}/api/alerts`, {
    method: "POST",
    headers: headersJson,
    body: JSON.stringify({ type: "store_follow", storeId: STORE_ID }),
  });
  assert.ok(
    follow.status === 200 || follow.status === 201,
    "POST store_follow should return 200 or 201",
  );
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
  assert.ok(
    restock.status === 200 || restock.status === 201,
    "POST item_restock should return 200 or 201",
  );
  const restockBody = (await restock.json()) as { type: string; itemId: string | null };
  assert.equal(restockBody.type, "item_restock");
  assert.equal(restockBody.itemId, ITEM_ID);

  // GET active alerts
  const listRes = await fetch(`${BASE}/api/alerts`, {
    headers: { Cookie: cookieHeader },
  });
  assert.equal(listRes.status, 200, "GET /api/alerts should return 200");
  const listJson = (await listRes.json()) as
    | Array<{ id: string; type: string; isActive: boolean }>
    | { alerts: Array<{ id: string; type: string; isActive: boolean }> };
  const alerts = Array.isArray(listJson) ? listJson : listJson.alerts;
  assert.ok(Array.isArray(alerts), "Response should include alerts list");
  assert.ok(
    alerts.length >= 2,
    "Should include at least the two alerts created in this run",
  );
  assert.ok(
    alerts.every((a) => a.isActive),
    "GET should only return active alerts",
  );

  const firstId = alerts[0]!.id;
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
  const list2Json = (await list2.json()) as
    | Array<{ id: string }>
    | { alerts: Array<{ id: string }> };
  const alerts2 = Array.isArray(list2Json) ? list2Json : list2Json.alerts;
  assert.ok(
    !alerts2.some((a) => a.id === firstId),
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
