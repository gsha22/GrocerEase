"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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

export const INBOX_KIND_LABELS: Record<string, string> = {
  store_fresh_update: "Fresh update",
  store_new_deal: "New deal",
};

export function inboxKindLabel(kind: string): string {
  return INBOX_KIND_LABELS[kind] ?? kind;
}

export function notificationsByCreatedDesc(
  a: NotificationRow,
  b: NotificationRow,
): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function InboxNotificationRow({
  n,
  markNotificationRead,
}: {
  n: NotificationRow;
  markNotificationRead: (id: string, read: boolean) => void | Promise<void>;
}) {
  const unread = !n.readAt;
  return (
    <li
      className={`rounded-xl border px-4 py-3 transition-colors duration-200 ${
        unread
          ? "border-green-200 bg-green-50/50 shadow-sm"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wide text-green-800 bg-green-100/80 px-2 py-0.5 rounded-full">
              {inboxKindLabel(n.kind)}
            </span>
            {!unread ? (
              <span className="text-[11px] text-gray-400">Read</span>
            ) : null}
          </div>
          <p className="text-[15px] font-semibold text-gray-900 mt-1.5">{n.title}</p>
          {n.body ? (
            <p className="text-[13px] text-gray-600 mt-0.5">{n.body}</p>
          ) : null}
          <p className="text-[12px] text-gray-400 mt-2">
            {n.store.name} ·{" "}
            {new Date(n.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            href={`/stores/${n.store.id}`}
            className="inline-flex justify-center items-center px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-green-600 text-white hover:bg-green-800 transition-colors"
          >
            View store
          </Link>
          {unread ? (
            <button
              type="button"
              onClick={() => markNotificationRead(n.id, true)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Mark read
            </button>
          ) : (
            <button
              type="button"
              onClick={() => markNotificationRead(n.id, false)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Mark unread
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export default function MyAlertsClient() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [inboxHasMore, setInboxHasMore] = useState(false);
  const [inboxLoadingMore, setInboxLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inboxError, setInboxError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setInboxError(null);
    const [aRes, nRes] = await Promise.all([
      fetch("/api/alerts", { credentials: "include" }),
      fetch("/api/shopper/notifications?skip=0&take=50", {
        credentials: "include",
      }),
    ]);

    if (!aRes.ok) {
      let msg = "Could not load subscriptions.";
      try {
        const d = (await aRes.json()) as { error?: string };
        if (d.error) msg = d.error;
      } catch {
        /* ignore */
      }
      setError(msg);
      setAlerts([]);
    } else {
      const data = (await aRes.json()) as { alerts?: AlertRow[] };
      setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
    }

    if (nRes.ok) {
      const nd = (await nRes.json()) as {
        notifications?: NotificationRow[];
        hasMore?: boolean;
      };
      setNotifications(Array.isArray(nd.notifications) ? nd.notifications : []);
      setInboxHasMore(Boolean(nd.hasMore));
    } else {
      let msg = "Could not load activity.";
      try {
        const d = (await nRes.json()) as { error?: string };
        if (d.error) msg = d.error;
      } catch {
        /* ignore */
      }
      setInboxError(msg);
      setNotifications([]);
      setInboxHasMore(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function unsubscribe(alert: AlertRow) {
    const previous = alerts;
    setAlerts((list) => list.filter((a) => a.id !== alert.id));
    setError(null);
    const res = await fetch(`/api/alerts/${alert.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      setAlerts(previous);
      setError("Could not turn off that alert. Try again.");
    }
  }

  async function markNotificationRead(id: string, read: boolean) {
    setInboxError(null);
    const res = await fetch(`/api/shopper/notifications/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
    if (!res.ok) {
      setInboxError("Could not update read status. Try again.");
      return;
    }
    const data = (await res.json()) as { readAt?: string | null };
    setNotifications((list) =>
      list.map((n) =>
        n.id === id ? { ...n, readAt: data.readAt ?? null } : n,
      ),
    );
  }

  async function loadMoreInbox() {
    if (!inboxHasMore || inboxLoadingMore) return;
    setInboxError(null);
    setInboxLoadingMore(true);
    try {
      const skip = notifications.length;
      const res = await fetch(
        `/api/shopper/notifications?skip=${skip}&take=50`,
        { credentials: "include" },
      );
      if (!res.ok) {
        setInboxError("Could not load more activity.");
        return;
      }
      const data = (await res.json()) as {
        notifications?: NotificationRow[];
        hasMore?: boolean;
      };
      const more = Array.isArray(data.notifications) ? data.notifications : [];
      setNotifications((prev) => {
        const seen = new Set(prev.map((n) => n.id));
        const merged = more.filter((n) => !seen.has(n.id));
        return [...prev, ...merged];
      });
      setInboxHasMore(Boolean(data.hasMore));
    } finally {
      setInboxLoadingMore(false);
    }
  }

  const { inboxUnread, inboxRead } = useMemo(() => {
    const unread = notifications
      .filter((n) => !n.readAt)
      .sort(notificationsByCreatedDesc);
    const read = notifications
      .filter((n) => n.readAt)
      .sort(notificationsByCreatedDesc);
    return { inboxUnread: unread, inboxRead: read };
  }, [notifications]);

  if (loading) {
    return <p className="text-[14px] text-gray-400">Loading…</p>;
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-10">
      <section aria-labelledby="activity-heading">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
          <div>
            <h2
              id="activity-heading"
              className="font-display text-[20px] font-semibold text-gray-800"
            >
              Activity
            </h2>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Updates from stores you follow (new posts and deals).
            </p>
          </div>
          {unreadCount > 0 ? (
            <span className="text-[12px] font-medium text-green-800 bg-green-50 px-2.5 py-1 rounded-full w-fit">
              {unreadCount} unread
            </span>
          ) : null}
        </div>

        {inboxError ? (
          <p
            className="text-[13px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3"
            role="alert"
          >
            {inboxError}
          </p>
        ) : null}

        {notifications.length === 0 ? (
          inboxError ? null : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 text-center">
              <p className="text-[14px] text-gray-600 mb-1">No activity yet</p>
              <p className="text-[13px] text-gray-500 max-w-[320px] mx-auto">
                When a store you follow posts in{" "}
                <strong className="text-gray-700">Fresh today</strong> or adds a deal, it will show
                up here.
              </p>
            </div>
          )
        ) : (
          <ul className="space-y-2">
            {inboxUnread.map((n) => (
              <InboxNotificationRow
                key={n.id}
                n={n}
                markNotificationRead={markNotificationRead}
              />
            ))}
            {inboxRead.length > 0 && inboxUnread.length > 0 ? (
              <li
                className="list-none pt-4 pb-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-1"
                aria-hidden
              >
                Read
              </li>
            ) : null}
            {inboxRead.map((n) => (
              <InboxNotificationRow
                key={n.id}
                n={n}
                markNotificationRead={markNotificationRead}
              />
            ))}
          </ul>
        )}

        {notifications.length > 0 && inboxHasMore ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => void loadMoreInbox()}
              disabled={inboxLoadingMore}
              className="text-[13px] font-medium text-green-700 hover:text-green-900 disabled:opacity-50"
            >
              {inboxLoadingMore ? "Loading…" : "Load older activity"}
            </button>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="subscriptions-heading">
        <h2
          id="subscriptions-heading"
          className="font-display text-[20px] font-semibold text-gray-800 mb-1"
        >
          Subscriptions
        </h2>
        <p className="text-[13px] text-gray-500 mb-4">
          Turn off an alert to stop following that store or item.
        </p>

        {error && alerts.length === 0 && notifications.length === 0 ? (
          <p className="text-[14px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : null}

        {alerts.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
            <div className="text-[36px] mb-2">🔔</div>
            <p className="text-[15px] text-gray-700 font-medium mb-1">
              No active subscriptions
            </p>
            <p className="text-[13px] text-gray-500 max-w-[280px] mx-auto">
              Follow a store or turn on item notifications from a store page.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {error ? (
              <p className="text-[13px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            ) : null}
            {alerts.map((a) => (
              <li
                key={a.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                    <span className="text-[11px] font-medium text-gray-500 uppercase">
                      {a.type === "store_follow" ? "Store" : "Item restock"}
                    </span>
                  </div>
                  <p className="text-[15px] font-semibold text-gray-800 mt-1">
                    {a.type === "store_follow"
                      ? a.store?.name ?? "Store"
                      : a.item?.name ?? "Item"}
                  </p>
                  <p className="text-[13px] text-gray-500 mt-0.5">
                    {a.type === "item_restock" && a.store?.name
                      ? `${a.store.name} · `
                      : null}
                    Subscribed{" "}
                    {new Date(a.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => unsubscribe(a)}
                  className="shrink-0 px-3 py-2 rounded-lg text-[13px] font-medium border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-800 hover:border-red-100 transition-colors"
                >
                  Turn off
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
