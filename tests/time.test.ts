import { parseHHmm } from "@/lib/time";

describe("parseHHmm", () => {
  it("passes through a valid HH:mm string unchanged", () => {
    expect(parseHHmm("08:30")).toBe("08:30");
  });

  it("normalizes HH:mm:ss to HH:mm", () => {
    expect(parseHHmm("08:30:00")).toBe("08:30");
  });

  it("pads a single-digit hour", () => {
    expect(parseHHmm("8:05")).toBe("08:05");
  });

  it("normalizes single-digit hour with seconds", () => {
    expect(parseHHmm("9:00:00")).toBe("09:00");
  });

  it("returns null for an out-of-range hour", () => {
    expect(parseHHmm("99:00")).toBeNull();
    expect(parseHHmm("24:00")).toBeNull();
  });

  it("returns null for an out-of-range minute", () => {
    expect(parseHHmm("08:60")).toBeNull();
    expect(parseHHmm("08:99")).toBeNull();
  });

  it("returns null for trailing non-time characters", () => {
    expect(parseHHmm("12:34abc")).toBeNull();
  });

  it("returns null for a non-time string", () => {
    expect(parseHHmm("invalid")).toBeNull();
  });

  it("returns null for a non-string value", () => {
    expect(parseHHmm(null)).toBeNull();
    expect(parseHHmm(undefined)).toBeNull();
    expect(parseHHmm(830)).toBeNull();
  });
});
