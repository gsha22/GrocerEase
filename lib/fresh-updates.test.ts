import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  enrichFreshUpdatesWithStale,
  FRESH_UPDATE_STALE_THRESHOLD_MS,
  parseFreshUpdatePostBody,
} from "./fresh-updates";

describe("parseFreshUpdatePostBody", () => {
  it("accepts item_name only", () => {
    const r = parseFreshUpdatePostBody({ item_name: "  Bok Choy  " });
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.itemName, "Bok Choy");
      assert.equal(r.note, null);
    }
  });

  it("accepts optional note", () => {
    const r = parseFreshUpdatePostBody({
      item_name: "Lamb",
      note: "  Halal cut  ",
    });
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.itemName, "Lamb");
      assert.equal(r.note, "Halal cut");
    }
  });

  it("treats blank note as null", () => {
    const r = parseFreshUpdatePostBody({ item_name: "Spinach", note: "   " });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.note, null);
  });

  it("rejects missing item_name", () => {
    const r = parseFreshUpdatePostBody({ note: "x" });
    assert.equal(r.ok, false);
    if (!r.ok) assert.match(r.error, /item_name is required/i);
  });

  it("rejects empty trimmed item_name", () => {
    const r = parseFreshUpdatePostBody({ item_name: "  \t  " });
    assert.equal(r.ok, false);
    if (!r.ok) assert.match(r.error, /cannot be empty/i);
  });

  it("rejects non-object body", () => {
    assert.equal(parseFreshUpdatePostBody(null).ok, false);
    assert.equal(parseFreshUpdatePostBody("x").ok, false);
  });

  it("rejects wrong types", () => {
    const r = parseFreshUpdatePostBody({ item_name: 12 });
    assert.equal(r.ok, false);
    if (!r.ok) assert.match(r.error, /string/i);
  });

  it("rejects non-string note", () => {
    const r = parseFreshUpdatePostBody({ item_name: "Ok", note: 99 });
    assert.equal(r.ok, false);
    if (!r.ok) assert.match(r.error, /note/i);
  });

  it("rejects oversized item_name", () => {
    const r = parseFreshUpdatePostBody({ item_name: "x".repeat(201) });
    assert.equal(r.ok, false);
    if (!r.ok) assert.match(r.error, /200/i);
  });
});

describe("enrichFreshUpdatesWithStale", () => {
  const t0 = new Date("2026-01-01T12:00:00.000Z");

  it("marks rows older than threshold as stale", () => {
    const freshAt = new Date(
      t0.getTime() - (FRESH_UPDATE_STALE_THRESHOLD_MS - 60_000),
    );
    const staleAt = new Date(
      t0.getTime() - (FRESH_UPDATE_STALE_THRESHOLD_MS + 60_000),
    );
    const rows = [
      { id: "a", createdAt: freshAt },
      { id: "b", createdAt: staleAt },
    ];
    const out = enrichFreshUpdatesWithStale(rows, t0);
    assert.equal(out[0].isStale, false);
    assert.equal(out[1].isStale, true);
  });

  it("preserves reverse-chronological order of input", () => {
    const newer = new Date("2026-01-01T11:00:00.000Z");
    const older = new Date("2026-01-01T10:00:00.000Z");
    const out = enrichFreshUpdatesWithStale(
      [
        { id: "new", createdAt: newer },
        { id: "old", createdAt: older },
      ],
      t0,
    );
    assert.deepEqual(
      out.map((u) => u.id),
      ["new", "old"],
    );
  });
});
