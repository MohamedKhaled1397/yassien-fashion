"use client";

import Link from "next/link";
import type { Category } from "@/lib/categories";
import { STRINGS } from "@/lib/strings";
import { useStore } from "@/components/StoreProviders";

export function CategoriesGrid({
  categories,
  counts,
}: {
  categories: Category[];
  counts: Record<string, number>;
}) {
  const { lang } = useStore();
  const t = STRINGS[lang];

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => (
        <li key={c.id}>
          <Link
            href={`/shop?category=${encodeURIComponent(c.id)}`}
            className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-zinc-900 dark:hover:border-stone-600"
          >
            <span className="font-serif text-xl text-stone-900 dark:text-stone-100">
              {c.name}
            </span>
            <span className="mt-6 text-xs font-medium uppercase tracking-widest text-stone-500 dark:text-stone-400">
              {counts[c.id] ?? 0} {t.productsCount} →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
