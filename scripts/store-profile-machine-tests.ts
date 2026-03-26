import "dotenv/config";
import { strict as assert } from "node:assert";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { fixtureMeta, ids } from "../prisma/fixtures";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";

const OWNER_PASSWORD = fixtureMeta.ownerPlaintextPassword;
const OWNER_EMAIL_WITHOUT_STORE = "newowner@no-store.test";
const OWNER_EMAIL_WITHOUT_STORE_2 = "backupowner@no-store.test";
const OWNER_EMAIL_EXISTING = "linh@lotus-market.test";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

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

async function login(email: string) {
  const { res, setCookies } = await postJson("/auth/login", {
    email,
    password: OWNER_PASSWORD,
    callbackUrl: "/dashboard",
  });
  assert.equal(res.status, 200, `login should succeed for ${email}`);
  return cookiePairHeader(setCookies);
}

async function main() {
  console.log(`Testing store profile story against ${BASE}\n`);

  await prisma.store.deleteMany({
    where: {
      ownerId: { in: [ids.owners.noStoreOwner, ids.owners.noStoreOwnerTwo] },
    },
  });

  // unauthenticated create blocked
  {
    const { res } = await postJson("/api/stores", {
      name: "No Session Store",
      address: "123 Main St, Pittsburgh, PA",
      hours: { open: "08:00", close: "18:00" },
      categories: ["asian"],
    });
    assert.equal(res.status, 401, "POST /api/stores without auth should be 401");
  }

  const ownerCookie = await login(OWNER_EMAIL_WITHOUT_STORE);

  // required fields validated
  {
    const { res, json } = await postJson(
      "/api/stores",
      {
        name: "",
        address: "",
        hours: {},
        categories: [],
      },
      ownerCookie
    );
    assert.equal(res.status, 400, "missing required fields should fail");
    const fieldErrors = (json as { fieldErrors?: Record<string, string> }).fieldErrors ?? {};
    assert.ok(fieldErrors.name, "name should have inline error");
    assert.ok(fieldErrors.address, "address should have inline error");
    assert.ok(fieldErrors.hours, "hours should have inline error");
    assert.ok(fieldErrors.categories, "categories should have inline error");
  }

  // successful create publishes and geocodes
  let createdStoreId = "";
  {
    const { res, json } = await postJson(
      "/api/stores",
      {
        name: "Casey Corner Grocer",
        address: "142 Beaver St, Sewickley, PA 15143",
        hours: { open: "08:00", close: "20:00" },
        categories: ["produce", "ebt"],
      },
      ownerCookie
    );
    assert.equal(res.status, 201, "valid create should return 201");
    const store = (json as { store?: { id: string; lat: number | null; lng: number | null; isPublished: boolean } })
      .store;
    assert.ok(store?.id, "created response should include store id");
    assert.equal(store?.isPublished, true, "created store should be published");
    assert.equal(typeof store?.lat, "number", "lat should be populated");
    assert.equal(typeof store?.lng, "number", "lng should be populated");
    createdStoreId = store!.id;
  }

  // appears in public directory
  {
    const res = await fetch(`${BASE}/api/stores`);
    assert.equal(res.status, 200, "public stores list should load");
    const stores = (await res.json()) as Array<{ id: string; name: string }>;
    assert.ok(
      stores.some((s) => s.id === createdStoreId && s.name === "Casey Corner Grocer"),
      "new store should appear in public directory results"
    );
  }

  // duplicate create for same owner blocked
  {
    const { res } = await postJson(
      "/api/stores",
      {
        name: "Second Store Attempt",
        address: "123 Second St, Pittsburgh, PA",
        hours: { open: "09:00", close: "19:00" },
        categories: ["asian"],
      },
      ownerCookie
    );
    assert.equal(res.status, 409, "owner should not be able to create two stores");
  }

  // Code review / PATCH parity with POST: PATCH must not accept invalid `hours` or `categories`
  // that POST would reject (e.g. hours: { open: "99:99" }, categories: ["nonexistent"]).
  {
    const { res, json } = await patchJson(
      `/api/stores/${createdStoreId}`,
      { hours: { open: "99:99", close: "20:00" } },
      ownerCookie
    );
    assert.equal(res.status, 400, "invalid hours should be rejected");
    const body = json as {
      error?: string;
      fieldErrors?: { hours?: string };
    };
    assert.equal(body.error, "Validation failed");
    assert.ok(body.fieldErrors?.hours, "hours field error expected");
    const afterBadHours = await fetch(`${BASE}/api/stores/${createdStoreId}`);
    assert.equal(afterBadHours.status, 200);
    const storeAfter = (await afterBadHours.json()) as {
      hours: unknown;
      categories: string[];
    };
    assert.deepEqual(storeAfter.hours, { open: "08:00", close: "20:00" });
    assert.deepEqual(storeAfter.categories, ["produce", "ebt"]);
  }

  {
    const { res, json } = await patchJson(
      `/api/stores/${createdStoreId}`,
      { categories: ["nonexistent"] },
      ownerCookie
    );
    assert.equal(res.status, 400, "invalid categories should be rejected");
    const body = json as {
      error?: string;
      fieldErrors?: { categories?: string };
    };
    assert.equal(body.error, "Validation failed");
    assert.ok(body.fieldErrors?.categories, "categories field error expected");
    const afterBadCats = await fetch(`${BASE}/api/stores/${createdStoreId}`);
    assert.equal(afterBadCats.status, 200);
    const storeAfter = (await afterBadCats.json()) as { categories: string[] };
    assert.deepEqual(storeAfter.categories, ["produce", "ebt"]);
  }

  // owner can edit and public data reflects changes
  {
    const { res } = await patchJson(
      `/api/stores/${createdStoreId}`,
      {
        name: "Casey Corner Grocer Updated",
        address: "5000 Forbes Ave, Pittsburgh, PA 15213",
        hours: { open: "09:00", close: "21:00" },
        categories: ["organic", "produce"],
      },
      ownerCookie
    );
    assert.equal(res.status, 200, "owner PATCH should succeed");

    const storeRes = await fetch(`${BASE}/api/stores/${createdStoreId}`);
    assert.equal(storeRes.status, 200, "public store profile should remain visible");
    const store = (await storeRes.json()) as { name: string; categories: string[]; address: string };
    assert.equal(store.name, "Casey Corner Grocer Updated");
    assert.equal(store.address, "5000 Forbes Ave, Pittsburgh, PA 15213");
    assert.deepEqual(store.categories, ["organic", "produce"]);
  }

  // only owner can edit
  {
    const otherCookie = await login(OWNER_EMAIL_EXISTING);
    const { res } = await patchJson(
      `/api/stores/${createdStoreId}`,
      { name: "Hacked Store Name" },
      otherCookie
    );
    assert.equal(res.status, 403, "different owner should be forbidden from editing");
  }

  // second no-store owner can also create
  {
    const otherNoStoreCookie = await login(OWNER_EMAIL_WITHOUT_STORE_2);
    const { res } = await postJson(
      "/api/stores",
      {
        name: "Robin Market",
        address: "6400 Penn Ave, Pittsburgh, PA 15206",
        hours: { open: "07:30", close: "18:30" },
        categories: ["asian"],
      },
      otherNoStoreCookie
    );
    assert.equal(res.status, 201, "another authenticated owner should be able to create");
  }

  console.log("All machine store-profile tests passed.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.store.deleteMany({
      where: {
        ownerId: { in: [ids.owners.noStoreOwner, ids.owners.noStoreOwnerTwo] },
      },
    });
    await prisma.$disconnect();
  });
