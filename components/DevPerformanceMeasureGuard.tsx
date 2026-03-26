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
 */
export default function DevPerformanceMeasureGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof performance === "undefined") return;

    const orig = performance.measure.bind(performance);
    performance.measure = ((...args: Parameters<Performance["measure"]>) => {
      try {
        return orig(...args);
      } catch (err) {
        if (isNegativeTimestampMeasureError(err)) {
          // Swallow only this known dev-only instrumentation failure.
          return;
        }
        throw err;
      }
    }) as Performance["measure"];

    return () => {
      performance.measure = orig as Performance["measure"];
    };
  }, []);

  return null;
}

