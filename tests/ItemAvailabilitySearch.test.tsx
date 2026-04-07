import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import ItemAvailabilitySearch, {
  normalizeAlertsPayload,
  toRelativeTime,
} from "@/components/ItemAvailabilitySearch";

describe("normalizeAlertsPayload", () => {
  it("returns empty array for null", () => {
    expect(normalizeAlertsPayload(null)).toEqual([]);
  });

  it("passes through a raw array", () => {
    const rows = [{ id: "a", itemId: "i", storeId: "s", type: "item_restock" }];
    expect(normalizeAlertsPayload(rows)).toEqual(rows);
  });

  it("reads .alerts from envelope object", () => {
    const inner = [{ id: "b", itemId: null, storeId: null, type: "x" }];
    expect(normalizeAlertsPayload({ alerts: inner })).toEqual(inner);
  });

  it("returns empty when alerts key is missing", () => {
    expect(normalizeAlertsPayload({ foo: [] })).toEqual([]);
  });
});

describe("toRelativeTime", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-04-06T12:00:00.000Z").valueOf());
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it("returns fallback for invalid date", () => {
    expect(toRelativeTime("not-a-date")).toBe("updated recently");
  });

  it("formats a recent timestamp with RelativeTimeFormat", () => {
    const s = toRelativeTime("2026-04-06T11:30:00.000Z");
    expect(s.length).toBeGreaterThan(0);
  });
});

describe("ItemAvailabilitySearch", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes("/items?")) {
        return {
          ok: true,
          json: async () => [
            {
              id: "item-1",
              name: "Bok choy",
              stock_count: 3,
              in_stock: true,
              store_id: "st1",
              store_name: "Mart",
              store_location: "PA",
              last_updated: "2026-04-06T10:00:00.000Z",
            },
          ],
        } as Response;
      }
      if (url.endsWith("/api/alerts") && (!init || init.method === undefined)) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ alerts: [] }),
        } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("submits search and shows result rows", async () => {
    const user = userEvent.setup();
    render(
      <ItemAvailabilitySearch
        storeId="st1"
        storeName="Mart"
        storeAddress="Pittsburgh"
        viewerRole="shopper"
      />,
    );
    await user.type(screen.getByPlaceholderText(/bok choy/i), "bok");
    await user.click(screen.getByRole("button", { name: /^Search$/i }));
    await waitFor(() => {
      expect(screen.getByText("Bok choy")).toBeInTheDocument();
    });
    expect(screen.getByText(/In-Stock/)).toBeInTheDocument();
  });
});
