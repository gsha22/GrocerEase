import { FRESH_UPDATE_PUBLIC_WINDOW_MS } from "@/lib/fresh-updates";

/** Rolling window for profile views & item searches shown on the owner dashboard */
export const DASHBOARD_METRICS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function metricsWindowStart(): Date {
  return new Date(Date.now() - DASHBOARD_METRICS_WINDOW_MS);
}

export function freshPostsWindowStart(): Date {
  return new Date(Date.now() - FRESH_UPDATE_PUBLIC_WINDOW_MS);
}
