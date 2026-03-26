import "dotenv/config";
import { randomUUID } from "node:crypto";
import { strict as assert } from "node:assert";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { FRESH_UPDATE_PUBLIC_LIST_LIMIT } from "../lib/fresh-updates";
import { fixtureMeta, ids } from "../prisma/fixtures";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const OWNER_PASSWORD = fixtureMeta.ownerPlaintextPassword;
const LOTUS_OWNER = "linh@lotus-market.test";
const CRESCENT_OWNER = "abdullah@crescent-halal.test";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const testRowIds: string[] = [];

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
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    json = text;
  }
  return { res, json, setCookies: res.headers.getSetCookie?.() ?? [] };
}

async function getJson(path: string, cookieHeader?: string) {
  const headers: Record<string, string> = {};
  if (cookieHeader) headers.Cookie = cookieHeader;
  const res = await fetch(`${BASE}${path}`, { headers });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    json = text;
  }
  return { res, json };
}

async function patchJson(path: string, body: unknown, cookieHeader?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cookieHeader) headers.Cookie = cookieHeader;
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    json = text;
  }
  return { res, json };
}

async function deleteJson(path: string, cookieHeader?: string) {
  const headers: Record<string, string> = {};
  if (cookieHeader) headers.Cookie = cookieHeader;
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers,
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    json = text;
  }
  return { res, json };
}

async function login(email: string) {
  const { res, setCookies } = await postJson("/auth/login", {
    email,
    password: OWNER_PASSWORD,
    callbackUrl: "/dashboard",
  });
  assert.equal(res.status, 200, `login should succeed for ${email}`);
  return cookiePairHeader(setCookies);
}

type UpdateRow = {
  id: string;
  itemName: string;
  note: string | null;
  createdAt: string;
  isStale: boolean;
};

async function main() {
  console.log(`Testing fresh updates (Story 11) against ${BASE}\n`);

  const lotusId = ids.stores.lotus;

  // POST without session
  {
    const { res } = await postJson(`/api/stores/${lotusId}/updates`, {
      item_name: "X",
    });
    assert.equal(res.status, 401, "POST without auth should be 401");
  }

  const lotusCookie = await login(LOTUS_OWNER);
  const crescentCookie = await login(CRESCENT_OWNER);

  // wrong owner
  {
    const { res } = await postJson(
      `/api/stores/${lotusId}/updates`,
      { item_name: "Intruder item" },
      crescentCookie,
    );
    assert.equal(res.status, 403, "non-owner POST should be 403");
  }

  // invalid body
  for (const body of [null, {}, { item_name: "" }, { item_name: "  " }]) {
    const { res, json } = await postJson(
      `/api/stores/${lotusId}/updates`,
      body,
      lotusCookie,
    );
    assert.equal(res.status, 400, `invalid body should be 400: ${JSON.stringify(body)}`);
    const err = (json as { error?: string }).error;
    assert.ok(typeof err === "string" && err.length > 0, "error message should be present");
  }

  const uniqueName = `Machine Test Melon ${randomUUID().slice(0, 8)}`;
  const uniqueNote = "Integration note";

  // successful create
  let createdId = "";
  {
    const { res, json } = await postJson(
      `/api/stores/${lotusId}/updates`,
      { item_name: uniqueName, note: uniqueNote },
      lotusCookie,
    );
    assert.equal(res.status, 201, "valid POST should be 201");
    const update = (json as { update?: { id: string; storeId: string; itemName: string; note: string | null; createdAt: string } })
      .update;
    assert.ok(update?.id, "response should include update id");
    assert.equal(update?.storeId, lotusId, "update should belong to store");
    assert.equal(update?.itemName, uniqueName, "item name should match");
    assert.equal(update?.note, uniqueNote, "note should match");
    assert.ok(update?.createdAt, "createdAt should be set");
    createdId = update!.id;
    testRowIds.push(createdId);

    const row = await prisma.freshUpdate.findUnique({ where: { id: createdId } });
    assert.ok(row, "row should exist in DB");
    assert.equal(row!.storeId, lotusId);
    assert.equal(row!.itemName, uniqueName);
  }

  // PATCH ownership guard
  {
    const { res } = await patchJson(
      `/api/stores/${lotusId}/posts/${createdId}`,
      { item_name: "nope" },
      crescentCookie,
    );
    assert.equal(res.status, 403, "non-owner PATCH should be 403");
  }

  // PATCH invalid body
  {
    const { res } = await patchJson(
      `/api/stores/${lotusId}/posts/${createdId}`,
      {},
      lotusCookie,
    );
    assert.equal(res.status, 400, "PATCH without fields should be 400");
  }

  // PATCH success
  const editedName = `${uniqueName} (Edited)`;
  const editedNote = "Updated integration note";
  {
    const { res, json } = await patchJson(
      `/api/stores/${lotusId}/posts/${createdId}`,
      { item_name: editedName, description: editedNote },
      lotusCookie,
    );
    assert.equal(res.status, 200, "owner PATCH should succeed");
    const post = (json as {
      post?: { id: string; itemName: string; note: string | null };
    }).post;
    assert.ok(post?.id === createdId, "PATCH response should include same id");
    assert.equal(post?.itemName, editedName, "PATCH should update itemName");
    assert.equal(post?.note, editedNote, "PATCH should update note");
  }

  {
    const row = await prisma.freshUpdate.findUnique({ where: { id: createdId } });
    assert.equal(row?.itemName, editedName, "DB should persist edited item name");
    assert.equal(row?.note, editedNote, "DB should persist edited note");
  }

  // public GET: newest first and includes our row
  {
    const { res, json } = await getJson(`/api/stores/${lotusId}/updates`);
    assert.equal(res.status, 200);
    const updates = (json as { updates: UpdateRow[] }).updates;
    assert.ok(Array.isArray(updates), "updates array");
    assert.ok(
      updates.length <= FRESH_UPDATE_PUBLIC_LIST_LIMIT,
      "public GET should cap rows to match store page",
    );
    const idx = updates.findIndex((u) => u.id === createdId);
    assert.ok(idx >= 0, "new update should appear in public list");
    if (idx > 0) {
      const newer = new Date(updates[idx - 1]!.createdAt).getTime();
      const ours = new Date(updates[idx]!.createdAt).getTime();
      assert.ok(
        newer >= ours,
        "list should be reverse chronological (newer before older)",
      );
    }
  }

  // stale flag: row 3 days old, still inside 7d public window
  const staleTestId = randomUUID();
  testRowIds.push(staleTestId);
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  await prisma.freshUpdate.create({
    data: {
      id: staleTestId,
      storeId: lotusId,
      itemName: "__machine_stale_probe__",
      note: null,
      createdAt: threeDaysAgo,
    },
  });

  {
    const { res, json } = await getJson(`/api/stores/${lotusId}/updates`);
    assert.equal(res.status, 200);
    const updates = (json as { updates: UpdateRow[] }).updates;
    const row = updates.find((u) => u.id === staleTestId);
    assert.ok(row, "synthetic stale row should be in public window");
    assert.equal(row!.isStale, true, "3d-old update should be flagged stale");
  }

  // older than 7d: hidden from public, visible with ?all=true
  const ancientId = randomUUID();
  testRowIds.push(ancientId);
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  await prisma.freshUpdate.create({
    data: {
      id: ancientId,
      storeId: lotusId,
      itemName: "__machine_ancient__",
      note: null,
      createdAt: tenDaysAgo,
    },
  });

  {
    const { res, json } = await getJson(`/api/stores/${lotusId}/updates`);
    assert.equal(res.status, 200);
    const updates = (json as { updates: UpdateRow[] }).updates;
    assert.ok(
      !updates.some((u) => u.id === ancientId),
      "10d-old update should not appear in public list",
    );
  }

  {
    const { res } = await getJson(`/api/stores/${lotusId}/updates?all=true`);
    assert.equal(res.status, 401, "all=true without auth should be 401");
  }

  {
    const { res, json } = await getJson(
      `/api/stores/${lotusId}/updates?all=true`,
      lotusCookie,
    );
    assert.equal(res.status, 200);
    const updates = (json as { updates: UpdateRow[] }).updates;
    assert.ok(
      updates.some((u) => u.id === ancientId),
      "owner all=true should include ancient update",
    );
    for (let i = 1; i < updates.length; i++) {
      const a = new Date(updates[i - 1]!.createdAt).getTime();
      const b = new Date(updates[i]!.createdAt).getTime();
      assert.ok(a >= b, "owner list should stay newest-first");
    }
  }

  // DELETE ownership guard
  {
    const { res } = await deleteJson(
      `/api/stores/${lotusId}/posts/${createdId}`,
      crescentCookie,
    );
    assert.equal(res.status, 403, "non-owner DELETE should be 403");
  }

  // DELETE success (soft delete)
  {
    const { res } = await deleteJson(
      `/api/stores/${lotusId}/posts/${createdId}`,
      lotusCookie,
    );
    assert.equal(res.status, 200, "owner DELETE should succeed");
  }

  {
    const row = await prisma.freshUpdate.findUnique({ where: { id: createdId } });
    assert.ok(row?.deletedAt, "DELETE should soft-delete with deletedAt");
  }

  {
    const { res, json } = await getJson(`/api/stores/${lotusId}/updates`);
    assert.equal(res.status, 200);
    const updates = (json as { updates: UpdateRow[] }).updates;
    assert.ok(
      !updates.some((u) => u.id === createdId),
      "soft-deleted post should not appear in public list",
    );
  }

  console.log("All fresh-updates machine tests passed.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (testRowIds.length > 0) {
      await prisma.freshUpdate.deleteMany({
        where: { id: { in: testRowIds } },
      });
    }
    await prisma.$disconnect();
  });
