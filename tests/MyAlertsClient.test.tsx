import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import MyAlertsClient, {
  INBOX_KIND_LABELS,
  inboxKindLabel,
  notificationsByCreatedDesc,
} from "@/app/(public)/my-alerts/MyAlertsClient";

describe("inboxKindLabel", () => {
  it("maps known notification kinds", () => {
    expect(inboxKindLabel("store_fresh_update")).toBe("Fresh update");
    expect(inboxKindLabel("store_new_deal")).toBe("New deal");
  });

  it("falls back to raw kind string", () => {
    expect(inboxKindLabel("custom_kind")).toBe("custom_kind");
  });
});

describe("INBOX_KIND_LABELS", () => {
  it("includes at least the two primary inbox kinds", () => {
    expect(INBOX_KIND_LABELS.store_fresh_update).toBeDefined();
    expect(INBOX_KIND_LABELS.store_new_deal).toBeDefined();
  });
});

describe("notificationsByCreatedDesc", () => {
  it("orders newest first", () => {
    const a = {
      id: "1",
      kind: "k",
      title: "t",
      body: null,
      readAt: null,
      createdAt: "2026-04-01T00:00:00.000Z",
      store: { id: "s", name: "S" },
    };
    const b = {
      id: "2",
      kind: "k",
      title: "t",
      body: null,
      readAt: null,
      createdAt: "2026-04-02T00:00:00.000Z",
      store: { id: "s", name: "S" },
    };
    expect(notificationsByCreatedDesc(a, b)).toBeGreaterThan(0);
    expect(notificationsByCreatedDesc(b, a)).toBeLessThan(0);
  });
});

describe("MyAlertsClient", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/api/alerts")) {
        return {
          ok: true,
          json: async () => ({
            alerts: [
              {
                id: "al1",
                type: "store_follow",
                storeId: "s1",
                itemId: null,
                createdAt: "2026-04-01T00:00:00.000Z",
                store: { id: "s1", name: "Mart" },
                item: null,
              },
            ],
          }),
        } as Response;
      }
      if (url.includes("/api/shopper/notifications")) {
        return {
          ok: true,
          json: async () => ({
            notifications: [
              {
                id: "n1",
                kind: "store_new_deal",
                title: "Deal!",
                body: "10% off",
                readAt: null,
                createdAt: "2026-04-05T12:00:00.000Z",
                store: { id: "s1", name: "Mart" },
              },
            ],
            hasMore: false,
          }),
        } as Response;
      }
      return { ok: false, json: async () => ({}) } as Response;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders subscriptions and activity after load", async () => {
    render(<MyAlertsClient />);
    await waitFor(() => {
      expect(screen.getAllByText("Mart").length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText(/Deal!/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Subscriptions/i })).toBeInTheDocument();
  });

  it("removes an alert optimistically when Turn off succeeds", async () => {
    const user = userEvent.setup();
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes("/api/alerts/al1") && init?.method === "DELETE") {
        return { ok: true, json: async () => ({}) } as Response;
      }
      if (url.includes("/api/alerts") && !init?.method) {
        return {
          ok: true,
          json: async () => ({
            alerts: [
              {
                id: "al1",
                type: "store_follow",
                storeId: "s1",
                itemId: null,
                createdAt: "2026-04-01T00:00:00.000Z",
                store: { id: "s1", name: "Mart" },
                item: null,
              },
            ],
          }),
        } as Response;
      }
      if (url.includes("/api/shopper/notifications")) {
        return {
          ok: true,
          json: async () => ({ notifications: [], hasMore: false }),
        } as Response;
      }
      return { ok: false, json: async () => ({}) } as Response;
    });

    render(<MyAlertsClient />);
    await waitFor(() => screen.getByRole("button", { name: /Turn off/i }));
    await user.click(screen.getByRole("button", { name: /Turn off/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/No active subscriptions/i),
      ).toBeInTheDocument();
    });
  });
});
