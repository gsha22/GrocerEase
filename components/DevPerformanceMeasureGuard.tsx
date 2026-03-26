"use client";

import { useEffect } from "react";

function isNegativeTimestampMeasureError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const msg =
    "message" in err && typeof (err as { message?: unknown }).message === "string"
      ? (err as { message: string }).message
      : "";
  return (
    msg.includes("Failed to execute 'measure' on 'Performance'") &&
    msg.includes("cannot have a negative time stamp")
  );
}

/**
 * Next.js dev-mode (often with Turbopack) can sometimes emit `performance.measure()`
 * calls with a negative startTime for certain routes, which crashes the page.
 * This guard is dev-only and prevents that crash while keeping production untouched.
 * In React StrictMode (dev), effects mount/cleanup/mount twice; we restore the
 * original function in cleanup so patching remains stable across double-invocations.
 */
export default function DevPerformanceMeasureGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof performance === "undefined") return;

    const orig = performance.measure.bind(performance);
    const patchedMeasure: Performance["measure"] = (
      ...args: Parameters<Performance["measure"]>
    ) => {
      try {
        return orig(...args);
      } catch (err) {
        if (isNegativeTimestampMeasureError(err)) {
          console.warn(
            "[DevPerformanceMeasureGuard] Swallowed known Next.js dev instrumentation error:",
            (err as Error).message
          );
          // Preserve return type contract for callers expecting a PerformanceMeasure.
          return {
            name: String(args[0] ?? "measure"),
            entryType: "measure",
            startTime: 0,
            duration: 0,
            toJSON() {
              return {
                name: this.name,
                entryType: this.entryType,
                startTime: this.startTime,
                duration: this.duration,
              };
            },
          } as PerformanceMeasure;
        }
        throw err;
      }
    };
    performance.measure = patchedMeasure;

    return () => {
      performance.measure = orig as Performance["measure"];
    };
  }, []);

  return null;
}

