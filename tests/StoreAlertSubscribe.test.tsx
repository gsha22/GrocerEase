import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import StoreAlertSubscribe, {
  describeSubscribeFailure,
  pickSubscribeAlertId,
  storeAlertLoginHref,
  storeAlertShopperSignupHref,
  storeAlertCallbackPath,
} from "@/components/StoreAlertSubscribe";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

describe("storeAlertCallbackPath", () => {
  it("builds /stores/:id path", () => {
    expect(storeAlertCallbackPath("abc")).toBe("/stores/abc");
  });
});

describe("storeAlertLoginHref", () => {
  it("embeds encoded callback URL", () => {
    const h = storeAlertLoginHref("xyz");
    expect(new URL(h, "http://localhost").searchParams.get("callbackUrl")).toBe(
      "/stores/xyz",
    );
  });
});

describe("storeAlertShopperSignupHref", () => {
  it("targets shopper signup with callback", () => {
    const h = storeAlertShopperSignupHref("xyz");
    expect(h).toContain("/signup/shopper");
    expect(h).toContain("callbackUrl=");
  });
});

describe("pickSubscribeAlertId", () => {
  it("returns id when string non-empty", () => {
    expect(pickSubscribeAlertId({ id: "a1" })).toBe("a1");
  });

  it("returns null for missing id", () => {
    expect(pickSubscribeAlertId({})).toBeNull();
  });
});

describe("describeSubscribeFailure", () => {
  it("prefers server error string", () => {
    expect(
      describeSubscribeFailure(400, { error: "Duplicate" }),
    ).toBe("Duplicate");
  });

  it("maps 403 to shopper hint", () => {
    expect(describeSubscribeFailure(403, {})).toContain("shopper");
  });

  it("maps 401 to sign-in hint", () => {
    expect(describeSubscribeFailure(401, {})).toContain("Sign in");
  });
});

describe("StoreAlertSubscribe", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockRefresh.mockClear();
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ id: "new-alert" }),
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows guest CTAs when viewerRole is null", () => {
    render(
      <StoreAlertSubscribe
        storeId="s1"
        storeName="Mart"
        initialSubscribed={false}
        initialStoreFollowAlertId={null}
        viewerRole={null}
      />,
    );
    expect(screen.getByText(/Subscribe — log in/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up free/i)).toBeInTheDocument();
  });

  it("redirects non-shopper to login when clicking Subscribe", async () => {
    const user = userEvent.setup();
    render(
      <StoreAlertSubscribe
        storeId="s1"
        storeName="Mart"
        initialSubscribed={false}
        initialStoreFollowAlertId={null}
        viewerRole="owner"
      />,
    );
    await user.click(screen.getByRole("button", { name: /^Subscribe$/i }));
    expect(mockPush).toHaveBeenCalledWith(storeAlertLoginHref("s1"));
  });
});
