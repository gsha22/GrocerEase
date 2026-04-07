import {
  enrichFreshUpdatesWithStale,
  mapEnrichedFreshUpdatesToFeedItems,
} from "@/lib/fresh-updates";

describe("mapEnrichedFreshUpdatesToFeedItems (store page → StoreFreshUpdatesFeed)", () => {
  it("maps enriched rows to ISO strings and preserves stale flag", () => {
    const t0 = new Date("2026-04-01T12:00:00.000Z");
    const rows = enrichFreshUpdatesWithStale(
      [
        {
          id: "u1",
          itemName: "Bok choy",
          note: "Fresh",
          createdAt: new Date("2026-04-01T10:00:00.000Z"),
        },
      ],
      t0,
      48 * 60 * 60 * 1000,
    );
    const feed = mapEnrichedFreshUpdatesToFeedItems(rows);
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

  it("marks stale when outside threshold", () => {
    const t0 = new Date("2026-04-05T12:00:00.000Z");
    const rows = enrichFreshUpdatesWithStale(
      [
        {
          id: "u2",
          itemName: "Old",
          note: null,
          createdAt: new Date("2026-04-01T12:00:00.000Z"),
        },
      ],
      t0,
    );
    const feed = mapEnrichedFreshUpdatesToFeedItems(rows);
    expect(feed[0].isStale).toBe(true);
    expect(feed[0].note).toBeNull();
  });
});
