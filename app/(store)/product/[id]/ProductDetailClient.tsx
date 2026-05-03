"use client";

import Link from "next/link";
import type { Product } from "@/lib/products";
import { STRINGS } from "@/lib/strings";
import { useStore } from "@/components/StoreProviders";

export function ProductDetailClient({
  product,
  categoryName,
}: {
  product: Product;
  categoryName?: string;
}) {
  const { lang } = useStore();
  const t = STRINGS[lang];
  const price =
    lang === "ar"
      ? `${product.price.toLocaleString("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${t.currency}`
      : `${t.currency} ${product.price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  return (
    <div>
      <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-50 sm:text-4xl">
        {product.name}
      </h1>
      <p className="mt-4 text-lg font-medium text-stone-800 dark:text-stone-200">
        {price}
      </p>
      {categoryName ? (
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400 dark:text-stone-500">
          {categoryName}
        </p>
      ) : null}
      <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        {product.description || "—"}
      </p>
      <Link
        href="/shop"
        className="mt-10 inline-flex w-full items-center justify-center bg-stone-900 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 md:w-auto md:px-12"
      >
        {t.shopNow}
      </Link>
    </div>
  );
}
