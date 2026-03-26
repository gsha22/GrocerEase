import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeCallbackPath } from "./safe-callback-path";
import { safeRedirectPathForClient } from "./credentials-sign-in-response";

describe("safeCallbackPath", () => {
  it("defaults invalid values to /dashboard", () => {
    assert.equal(safeCallbackPath(null), "/dashboard");
    assert.equal(safeCallbackPath(""), "/dashboard");
    assert.equal(safeCallbackPath("https://evil.test/x"), "/dashboard");
    assert.equal(safeCallbackPath("//evil.test"), "/dashboard");
    assert.equal(safeCallbackPath("foo"), "/dashboard");
  });

  it("accepts in-app paths", () => {
    assert.equal(safeCallbackPath("/dashboard"), "/dashboard");
    assert.equal(safeCallbackPath(" /profile "), "/profile");
  });
});

describe("safeRedirectPathForClient", () => {
  const origin = "http://localhost:3000";

  it("returns pathname for same-origin absolute URLs", () => {
    assert.equal(
      safeRedirectPathForClient(`${origin}/deals?q=1`, origin),
      "/deals?q=1",
    );
  });

  it("returns relative Location as-is", () => {
    assert.equal(safeRedirectPathForClient("/posts", origin), "/posts");
  });

  it("rejects other origins", () => {
    assert.equal(
      safeRedirectPathForClient("https://evil.test/ok", origin),
      "/dashboard",
    );
  });

  it("rejects protocol-relative URLs", () => {
    assert.equal(safeRedirectPathForClient("//evil.test/hi", origin), "/dashboard");
  });
});
