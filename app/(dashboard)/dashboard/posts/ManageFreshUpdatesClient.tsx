"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_ITEM_NAME_LEN, MAX_NOTE_LEN } from "@/lib/fresh-updates";
import { relativeTime } from "@/lib/time";

type ApiFreshUpdate = {
  id: string;
  itemName: string;
  note: string | null;
  createdAt: string;
  isStale: boolean;
};

export default function ManageFreshUpdatesClient({ storeId }: { storeId: string }) {
  const [updates, setUpdates] = useState<ApiFreshUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editNote, setEditNote] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const submitAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      submitAbortRef.current?.abort();
    };
  }, []);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!mountedRef.current) return;
      setLoadError(null);
      try {
        const res = await fetch(`/api/stores/${storeId}/updates?all=true`, {
          signal,
        });
        if (signal?.aborted) return;
        if (!mountedRef.current) return;
        if (!res.ok) {
          let msg = "Could not load updates. Refresh the page or sign in again.";
          try {
            const data = (await res.json()) as { error?: string };
            if (typeof data.error === "string" && data.error) msg = data.error;
          } catch {
            /* ignore */
          }
          setLoadError(msg);
          setUpdates([]);
          return;
        }
        const data = (await res.json()) as { updates?: ApiFreshUpdate[] };
        if (!mountedRef.current) return;
        setUpdates(data.updates ?? []);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (!mountedRef.current) return;
        setLoadError("Could not load updates. Refresh the page or sign in again.");
        setUpdates([]);
      }
    },
    [storeId],
  );

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        await load(ac.signal);
      } finally {
        if (mountedRef.current && !ac.signal.aborted) setLoading(false);
      }
    })();
    return () => {
      ac.abort();
    };
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const name = itemName.trim();
    if (!name) {
      setError("Item name is required.");
      return;
    }
    submitAbortRef.current?.abort();
    const ac = new AbortController();
    submitAbortRef.current = ac;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: name,
          note: note.trim() || undefined,
        }),
        signal: ac.signal,
      });
      if (ac.signal.aborted || !mountedRef.current) return;
      const data = await res.json().catch(() => ({}));
      if (ac.signal.aborted || !mountedRef.current) return;
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Could not post update.",
        );
        return;
      }
      setItemName("");
      setNote("");
      setSuccess("Posted. Shoppers will see it on your store page right away.");
      await load(ac.signal);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (!mountedRef.current) return;
      setError("Could not post update.");
    } finally {
      if (mountedRef.current && !ac.signal.aborted) setSubmitting(false);
    }
  }

  function beginEdit(update: ApiFreshUpdate) {
    setError(null);
    setSuccess(null);
    setEditError(null);
    setEditingId(update.id);
    setEditItemName(update.itemName);
    setEditNote(update.note ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditItemName("");
    setEditNote("");
    setEditError(null);
  }

  async function saveEdit(postId: string) {
    setEditError(null);
    const name = editItemName.trim();
    if (!name) {
      setEditError("Item name is required.");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: name,
          note: editNote.trim() || "",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        post?: {
          id: string;
          itemName: string;
          note: string | null;
          createdAt: string;
        };
      };
      if (!res.ok) {
        setEditError(typeof data.error === "string" ? data.error : "Could not save edits.");
        return;
      }

      const post = data.post;
      if (post) {
        setUpdates((current) =>
          current.map((u) =>
            u.id === post.id
              ? {
                  ...u,
                  itemName: post.itemName,
                  note: post.note,
                }
              : u,
          ),
        );
      }
      cancelEdit();
      setSuccess("Post updated.");
    } catch {
      setEditError("Could not save edits.");
    } finally {
      if (mountedRef.current) setSavingEdit(false);
    }
  }

  async function deletePost(postId: string) {
    const confirmed = window.confirm("Delete this post? This cannot be undone.");
    if (!confirmed) return;

    setError(null);
    setSuccess(null);
    setDeletingId(postId);
    try {
      const res = await fetch(`/api/stores/${storeId}/posts/${postId}`, {
        method: "DELETE",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not delete post.");
        return;
      }
      setUpdates((current) => current.filter((u) => u.id !== postId));
      if (editingId === postId) cancelEdit();
      setSuccess("Post deleted.");
    } catch {
      setError("Could not delete post.");
    } finally {
      if (mountedRef.current) setDeletingId(null);
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="text-[17px] font-semibold text-gray-800 mb-1">
          Post a fresh update
        </h2>
        <p className="text-[13px] text-gray-500 mb-4">
          Shoppers see these under Fresh Today on{" "}
          <Link
            href={`/stores/${storeId}`}
            className="text-green-600 font-medium hover:text-green-800"
          >
            your store page
          </Link>
          .
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="text-[13px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="text-[13px] text-green-800 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              {success}
            </div>
          )}
          <div>
            <label
              htmlFor="fresh-item-name"
              className="block text-[13px] font-medium text-gray-600 mb-1.5"
            >
              Item name *
            </label>
            <input
              id="fresh-item-name"
              value={itemName}
              maxLength={MAX_ITEM_NAME_LEN}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
              placeholder="e.g. Bok Choy, Lamb Shoulder"
              autoComplete="off"
            />
          </div>
          <div>
            <label
              htmlFor="fresh-note"
              className="block text-[13px] font-medium text-gray-600 mb-1.5"
            >
              Note (optional)
            </label>
            <textarea
              id="fresh-note"
              value={note}
              maxLength={MAX_NOTE_LEN}
              rows={2}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors resize-y min-h-[80px]"
              placeholder="e.g. Just arrived from local farm — very limited"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-md text-sm font-semibold text-white bg-green-600 hover:bg-green-800 transition-colors disabled:opacity-60 disabled:pointer-events-none"
          >
            {submitting ? "Posting…" : "Post update"}
          </button>
        </form>
      </div>

      <h2 className="text-[17px] font-semibold text-gray-800 mb-4">
        Your recent updates
      </h2>
      <p className="text-[13px] text-gray-500 mb-3">
        Newest first. Updates older than about two days show as faded — same as
        shoppers see.
      </p>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[72px] rounded-xl border border-gray-100 bg-gray-50 animate-pulse"
            />
          ))}
        </div>
      ) : loadError ? (
        <p className="text-[14px] text-red-700">{loadError}</p>
      ) : updates.length === 0 ? (
        <p className="text-[14px] text-gray-500 py-6">
          No updates yet. Post what just came in so nearby shoppers know to stop
          by.
        </p>
      ) : (
        <ul className="space-y-2">
          {updates.map((u) => {
            const stale = u.isStale;
            const when = relativeTime(u.createdAt);
            return (
              <li
                key={u.id}
                className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm ${
                  stale ? "opacity-50" : ""
                }`}
              >
                <div className="min-w-0">
                  {editingId === u.id ? (
                    <div className="space-y-2">
                      <input
                        value={editItemName}
                        maxLength={MAX_ITEM_NAME_LEN}
                        onChange={(e) => setEditItemName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md border border-gray-300 text-[14px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
                        aria-label="Edit item name"
                      />
                      <textarea
                        value={editNote}
                        maxLength={MAX_NOTE_LEN}
                        rows={2}
                        onChange={(e) => setEditNote(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md border border-gray-300 text-[13px] text-gray-700 bg-white outline-none focus:border-green-400 transition-colors resize-y min-h-[70px]"
                        aria-label="Edit note"
                      />
                      {editError && (
                        <div className="text-[12px] text-red-700 bg-red-50 border border-red-100 rounded-md px-2.5 py-1.5">
                          {editError}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div
                        className={`font-medium text-gray-800 truncate ${
                          stale ? "text-[14px]" : "text-[15px]"
                        }`}
                      >
                        {u.itemName}
                      </div>
                      {u.note && (
                        <div className="text-[13px] text-gray-500 mt-0.5 line-clamp-2">
                          {u.note}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[12px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                      stale
                        ? "bg-gray-100 text-gray-500"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {when ?? "—"}
                  </span>
                  {editingId === u.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void saveEdit(u.id)}
                        disabled={savingEdit}
                        className="text-[12px] px-2 py-0.5 rounded-md font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
                      >
                        {savingEdit ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={savingEdit}
                        className="text-[12px] px-2 py-0.5 rounded-md font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => beginEdit(u)}
                        className="text-[12px] px-2 py-0.5 rounded-md font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void deletePost(u.id)}
                        disabled={deletingId === u.id}
                        className="text-[12px] px-2 py-0.5 rounded-md font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-60"
                      >
                        {deletingId === u.id ? "Deleting..." : "Delete"}
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
