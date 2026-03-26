"use client";

import { useCallback, useEffect, useState } from "react";
import { relativeTime } from "@/lib/time";

type ApiPost = {
  id: string;
  itemName: string;
  note: string | null;
  createdAt: string;
};

type EditState = {
  itemName: string;
  note: string;
};

export default function ManagePostsClient({ storeId }: { storeId: string }) {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [itemName, setItemName] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditState>({ itemName: "", note: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    const res = await fetch(`/api/stores/${storeId}/posts`);
    if (!res.ok) {
      let message = "Could not load posts. Refresh the page or sign in again.";
      try {
        const data = (await res.json()) as { error?: string };
        if (typeof data.error === "string" && data.error) message = data.error;
      } catch {
        // Ignore body parse errors.
      }
      setLoadError(message);
      setPosts([]);
      return;
    }
    const data = await res.json();
    setPosts(data.posts ?? []);
  }, [storeId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await load();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [load]);

  async function submitNewPost(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!itemName.trim()) {
      setError("Item name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: itemName.trim(),
          note: note.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not create post.");
        return;
      }

      setItemName("");
      setNote("");
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  function beginEdit(post: ApiPost) {
    setError(null);
    setEditingPostId(post.id);
    setEditDraft({
      itemName: post.itemName,
      note: post.note ?? "",
    });
  }

  function cancelEdit() {
    setEditingPostId(null);
    setEditDraft({ itemName: "", note: "" });
  }

  async function saveEdit(postId: string) {
    setError(null);
    if (!editDraft.itemName.trim()) {
      setError("Item name cannot be empty.");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: editDraft.itemName.trim(),
          note: editDraft.note.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not save post changes.");
        return;
      }
      setEditingPostId(null);
      await load();
    } finally {
      setSavingEdit(false);
    }
  }

  async function deletePost(postId: string) {
    setError(null);
    const confirmed = window.confirm("Delete this post? Shoppers will stop seeing it immediately.");
    if (!confirmed) return;

    const res = await fetch(`/api/stores/${storeId}/posts/${postId}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not delete post.");
      return;
    }
    if (editingPostId === postId) cancelEdit();
    await load();
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="text-[17px] font-semibold text-gray-800 mb-4">Post a fresh update</h2>
        <form onSubmit={submitNewPost} className="space-y-4">
          {error && (
            <div className="text-[13px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
              Item name *
            </label>
            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
              placeholder="e.g. Bok Choy, Lamb Shoulder"
              required
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
              Note (optional)
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
              placeholder="e.g. Just arrived from local farm - very limited"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-md text-sm font-semibold text-white bg-green-600 hover:bg-green-800 transition-colors disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post update"}
          </button>
        </form>
      </div>

      <h2 className="text-[17px] font-semibold text-gray-800 mb-4">Your posts</h2>

      {loading ? (
        <p className="text-[14px] text-gray-400">Loading posts...</p>
      ) : loadError ? (
        <p className="text-[14px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {loadError}
        </p>
      ) : posts.length === 0 ? (
        <p className="text-[14px] text-gray-400">No posts yet. Share what is fresh today.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => {
            const isEditing = editingPostId === post.id;

            return (
              <div
                key={post.id}
                className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[12px] font-medium text-gray-600 mb-1">
                        Item name
                      </label>
                      <input
                        value={editDraft.itemName}
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            itemName: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-[14px] outline-none focus:border-green-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-gray-600 mb-1">
                        Note
                      </label>
                      <input
                        value={editDraft.note}
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            note: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-[14px] outline-none focus:border-green-400"
                        placeholder="Optional note for shoppers"
                      />
                    </div>
                    <div className="flex gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-3 py-1 rounded-md text-[12px] font-medium border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(post.id)}
                        disabled={savingEdit}
                        className="px-3 py-1 rounded-md text-[12px] font-medium border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        {savingEdit ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-2xl w-11 h-11 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
                      🌿
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[15px] truncate">{post.itemName}</div>
                      <div className="text-[12px] text-gray-400 mt-0.5">
                        {post.note ? `${post.note} · ` : ""}
                        posted {relativeTime(post.createdAt)}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => beginEdit(post)}
                        className="px-3 py-1 rounded-md text-[12px] font-medium border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePost(post.id)}
                        className="px-3 py-1 rounded-md text-[12px] font-medium border border-gray-200 hover:bg-red-50 hover:text-red-800 hover:border-red-200 transition-colors text-gray-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
