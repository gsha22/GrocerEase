import { mapEnrichedFreshUpdatesToFeedItems } from "@/lib/fresh-updates";

/**
 * Covers only JSON serialization for the public store feed.
 * Stale computation belongs in lib/fresh-updates.test.ts (node:test).
 */
describe("mapEnrichedFreshUpdatesToFeedItems (store page → StoreFreshUpdatesFeed)", () => {
  it("maps enriched rows to ISO strings and preserves flags", () => {
    const feed = mapEnrichedFreshUpdatesToFeedItems([
      {
        id: "u1",
        itemName: "Bok choy",
        note: "Fresh",
        createdAt: new Date("2026-04-01T10:00:00.000Z"),
        isStale: false,
      },
    ]);
    expect(feed).toEqual([
      {
        id: "u1",
        itemName: "Bok choy",
        note: "Fresh",
        createdAt: "2026-04-01T10:00:00.000Z",
        isStale: false,
      },
    ]);
  });

  it("returns an empty array when given an empty input", () => {
    expect(mapEnrichedFreshUpdatesToFeedItems([])).toEqual([]);
  });

  it("preserves null notes and true stale flag", () => {
    const feed = mapEnrichedFreshUpdatesToFeedItems([
      {
        id: "u2",
        itemName: "Old",
        note: null,
        createdAt: new Date("2026-04-01T12:00:00.000Z"),
        isStale: true,
      },
    ]);
    expect(feed[0].isStale).toBe(true);
    expect(feed[0].note).toBeNull();
    expect(feed[0].createdAt).toBe("2026-04-01T12:00:00.000Z");
  });
});
