"use client";

import type { Category } from "@/lib/categories";
import { AdminCategoriesPanel } from "@/components/AdminCategoriesPanel";
import { AdminSiteSocialPanel } from "@/components/AdminSiteSocialPanel";
import type { Product } from "@/lib/products";
import { productImageSrc } from "@/lib/product-image-url";
import type { SiteSocial } from "@/lib/site-social";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminDashboard({
  initialProducts,
  initialCategories,
  initialSocial,
}: {
  initialProducts: Product[];
  initialCategories: Category[];
  initialSocial: SiteSocial;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function clearAlerts() {
    setMessage(null);
    setError(null);
  }

  return (
    <div className="space-y-10">
      <AdminSiteSocialPanel initial={initialSocial} />
      <AdminCategoriesPanel initialCategories={initialCategories} />
      <AddProductForm
        categories={initialCategories}
        onDone={() => {
          clearAlerts();
          setMessage("Product added.");
          router.refresh();
        }}
        onError={(msg) => {
          clearAlerts();
          setError(msg);
        }}
      />
      {(message || error) && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            error
              ? "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-200"
              : "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
          }`}
        >
          {error ?? message}
        </div>
      )}
      <section>
        <h2 className="mb-4 font-serif text-xl text-stone-900 dark:text-stone-100">
          Products ({initialProducts.length})
        </h2>
        <ul className="space-y-6">
          {initialProducts.map((p) => (
            <AdminProductRow
              key={p.id}
              product={p}
              categories={initialCategories}
              onChanged={() => {
                clearAlerts();
                setMessage("Saved.");
                router.refresh();
              }}
              onError={(msg) => {
                clearAlerts();
                setError(msg);
              }}
              onDeleted={() => {
                clearAlerts();
                setMessage("Product removed.");
                router.refresh();
              }}
            />
          ))}
        </ul>
        {initialProducts.length === 0 && (
          <p className="rounded-xl border border-dashed border-stone-300 py-12 text-center text-sm text-stone-500 dark:border-zinc-700 dark:text-zinc-400">
            No products yet. Add one above.
          </p>
        )}
      </section>
    </div>
  );
}

function AddProductForm({
  categories,
  onDone,
  onError,
}: {
  categories: Category[];
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        onError(data.error ?? "Failed");
        return;
      }
      form.reset();
      onDone();
    } catch {
      onError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100">
        Add product
      </h2>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Name
          </label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Price
          </label>
          <input
            name="price"
            type="number"
            step="0.01"
            min={0}
            required
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Featured
          </label>
          <select
            name="featured"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            defaultValue="false"
          >
            <option value="false">No</option>
            <option value="true">Yes (home)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            New arrivals page
          </label>
          <select
            name="newArrival"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            defaultValue="false"
          >
            <option value="false">No</option>
            <option value="true">Yes (/new-arrivals)</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Category
          </label>
          <select
            name="categoryId"
            required
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            defaultValue={categories[0]?.id ?? ""}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Image
          </label>
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            required
            className="mt-1 block w-full text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white disabled:opacity-50 dark:bg-white dark:text-stone-900"
          >
            {loading ? "Saving…" : "Create product"}
          </button>
        </div>
      </form>
    </section>
  );
}

function AdminProductRow({
  product,
  categories,
  onChanged,
  onError,
  onDeleted,
}: {
  product: Product;
  categories: Category[];
  onChanged: () => void;
  onError: (msg: string) => void;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        body: fd,
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        onError(data.error ?? "Update failed");
        return;
      }
      setEditing(false);
      onChanged();
    } catch {
      onError("Network error");
    }
  }

  async function onDelete() {
    if (!confirm("Delete this product and its image?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        onError(data.error ?? "Delete failed");
        return;
      }
      onDeleted();
    } catch {
      onError("Network error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <li className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={productImageSrc(product.imageFilename)}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-stone-900 dark:text-stone-100">
            {product.name}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {categories.find((c) => c.id === product.categoryId)?.name ??
              product.categoryId}{" "}
            · {product.price} · {product.featured ? "Featured" : "Not featured"} ·{" "}
            {product.newArrival ? "New arrival" : "Not new arrival"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="text-sm font-medium text-indigo-700 dark:text-indigo-400"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
            <button
              type="button"
              onClick={() => void onDelete()}
              disabled={deleting}
              className="text-sm font-medium text-red-700 disabled:opacity-50 dark:text-red-400"
            >
              {deleting ? "…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
      {editing && (
        <form
          onSubmit={onUpdate}
          className="mt-4 grid gap-3 border-t border-stone-100 pt-4 dark:border-zinc-800 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label className="text-xs text-stone-500">Name</label>
            <input
              name="name"
              defaultValue={product.name}
              required
              className="mt-1 w-full rounded border border-stone-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-stone-500">Description</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={product.description}
              className="mt-1 w-full rounded border border-stone-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="text-xs text-stone-500">Price</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min={0}
              defaultValue={product.price}
              required
              className="mt-1 w-full rounded border border-stone-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="text-xs text-stone-500">Featured</label>
            <select
              name="featured"
              defaultValue={product.featured ? "true" : "false"}
              className="mt-1 w-full rounded border border-stone-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-stone-500">New arrivals page</label>
            <select
              name="newArrival"
              defaultValue={product.newArrival ? "true" : "false"}
              className="mt-1 w-full rounded border border-stone-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-stone-500">Category</label>
            <select
              name="categoryId"
              required
              defaultValue={product.categoryId}
              className="mt-1 w-full rounded border border-stone-200 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-stone-500">New image (optional)</label>
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="mt-1 block w-full text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-stone-900"
            >
              Save changes
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
