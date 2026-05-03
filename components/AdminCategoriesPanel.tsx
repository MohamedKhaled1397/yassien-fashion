"use client";

import type { Category } from "@/lib/categories";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminCategoriesPanel({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to add category");
        return;
      }
      setName("");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function saveEdit(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Update failed");
        return;
      }
      setEditingId(null);
      router.refresh();
    } catch {
      setError("Network error");
    }
  }

  async function removeCategory(id: string) {
    if (!confirm("Delete this category? Products in it will be moved to another category.")) {
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Delete failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100">
        Categories
      </h2>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        Manage categories used in the shop and on each product.
      </p>

      <form onSubmit={addCategory} className="mt-6 flex flex-wrap gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="min-w-[12rem] flex-1 rounded-lg border border-stone-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          maxLength={120}
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-stone-900"
        >
          Add category
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <ul className="mt-8 divide-y divide-stone-100 dark:divide-zinc-800">
        {initialCategories.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-3 py-4">
            {editingId === c.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="min-w-[10rem] flex-1 rounded border border-stone-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
                  maxLength={120}
                />
                <button
                  type="button"
                  onClick={() => void saveEdit(c.id)}
                  className="text-sm font-medium text-indigo-700 dark:text-indigo-400"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-sm text-stone-500"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="min-w-0 flex-1 font-medium text-stone-900 dark:text-stone-100">
                  {c.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(c.id);
                    setEditName(c.name);
                  }}
                  className="text-sm font-medium text-indigo-700 dark:text-indigo-400"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => void removeCategory(c.id)}
                  className="text-sm font-medium text-red-700 dark:text-red-400"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
