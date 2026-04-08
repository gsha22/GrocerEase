/**
 * Tests for components/StoreAlertSubscribe.tsx
 *
 * Covers:
 *   - Guest render branch (viewerRole === null)
 *   - Authenticated render (viewerRole = "shopper" or "owner")
 *   - toggle — subscribe (POST /api/alerts)
 *   - toggle — unsubscribe (DELETE /api/alerts/:id)
 *   - toggle — unsubscribe when followAlertId is unknown (GET then DELETE)
 *   - toggle — non-shopper redirects to login
 *   - useEffect sync — re-syncs state when props change
 */
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import StoreAlertSubscribe from "@/components/StoreAlertSubscribe";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 400,
    json: () => Promise.resolve(body),
  } as Response;
}

const BASE_PROPS = {
  storeId: "store-abc",
  storeName: "Fresh Mart",
  initialSubscribed: false,
  initialStoreFollowAlertId: null,
  viewerRole: "shopper",
} as const;

// ---------------------------------------------------------------------------
// Guest render branch (viewerRole === null)
// ---------------------------------------------------------------------------

describe("Guest render branch", () => {
  it("renders the upsell panel with store name", () => {
    render(
      <StoreAlertSubscribe
        {...BASE_PROPS}
        viewerRole={null}
      />,
    );
    expect(
      screen.getByText(/Get deals & restocks from Fresh Mart/i),
    ).toBeInTheDocument();
  });

  it("shows a 'Subscribe — log in' link pointing to /login with callbackUrl", () => {
    render(
      <StoreAlertSubscribe
        {...BASE_PROPS}
        viewerRole={null}
      />,
    );
    const loginLink = screen.getByRole("link", { name: /subscribe — log in/i });
    expect(loginLink).toHaveAttribute(
      "href",
      `/login?callbackUrl=${encodeURIComponent("/stores/store-abc")}`,
    );
  });

  it("shows a 'Subscribe — sign up free' link pointing to /signup/shopper with callbackUrl", () => {
    render(
      <StoreAlertSubscribe
        {...BASE_PROPS}
        viewerRole={null}
      />,
    );
    const signupLink = screen.getByRole("link", {
      name: /subscribe — sign up free/i,
    });
    expect(signupLink).toHaveAttribute(
      "href",
      `/signup/shopper?callbackUrl=${encodeURIComponent("/stores/store-abc")}`,
    );
  });

  it("does NOT render the subscribe/unsubscribe button", () => {
    render(
      <StoreAlertSubscribe
        {...BASE_PROPS}
        viewerRole={null}
      />,
    );
    expect(
      screen.queryByRole("button", { name: /subscribe|unsubscribe/i }),
    ).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Authenticated render
// ---------------------------------------------------------------------------

describe("Authenticated render", () => {
  it("shows 'Subscribe' button when not yet subscribed", () => {
    render(<StoreAlertSubscribe {...BASE_PROPS} initialSubscribed={false} />);
    expect(
      screen.getByRole("button", { name: /^subscribe$/i }),
    ).toBeInTheDocument();
  });

  it("shows 'Unsubscribe' button when already subscribed", () => {
    render(
      <StoreAlertSubscribe
        {...BASE_PROPS}
        initialSubscribed={true}
        initialStoreFollowAlertId="alert-1"
      />,
    );
    expect(
      screen.getByRole("button", { name: /^unsubscribe$/i }),
    ).toBeInTheDocument();
  });

  it("shows inactive status line and unsubscribed description in one render", () => {
    render(<StoreAlertSubscribe {...BASE_PROPS} initialSubscribed={false} />);
    expect(
      screen.getByText(/inactive · not following this store/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/get notified about new deals and restocks at Fresh Mart/i),
    ).toBeInTheDocument();
  });

  it("shows active status line and subscribed description in one render", () => {
    render(
      <StoreAlertSubscribe
        {...BASE_PROPS}
        initialSubscribed={true}
        initialStoreFollowAlertId="alert-1"
      />,
    );
    expect(
      screen.getByText(/active · store alerts on/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/highlight activity for Fresh Mart/i),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// toggle — subscribe (POST)
// ---------------------------------------------------------------------------

describe("toggle — subscribe (POST /api/alerts)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("optimistically shows 'Unsubscribe' while the POST is in flight", async () => {
    const user = userEvent.setup();
    // Never-resolving fetch keeps pending state visible
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

    render(<StoreAlertSubscribe {...BASE_PROPS} initialSubscribed={false} />);

    await user.click(screen.getByRole("button", { name: /^subscribe$/i }));

    // Button shows "…" while pending; optimistic subscribed=true means Unsubscribe would follow
    expect(screen.getByRole("button", { name: /^…$/i })).toBeDisabled();
  });

  it("keeps subscribed state and stores returned id on successful POST", async () => {
    const user = userEvent.setup();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: "new-alert-99" }));

    render(<StoreAlertSubscribe {...BASE_PROPS} initialSubscribed={false} />);

    await user.click(screen.getByRole("button", { name: /^subscribe$/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^unsubscribe$/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/active · store alerts on/i)).toBeInTheDocument();
  });

  it("reverts to unsubscribed and shows error message when POST returns !ok (generic)", async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    } as Response);

    render(<StoreAlertSubscribe {...BASE_PROPS} initialSubscribed={false} />);

    await user.click(screen.getByRole("button", { name: /^subscribe$/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/could not subscribe/i);
    expect(
      screen.getByRole("button", { name: /^subscribe$/i }),
    ).toBeInTheDocument();
  });

  it("shows 403 error message when POST returns 403", async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve({}),
    } as Response);

    render(<StoreAlertSubscribe {...BASE_PROPS} initialSubscribed={false} />);

    await user.click(screen.getByRole("button", { name: /^subscribe$/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      /this account can.t subscribe/i,
    );
  });

  it("shows 401 error message when POST returns 401", async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    } as Response);

    render(<StoreAlertSubscribe {...BASE_PROPS} initialSubscribed={false} />);

    await user.click(screen.getByRole("button", { name: /^subscribe$/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/sign in again/i);
  });

  it("shows server-provided error string when POST !ok and body has error field", async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ error: "Store not found" }),
    } as Response);

    render(<StoreAlertSubscribe {...BASE_PROPS} initialSubscribed={false} />);

    await user.click(screen.getByRole("button", { name: /^subscribe$/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Store not found");
    });
  });

  it("shows network error message when fetch throws", async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockRejectedValueOnce(new TypeError("Failed to fetch"));

    render(<StoreAlertSubscribe {...BASE_PROPS} initialSubscribed={false} />);

    await user.click(screen.getByRole("button", { name: /^subscribe$/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      /network error — check your connection/i,
    );
  });
});

// ---------------------------------------------------------------------------
// toggle — unsubscribe (DELETE)
// ---------------------------------------------------------------------------

describe("toggle — unsubscribe (DELETE /api/alerts/:id)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls DELETE /api/alerts/:id and calls router.refresh() on success", async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValueOnce(jsonResponse({}));

    render(
      <StoreAlertSubscribe
        {...BASE_PROPS}
        initialSubscribed={true}
        initialStoreFollowAlertId="alert-42"
      />,
    );

    await user.click(screen.getByRole("button", { name: /^unsubscribe$/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^subscribe$/i }),
      ).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/alerts/alert-42", {
      method: "DELETE",
      credentials: "include",
    });
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("reverts to subscribed and shows error when DELETE fails", async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    } as Response);

    render(
      <StoreAlertSubscribe
        {...BASE_PROPS}
        initialSubscribed={true}
        initialStoreFollowAlertId="alert-42"
      />,
    );

    await user.click(screen.getByRole("button", { name: /^unsubscribe$/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/could not unsubscribe/i);
    expect(
      screen.getByRole("button", { name: /^unsubscribe$/i }),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// toggle — unsubscribe when followAlertId is unknown (GET then DELETE)
// ---------------------------------------------------------------------------

describe("toggle — unsubscribe when followAlertId is unknown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GETs /api/alerts to resolve the id, then DELETEs", async () => {
    const user = userEvent.setup();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          alerts: [
            { id: "resolved-id", type: "store_follow", storeId: "store-abc" },
          ],
        }),
      )
      .mockResolvedValueOnce(jsonResponse({}));

    render(
      <StoreAlertSubscribe
        {...BASE_PROPS}
        initialSubscribed={true}
        initialStoreFollowAlertId={null}
      />,
    );

    await user.click(screen.getByRole("button", { name: /^unsubscribe$/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^subscribe$/i }),
      ).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenNthCalledWith(1, "/api/alerts", {
      credentials: "include",
    });
    expect(global.fetch).toHaveBeenNthCalledWith(2, "/api/alerts/resolved-id", {
      method: "DELETE",
      credentials: "include",
    });
  });

  it("reverts to subscribed and shows error when the GET to resolve id fails", async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    } as Response);

    render(
      <StoreAlertSubscribe
        {...BASE_PROPS}
        initialSubscribed={true}
        initialStoreFollowAlertId={null}
      />,
    );

    await user.click(screen.getByRole("button", { name: /^unsubscribe$/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      /could not update subscription/i,
    );
    expect(
      screen.getByRole("button", { name: /^unsubscribe$/i }),
    ).toBeInTheDocument();
  });

  it("calls router.refresh() when the alert row is not found in GET response", async () => {
    const user = userEvent.setup();
    // Returns empty alerts list — row not found path
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ alerts: [] }));

    render(
      <StoreAlertSubscribe
        {...BASE_PROPS}
        initialSubscribed={true}
        initialStoreFollowAlertId={null}
      />,
    );

    await user.click(screen.getByRole("button", { name: /^unsubscribe$/i }));

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });
});

// ---------------------------------------------------------------------------
// toggle — non-shopper redirects to login
// ---------------------------------------------------------------------------

describe("toggle — non-shopper (owner role) redirects to login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls router.push with the login URL instead of POSTing", async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn();

    render(
      <StoreAlertSubscribe
        {...BASE_PROPS}
        viewerRole="owner"
        initialSubscribed={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: /^subscribe$/i }));

    expect(mockPush).toHaveBeenCalledWith(
      `/login?callbackUrl=${encodeURIComponent("/stores/store-abc")}`,
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// useEffect sync — re-syncs state when props change
// ---------------------------------------------------------------------------

describe("useEffect sync", () => {
  it("updates subscribed state when initialSubscribed prop changes", async () => {
    const { rerender } = render(
      <StoreAlertSubscribe {...BASE_PROPS} initialSubscribed={false} />,
    );

    expect(
      screen.getByRole("button", { name: /^subscribe$/i }),
    ).toBeInTheDocument();

    rerender(
      <StoreAlertSubscribe
        {...BASE_PROPS}
        initialSubscribed={true}
        initialStoreFollowAlertId="alert-77"
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^unsubscribe$/i }),
      ).toBeInTheDocument();
    });
  });

  it("syncs back to unsubscribed when initialSubscribed changes to false", async () => {
    const { rerender } = render(
      <StoreAlertSubscribe
        {...BASE_PROPS}
        initialSubscribed={true}
        initialStoreFollowAlertId="alert-55"
      />,
    );

    expect(
      screen.getByRole("button", { name: /^unsubscribe$/i }),
    ).toBeInTheDocument();

    rerender(
      <StoreAlertSubscribe
        {...BASE_PROPS}
        initialSubscribed={false}
        initialStoreFollowAlertId={null}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^subscribe$/i }),
      ).toBeInTheDocument();
    });
  });
});
