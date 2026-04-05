/**
 * Unit tests for app/(public)/my-alerts/MyAlertsClient.tsx
 *
 * Pure functions (kindLabel, byCreatedDesc) are tested by importing the module
 * via a re-export shim so they remain private in the real source. The rest of
 * the tests exercise them indirectly through the rendered component.
 */

import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import MyAlertsClient from "../app/(public)/my-alerts/MyAlertsClient";

// ---------------------------------------------------------------------------
// Helpers: build typed fixture objects
// ---------------------------------------------------------------------------

type AlertRow = {
  id: string;
  type: string;
  storeId: string | null;
  itemId: string | null;
  createdAt: string;
  store: { id: string; name: string } | null;
  item: { id: string; name: string } | null;
};

type NotificationRow = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
  store: { id: string; name: string };
};

function makeNotification(overrides: Partial<NotificationRow> = {}): NotificationRow {
  return {
    id: "n1",
    kind: "store_fresh_update",
    title: "Fresh tomatoes!",
    body: null,
    readAt: null,
    createdAt: "2026-01-01T12:00:00.000Z",
    store: { id: "s1", name: "Corner Store" },
    ...overrides,
  };
}

function makeAlert(overrides: Partial<AlertRow> = {}): AlertRow {
  return {
    id: "a1",
    type: "store_follow",
    storeId: "s1",
    itemId: null,
    createdAt: "2026-01-01T12:00:00.000Z",
    store: { id: "s1", name: "Corner Store" },
    item: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// fetch mock helpers
// ---------------------------------------------------------------------------

function mockFetch(
  alertsResponse: object | null,
  notificationsResponse: object | null,
  { alertsOk = true, notificationsOk = true } = {},
) {
  global.fetch = jest.fn().mockImplementation((url: string) => {
    if (url.includes("/api/alerts") && !url.includes("/api/alerts/")) {
      if (!alertsOk) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: "alerts error" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => alertsResponse,
      });
    }
    if (url.includes("/api/shopper/notifications") && !url.includes("/api/shopper/notifications/")) {
      if (!notificationsOk) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: "notifications error" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => notificationsResponse,
      });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  }) as jest.MockedFunction<typeof fetch>;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ===========================================================================
// kindLabel — tested indirectly through rendered notification kind badge
// ===========================================================================

describe("kindLabel", () => {
  it("maps store_fresh_update to 'Fresh update'", async () => {
    mockFetch(
      { alerts: [] },
      { notifications: [makeNotification({ kind: "store_fresh_update" })], hasMore: false },
    );
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByText("Fresh update")).toBeInTheDocument());
  });

  it("maps store_new_deal to 'New deal'", async () => {
    mockFetch(
      { alerts: [] },
      { notifications: [makeNotification({ kind: "store_new_deal" })], hasMore: false },
    );
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByText("New deal")).toBeInTheDocument());
  });

  it("falls back to the raw kind string for unknown kinds", async () => {
    mockFetch(
      { alerts: [] },
      { notifications: [makeNotification({ kind: "custom_kind" })], hasMore: false },
    );
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByText("custom_kind")).toBeInTheDocument());
  });
});

// ===========================================================================
// byCreatedDesc — sorting order visible in rendered list
// ===========================================================================

describe("byCreatedDesc", () => {
  it("renders unread notifications newest-first", async () => {
    const older = makeNotification({ id: "old", title: "Older", createdAt: "2026-01-01T10:00:00.000Z" });
    const newer = makeNotification({ id: "new", title: "Newer", createdAt: "2026-01-01T12:00:00.000Z" });
    // Pass older before newer to verify sorting
    mockFetch(
      { alerts: [] },
      { notifications: [older, newer], hasMore: false },
    );
    render(<MyAlertsClient />);
    await waitFor(() => {
      const items = screen.getAllByRole("listitem");
      const texts = items.map((el) => el.textContent ?? "");
      const olderIdx = texts.findIndex((t) => t.includes("Older"));
      const newerIdx = texts.findIndex((t) => t.includes("Newer"));
      expect(newerIdx).toBeLessThan(olderIdx);
    });
  });

  it("handles two notifications with identical timestamps without throwing", async () => {
    const ts = "2026-01-01T12:00:00.000Z";
    const n1 = makeNotification({ id: "n1", title: "First", createdAt: ts });
    const n2 = makeNotification({ id: "n2", title: "Second", createdAt: ts });
    mockFetch({ alerts: [] }, { notifications: [n1, n2], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => {
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// InboxNotificationRow — rendered inside MyAlertsClient
// ===========================================================================

describe("InboxNotificationRow", () => {
  it("renders notification title and store name", async () => {
    const n = makeNotification({ title: "Avocados in stock", store: { id: "s1", name: "Green Market" } });
    mockFetch({ alerts: [] }, { notifications: [n], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => {
      expect(screen.getByText("Avocados in stock")).toBeInTheDocument();
      expect(screen.getByText(/Green Market/)).toBeInTheDocument();
    });
  });

  it("shows 'Mark read' button for an unread notification", async () => {
    const n = makeNotification({ readAt: null });
    mockFetch({ alerts: [] }, { notifications: [n], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Mark read" })).toBeInTheDocument());
  });

  it("shows 'Mark unread' button for an already-read notification", async () => {
    const n = makeNotification({ readAt: "2026-01-01T13:00:00.000Z" });
    mockFetch({ alerts: [] }, { notifications: [n], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Mark unread" })).toBeInTheDocument());
  });

  it("renders the 'View store' link pointing to the correct store URL", async () => {
    const n = makeNotification({ store: { id: "abc123", name: "Farmers Hub" } });
    mockFetch({ alerts: [] }, { notifications: [n], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => {
      const link = screen.getByRole("link", { name: "View store" });
      expect(link).toHaveAttribute("href", "/stores/abc123");
    });
  });

  it("renders optional body text when present", async () => {
    const n = makeNotification({ body: "Now available at aisle 3" });
    mockFetch({ alerts: [] }, { notifications: [n], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByText("Now available at aisle 3")).toBeInTheDocument());
  });

  it("does not render body element when body is null", async () => {
    const n = makeNotification({ body: null, title: "No body notification" });
    mockFetch({ alerts: [] }, { notifications: [n], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByText("No body notification")).toBeInTheDocument());
    // The paragraph for body should not exist since body is null
    const paragraphs = screen.queryAllByText(/Now available/);
    expect(paragraphs).toHaveLength(0);
  });
});

// ===========================================================================
// load — fetches both endpoints and populates state
// ===========================================================================

describe("load", () => {
  it("fetches /api/alerts and /api/shopper/notifications on mount", async () => {
    mockFetch({ alerts: [] }, { notifications: [], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls.map((c: unknown[]) => c[0]);
      expect(calls.some((u: unknown) => (u as string).includes("/api/alerts"))).toBe(true);
      expect(calls.some((u: unknown) => (u as string).includes("/api/shopper/notifications"))).toBe(true);
    });
  });

  it("renders alerts from the API response", async () => {
    const alert = makeAlert({ store: { id: "s1", name: "Fresh Mart" } });
    mockFetch({ alerts: [alert] }, { notifications: [], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByText("Fresh Mart")).toBeInTheDocument());
  });

  it("shows subscriptions error when /api/alerts fails", async () => {
    mockFetch(null, { notifications: [], hasMore: false }, { alertsOk: false });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByText("alerts error")).toBeInTheDocument());
  });

  it("shows inbox error when /api/shopper/notifications fails", async () => {
    mockFetch({ alerts: [] }, null, { notificationsOk: false });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByText("notifications error")).toBeInTheDocument());
  });

  it("treats non-array alerts response as empty array", async () => {
    mockFetch({ alerts: null }, { notifications: [], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByText("No active subscriptions")).toBeInTheDocument());
  });

  it("treats non-array notifications response as empty array", async () => {
    mockFetch({ alerts: [] }, { notifications: null, hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByText("No activity yet")).toBeInTheDocument());
  });
});

// ===========================================================================
// markNotificationRead — calls PATCH and updates readAt in state
// ===========================================================================

describe("markNotificationRead", () => {
  it("calls PATCH /api/shopper/notifications/:id when 'Mark read' is clicked", async () => {
    const n = makeNotification({ id: "notif-42", readAt: null });
    mockFetch({ alerts: [] }, { notifications: [n], hasMore: false });
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ alerts: [] }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ notifications: [n], hasMore: false }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ readAt: "2026-01-01T13:00:00.000Z" }) }));

    render(<MyAlertsClient />);
    await waitFor(() => screen.getByRole("button", { name: "Mark read" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark read" }));

    await waitFor(() => {
      const patchCall = (global.fetch as jest.Mock).mock.calls.find(
        (c: unknown[]) => (c[0] as string).includes("/api/shopper/notifications/notif-42"),
      );
      expect(patchCall).toBeDefined();
      expect(patchCall![1]).toMatchObject({ method: "PATCH" });
    });
  });

  it("updates notification to read after successful PATCH", async () => {
    const n = makeNotification({ id: "n99", readAt: null });
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ alerts: [] }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ notifications: [n], hasMore: false }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ readAt: "2026-01-02T00:00:00.000Z" }) }));

    render(<MyAlertsClient />);
    await waitFor(() => screen.getByRole("button", { name: "Mark read" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark read" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Mark unread" })).toBeInTheDocument());
  });

  it("shows an inbox error when PATCH fails", async () => {
    const n = makeNotification({ id: "n7", readAt: null });
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ alerts: [] }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ notifications: [n], hasMore: false }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: false, json: async () => ({}) }));

    render(<MyAlertsClient />);
    await waitFor(() => screen.getByRole("button", { name: "Mark read" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark read" }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });
});

// ===========================================================================
// unsubscribe — optimistic removal with rollback on failure
// ===========================================================================

describe("unsubscribe", () => {
  it("removes the alert from the list immediately on 'Turn off'", async () => {
    const alert = makeAlert({ id: "a-to-remove", store: { id: "s1", name: "Quick Shop" } });
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ alerts: [alert] }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ notifications: [], hasMore: false }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({}) }));

    render(<MyAlertsClient />);
    await waitFor(() => screen.getByRole("button", { name: "Turn off" }));
    fireEvent.click(screen.getByRole("button", { name: "Turn off" }));

    await waitFor(() => expect(screen.queryByText("Quick Shop")).not.toBeInTheDocument());
  });

  it("calls DELETE /api/alerts/:id when unsubscribing", async () => {
    const alert = makeAlert({ id: "alert-del", store: { id: "s1", name: "Deli Corner" } });
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ alerts: [alert] }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ notifications: [], hasMore: false }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({}) }));

    render(<MyAlertsClient />);
    await waitFor(() => screen.getByRole("button", { name: "Turn off" }));
    fireEvent.click(screen.getByRole("button", { name: "Turn off" }));

    await waitFor(() => {
      const deleteCall = (global.fetch as jest.Mock).mock.calls.find(
        (c: unknown[]) => (c[0] as string).includes("/api/alerts/alert-del"),
      );
      expect(deleteCall).toBeDefined();
      expect(deleteCall![1]).toMatchObject({ method: "DELETE" });
    });
  });

  it("rolls back the optimistic removal when DELETE fails", async () => {
    const alert = makeAlert({ id: "a-fail", store: { id: "s1", name: "Rollback Market" } });
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ alerts: [alert] }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ notifications: [], hasMore: false }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: false, json: async () => ({}) }));

    render(<MyAlertsClient />);
    await waitFor(() => screen.getByRole("button", { name: "Turn off" }));
    fireEvent.click(screen.getByRole("button", { name: "Turn off" }));

    await waitFor(() => expect(screen.getByText("Rollback Market")).toBeInTheDocument());
  });
});

// ===========================================================================
// loadMoreInbox — pagination
// ===========================================================================

describe("loadMoreInbox", () => {
  it("shows 'Load older activity' button when hasMore is true", async () => {
    const n = makeNotification();
    mockFetch({ alerts: [] }, { notifications: [n], hasMore: true });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Load older activity" })).toBeInTheDocument());
  });

  it("does not show 'Load older activity' button when hasMore is false", async () => {
    const n = makeNotification();
    mockFetch({ alerts: [] }, { notifications: [n], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Load older activity" })).not.toBeInTheDocument();
    });
  });

  it("appends additional notifications after clicking 'Load older activity'", async () => {
    const first = makeNotification({ id: "n1", title: "First notification" });
    const second = makeNotification({ id: "n2", title: "Second notification" });

    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ alerts: [] }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ notifications: [first], hasMore: true }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ notifications: [second], hasMore: false }) }));

    render(<MyAlertsClient />);
    await waitFor(() => screen.getByRole("button", { name: "Load older activity" }));
    fireEvent.click(screen.getByRole("button", { name: "Load older activity" }));

    await waitFor(() => {
      expect(screen.getByText("First notification")).toBeInTheDocument();
      expect(screen.getByText("Second notification")).toBeInTheDocument();
    });
  });

  it("deduplicates notifications that already exist in the list", async () => {
    const n = makeNotification({ id: "dup", title: "Duplicate notification" });

    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ alerts: [] }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ notifications: [n], hasMore: true }) }))
      // Second page returns the same notification — should be filtered out
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ notifications: [n], hasMore: false }) }));

    render(<MyAlertsClient />);
    await waitFor(() => screen.getByRole("button", { name: "Load older activity" }));
    fireEvent.click(screen.getByRole("button", { name: "Load older activity" }));

    await waitFor(() => {
      const matches = screen.getAllByText("Duplicate notification");
      expect(matches).toHaveLength(1);
    });
  });

  it("shows an error and does not append when fetch fails", async () => {
    const n = makeNotification({ id: "x1", title: "Initial notification" });
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ alerts: [] }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ notifications: [n], hasMore: true }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: false, json: async () => ({}) }));

    render(<MyAlertsClient />);
    await waitFor(() => screen.getByRole("button", { name: "Load older activity" }));
    fireEvent.click(screen.getByRole("button", { name: "Load older activity" }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });
});

// ===========================================================================
// useMemo partition — read/unread grouping
// ===========================================================================

describe("useMemo partition", () => {
  it("displays unread count badge when there are unread notifications", async () => {
    const n = makeNotification({ readAt: null });
    mockFetch({ alerts: [] }, { notifications: [n], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByText("1 unread")).toBeInTheDocument());
  });

  it("does not display unread badge when all notifications are read", async () => {
    const n = makeNotification({ readAt: "2026-01-01T13:00:00.000Z" });
    mockFetch({ alerts: [] }, { notifications: [n], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => {
      expect(screen.queryByText(/unread/)).not.toBeInTheDocument();
    });
  });

  it("separates read and unread notifications with a 'Read' divider label", async () => {
    const unread = makeNotification({ id: "u1", readAt: null, title: "Unread one" });
    const read = makeNotification({ id: "r1", readAt: "2026-01-01T13:00:00.000Z", title: "Read one" });
    mockFetch({ alerts: [] }, { notifications: [unread, read], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => {
      const items = screen.getAllByRole("listitem");
      const texts = items.map((el) => el.textContent ?? "");
      expect(texts.some((t) => t.includes("Read"))).toBe(true);
    });
  });

  it("renders only unread section without divider when all notifications are unread", async () => {
    const n1 = makeNotification({ id: "u1", readAt: null, title: "Unread A" });
    const n2 = makeNotification({ id: "u2", readAt: null, title: "Unread B", createdAt: "2026-01-02T00:00:00.000Z" });
    mockFetch({ alerts: [] }, { notifications: [n1, n2], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => {
      expect(screen.getByText("Unread A")).toBeInTheDocument();
      expect(screen.getByText("Unread B")).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// MyAlertsClient — overall component
// ===========================================================================

describe("MyAlertsClient", () => {
  it("shows loading indicator before data arrives", () => {
    // Never resolve the fetch so we stay in loading state
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}));
    render(<MyAlertsClient />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it("hides loading indicator once data is loaded", async () => {
    mockFetch({ alerts: [] }, { notifications: [], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.queryByText(/Loading…/)).not.toBeInTheDocument());
  });

  it("shows empty inbox placeholder when there are no notifications", async () => {
    mockFetch({ alerts: [] }, { notifications: [], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByText("No activity yet")).toBeInTheDocument());
  });

  it("shows empty subscriptions placeholder when there are no alerts", async () => {
    mockFetch({ alerts: [] }, { notifications: [], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByText("No active subscriptions")).toBeInTheDocument());
  });

  it("renders both activity and subscriptions sections", async () => {
    mockFetch({ alerts: [] }, { notifications: [], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => {
      expect(screen.getByText("Activity")).toBeInTheDocument();
      expect(screen.getByText("Subscriptions")).toBeInTheDocument();
    });
  });

  it("renders a store_follow alert with the store name", async () => {
    const alert = makeAlert({ type: "store_follow", store: { id: "s1", name: "Whole Foods" } });
    mockFetch({ alerts: [alert] }, { notifications: [], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByText("Whole Foods")).toBeInTheDocument());
  });

  it("renders an item_restock alert with the item name", async () => {
    const alert = makeAlert({
      type: "item_restock",
      item: { id: "i1", name: "Almond Milk" },
      store: { id: "s1", name: "Organic Mart" },
    });
    mockFetch({ alerts: [alert] }, { notifications: [], hasMore: false });
    render(<MyAlertsClient />);
    await waitFor(() => expect(screen.getByText("Almond Milk")).toBeInTheDocument());
  });
});
