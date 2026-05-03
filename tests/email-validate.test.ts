import { EMAIL_RE } from "@/lib/email/validate";
import { validateSignupInput } from "@/lib/validate-owner-signup";
import { validateShopperSignup } from "@/lib/validate-shopper-signup";

// ---------------------------------------------------------------------------
// EMAIL_RE — shared regex
// ---------------------------------------------------------------------------

describe("EMAIL_RE", () => {
  it("accepts a standard address", () => {
    expect(EMAIL_RE.test("user@example.com")).toBe(true);
  });

  it("accepts a subdomain address", () => {
    expect(EMAIL_RE.test("user@mail.example.com")).toBe(true);
  });

  it("accepts a two-part TLD (co.uk)", () => {
    expect(EMAIL_RE.test("user@example.co.uk")).toBe(true);
  });

  it("rejects an address with no TLD (user@fake)", () => {
    expect(EMAIL_RE.test("user@fake")).toBe(false);
  });

  it("rejects a numeric TLD (user@fake.123)", () => {
    expect(EMAIL_RE.test("user@fake.123")).toBe(false);
  });

  it("rejects a missing domain", () => {
    expect(EMAIL_RE.test("user@")).toBe(false);
  });

  it("rejects a missing local part", () => {
    expect(EMAIL_RE.test("@example.com")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateSignupInput (owner) — parity with EMAIL_RE
// ---------------------------------------------------------------------------

const validOwnerBase = {
  name: "Alice",
  email: "alice@example.com",
  password: "Pass1234",
  confirmPassword: "Pass1234",
};

describe("validateSignupInput (owner) email parity", () => {
  it("rejects user@fake (no TLD)", () => {
    const result = validateSignupInput({ ...validOwnerBase, email: "user@fake" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toMatch(/valid email/i);
  });

  it("rejects user@fake.123 (numeric TLD)", () => {
    const result = validateSignupInput({ ...validOwnerBase, email: "user@fake.123" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toMatch(/valid email/i);
  });

  it("accepts user@example.co.uk", () => {
    const result = validateSignupInput({ ...validOwnerBase, email: "user@example.co.uk" });
    expect(result.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateShopperSignup — parity with EMAIL_RE
// ---------------------------------------------------------------------------

const validShopperBase = {
  name: "Bob",
  email: "bob@example.com",
  password: "Pass1234",
  confirmPassword: "Pass1234",
};

describe("validateShopperSignup email parity", () => {
  it("rejects user@fake (no TLD)", () => {
    const result = validateShopperSignup({ ...validShopperBase, email: "user@fake" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toMatch(/valid email/i);
  });

  it("rejects user@fake.123 (numeric TLD)", () => {
    const result = validateShopperSignup({ ...validShopperBase, email: "user@fake.123" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toMatch(/valid email/i);
  });

  it("accepts user@example.co.uk", () => {
    const result = validateShopperSignup({ ...validShopperBase, email: "user@example.co.uk" });
    expect(result.ok).toBe(true);
  });
});
