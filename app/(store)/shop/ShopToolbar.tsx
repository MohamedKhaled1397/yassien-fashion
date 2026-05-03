"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Category } from "@/lib/categories";
import type { ProductSort } from "@/lib/products";
import { STRINGS } from "@/lib/strings";
import { useStore } from "@/components/StoreProviders";

export function ShopToolbar({
  sort,
  total,
  categories,
  activeCategoryId,
}: {
  sort: ProductSort;
  total: number;
  categories: Category[];
  activeCategoryId: string | null;
}) {
  const { lang } = useStore();
  const t = STRINGS[lang];
  const router = useRouter();
  const [localSort, setLocalSort] = useState<ProductSort>(sort);
  const [localCategory, setLocalCategory] = useState<string>(
    activeCategoryId ?? "all",
  );

  useEffect(() => {
    setLocalSort(sort);
  }, [sort]);

  useEffect(() => {
    setLocalCategory(activeCategoryId ?? "all");
  }, [activeCategoryId]);

  const apply = useCallback(() => {
    const qs = new URLSearchParams();
    qs.set("sort", localSort);
    if (localCategory !== "all") qs.set("category", localCategory);
    router.push(`/shop?${qs.toString()}`);
  }, [localSort, localCategory, router]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-50">
          {t.shop}
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {total} {t.productsCount}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-stone-600 dark:text-stone-400">
          <span>{t.shopFilterCategory}</span>
          <select
            value={localCategory}
            onChange={(e) => setLocalCategory(e.target.value)}
            className="max-w-[11rem] rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-800 dark:border-stone-700 dark:bg-zinc-900 dark:text-stone-100"
          >
            <option value="all">{t.shopAllCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-stone-600 dark:text-stone-400">
          <span>{t.sort}</span>
          <select
            value={localSort}
            onChange={(e) => setLocalSort(e.target.value as ProductSort)}
            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-800 dark:border-stone-700 dark:bg-zinc-900 dark:text-stone-100"
          >
            <option value="newest">{t.sortNewest}</option>
            <option value="price-asc">{t.sortPriceLow}</option>
            <option value="price-desc">{t.sortPriceHigh}</option>
            <option value="name">{t.sortName}</option>
          </select>
        </label>
        <button
          type="button"
          onClick={apply}
          className="rounded-full bg-stone-900 px-6 py-2 text-xs font-semibold uppercase tracking-widest text-white dark:bg-white dark:text-stone-900"
        >
          {t.apply}
        </button>
      </div>
    </div>
  );
}
