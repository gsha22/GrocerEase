import "dotenv/config";
import { strict as assert } from "node:assert";
import { fixtureMeta, ids } from "../prisma/fixtures";
import { prisma } from "../lib/prisma";
import { runDealMaintenance } from "../lib/deal-maintenance";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const OWNER_EMAIL = "linh@lotus-market.test";
const OWNER_PASSWORD = fixtureMeta.ownerPlaintextPassword;
const STORE_ID = ids.stores.lotus;

function cookiePairHeader(setCookieLines: string[]): string {
  return setCookieLines
    .map((line) => line.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
}

async function postJson(path: string, body: unknown, cookieHeader?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cookieHeader) headers.Cookie = cookieHeader;
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { res, json };
}

async function deleteDeal(
  storeId: string,
  dealId: string,
  cookieHeader?: string,
) {
  const headers: Record<string, string> = {};
  if (cookieHeader) headers.Cookie = cookieHeader;
  const res = await fetch(`${BASE}/api/stores/${storeId}/deals/${dealId}`, {
    method: "DELETE",
    headers,
  });
  const json = await res.json().catch(() => null);
  return { res, json };
}

async function patchDeal(
  storeId: string,
  dealId: string,
  body: unknown,
  cookieHeader?: string,
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cookieHeader) headers.Cookie = cookieHeader;
  const res = await fetch(`${BASE}/api/stores/${storeId}/deals/${dealId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { res, json };
}

async function login() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
      callbackUrl: "/dashboard",
    }),
  });
  const setCookies = res.headers.getSetCookie?.() ?? [];
  return { res, cookieHeader: cookiePairHeader(setCookies) };
}

async function main() {
  const { res: loginRes, cookieHeader } = await login();
  assert.equal(loginRes.status, 200, "Owner login should succeed before deal tests");
  assert.ok(cookieHeader, "Expected session cookie from /auth/login");

  // 1) POST valid => 201
  const futureIso = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  const valid = await postJson(
    `/api/stores/${STORE_ID}/deals`,
    { price: 3.99, description: "Machine criteria test deal", expires_at: futureIso },
    cookieHeader,
  );
  assert.equal(valid.res.status, 201, "Valid POST /stores/:id/deals should return 201");
  const createdId = (valid.json as { deal?: { id?: string } })?.deal?.id;
  assert.ok(createdId, "Expected created deal id");

  // 1a) PATCH edit existing deal => 200 and persisted
  const updatedExpiryIso = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
  const patchRes = await patchDeal(
    STORE_ID,
    createdId!,
    {
      price: 4.49,
      description: "Machine criteria edited deal",
      title: "Edited machine deal",
      expires_at: updatedExpiryIso,
    },
    cookieHeader,
  );
  assert.equal(
    patchRes.res.status,
    200,
    "PATCH /stores/:id/deals/:dealId should return 200",
  );
  const patchedDeal = (patchRes.json as { deal?: { price?: string; description?: string | null; title?: string; expiresAt?: string } })?.deal;
  assert.equal(patchedDeal?.price, "4.49", "PATCH should update deal price");
  assert.equal(
    patchedDeal?.description,
    "Machine criteria edited deal",
    "PATCH should update deal description",
  );
  assert.equal(patchedDeal?.title, "Edited machine deal", "PATCH should update deal title");
  assert.ok(
    typeof patchedDeal?.expiresAt === "string" &&
      new Date(patchedDeal.expiresAt).getTime() > Date.now(),
    "PATCH should keep deal expiry in future",
  );

  const persistedPatched = await prisma.deal.findUnique({ where: { id: createdId! } });
  assert.equal(
    persistedPatched?.description,
    "Machine criteria edited deal",
    "PATCH should persist edited description",
  );

  // 1b) POST source_deal_id valid => 201 with new id and timestamp
  const duplicateExpiry = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
  const duplicate = await postJson(
    `/api/stores/${STORE_ID}/deals`,
    { source_deal_id: createdId, expires_at: duplicateExpiry, price: 4.25 },
    cookieHeader,
  );
  assert.equal(
    duplicate.res.status,
    201,
    "Valid source_deal_id duplication should return 201",
  );
  const duplicatedDeal = (duplicate.json as { deal?: { id?: string; createdAt?: string } })?.deal;
  assert.ok(duplicatedDeal?.id, "Expected duplicated deal id");
  assert.notEqual(
    duplicatedDeal?.id,
    createdId,
    "Duplicated deal must receive a new identifier",
  );
  assert.ok(
    typeof duplicatedDeal?.createdAt === "string",
    "Duplicated deal must include a creation timestamp",
  );

  // 1c) POST source_deal_id invalid => 400 and no insertion
  const beforeInvalidCount = await prisma.deal.count({ where: { storeId: STORE_ID } });
  const invalidDuplicate = await postJson(
    `/api/stores/${STORE_ID}/deals`,
    { source_deal_id: "not-a-real-deal-id", expires_at: duplicateExpiry },
    cookieHeader,
  );
  assert.equal(
    invalidDuplicate.res.status,
    400,
    "Invalid source_deal_id should return 400",
  );
  const afterInvalidCount = await prisma.deal.count({ where: { storeId: STORE_ID } });
  assert.equal(
    afterInvalidCount,
    beforeInvalidCount,
    "Invalid source_deal_id must not create a new deal",
  );
  const crossStoreDuplicate = await postJson(
    `/api/stores/${STORE_ID}/deals`,
    { source_deal_id: ids.deals.crescentHistorical, expires_at: duplicateExpiry },
    cookieHeader,
  );
  assert.equal(
    crossStoreDuplicate.res.status,
    400,
    "source_deal_id from another store should return 400",
  );
  const afterCrossStoreCount = await prisma.deal.count({ where: { storeId: STORE_ID } });
  assert.equal(
    afterCrossStoreCount,
    beforeInvalidCount,
    "Cross-store source_deal_id must not create a new deal",
  );
  const blankSource = await postJson(
    `/api/stores/${STORE_ID}/deals`,
    { source_deal_id: "", expires_at: duplicateExpiry },
    cookieHeader,
  );
  assert.equal(blankSource.res.status, 400, "Blank source_deal_id should return 400");

  // 2) POST missing field / past expiry => 400
  const missing = await postJson(
    `/api/stores/${STORE_ID}/deals`,
    { description: "Missing price", expires_at: futureIso },
    cookieHeader,
  );
  assert.equal(missing.res.status, 400, "Missing required field should return 400");

  const past = await postJson(
    `/api/stores/${STORE_ID}/deals`,
    { price: 1.11, description: "Past", expires_at: new Date(Date.now() - 1000).toISOString() },
    cookieHeader,
  );
  assert.equal(past.res.status, 400, "Past expires_at should return 400");

  const forDelete = await postJson(
    `/api/stores/${STORE_ID}/deals`,
    {
      price: "9.99",
      description: "DELETE endpoint test",
      expires_at: futureIso,
    },
    cookieHeader,
  );
  assert.equal(forDelete.res.status, 201, "Setup deal for DELETE should return 201");
  const deleteId = (forDelete.json as { deal?: { id?: string } })?.deal?.id;
  assert.ok(deleteId, "Expected deal id for DELETE test");
  const deleted = await deleteDeal(STORE_ID, deleteId!, cookieHeader);
  assert.equal(deleted.res.status, 200, "DELETE /stores/:id/deals/:dealId should return 200");
  const soft = await prisma.deal.findFirst({ where: { id: deleteId! } });
  assert.ok(soft?.deletedAt, "DELETE should set deletedAt (soft delete)");

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const cronRes = await fetch(`${BASE}/api/cron/deals`, {
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
    assert.equal(cronRes.status, 200, "Cron GET should succeed with CRON_SECRET");
    const cronJson = (await cronRes.json()) as { ok?: boolean; ranAt?: string };
    assert.ok(cronJson.ok === true && typeof cronJson.ranAt === "string", "Cron body should include ranAt");
  }

  // 3) GET /stores/:id/deals returns only expires_at > now (active public list)
  const storeDealsRes = await fetch(`${BASE}/api/stores/${STORE_ID}/deals`);
  assert.equal(storeDealsRes.status, 200, "GET store deals should succeed");
  const storeDeals = (await storeDealsRes.json()) as {
    deals: Array<{ expiresAt: string; isActive: boolean }>;
  };
  assert.ok(
    storeDeals.deals.every((d) => new Date(d.expiresAt).getTime() > Date.now()),
    "Public store deals endpoint must exclude expired deals",
  );
  assert.ok(
    storeDeals.deals.every((d) => d.isActive === true),
    "Public store deals must include isActive true for each row",
  );

  // Prepare one expired + one expiring-soon test deal
  const soonDeal = await prisma.deal.create({
    data: {
      storeId: STORE_ID,
      title: "Soon notification test",
      description: "Should notify once",
      price: "2.00",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      isExpired: false,
    },
  });
  await prisma.deal.update({
    where: { id: createdId! },
    data: { expiresAt: new Date(Date.now() - 5 * 60 * 1000), isExpired: false },
  });

  // 4) Background job marks expired
  const maintenance1 = await runDealMaintenance(new Date());
  assert.ok(
    maintenance1.markedExpired >= 1,
    "runDealMaintenance should mark expires_at <= now deals as expired",
  );

  // expired must be absent from public endpoints
  const globalRes = await fetch(`${BASE}/api/deals`);
  assert.equal(globalRes.status, 200, "GET /api/deals should succeed");
  const globalDeals = (await globalRes.json()) as { deals: Array<{ id: string; expiresAt: string }> };
  assert.ok(
    !globalDeals.deals.some((d) => d.id === createdId),
    "Expired deal must be excluded from public deals feed",
  );

  // 5) <=60m notification fires at most once per deal
  const firstNotifCount = await prisma.ownerNotification.count({
    where: { dealId: soonDeal.id, kind: "deal_expiring_soon" },
  });
  assert.equal(firstNotifCount, 1, "First maintenance run should create one expiring-soon notification");

  await runDealMaintenance(new Date());
  const secondNotifCount = await prisma.ownerNotification.count({
    where: { dealId: soonDeal.id, kind: "deal_expiring_soon" },
  });
  assert.equal(
    secondNotifCount,
    1,
    "Second maintenance run should not duplicate expiring-soon notifications",
  );

  // Cleanup test deals
  await prisma.ownerNotification.deleteMany({
    where: {
      dealId: {
        in: [createdId!, duplicatedDeal!.id!, soonDeal.id, deleteId!],
      },
    },
  });
  await prisma.deal.deleteMany({
    where: { id: { in: [createdId!, duplicatedDeal!.id!, soonDeal.id, deleteId!] } },
  });

  console.log("All machine deal criteria checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
