"use client";

import Link from "next/link";
import { productImageSrc } from "@/lib/product-image-url";
import type { Product } from "@/lib/products";
import type { Lang } from "@/lib/strings";
import { STRINGS } from "@/lib/strings";
import { useStore } from "./StoreProviders";

function formatMoney(price: number, lang: Lang, currencyLabel: string) {
  if (lang === "ar") {
    return `${price.toLocaleString("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currencyLabel}`;
  }
  return `${currencyLabel} ${price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function ProductGrid({
  products,
  categoryLabels,
}: {
  products: Product[];
  categoryLabels?: Record<string, string>;
}) {
  const { lang } = useStore();
  const t = STRINGS[lang];

  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-200 bg-white/60 py-16 text-center text-sm text-stone-500 dark:border-stone-800 dark:bg-zinc-900/40 dark:text-stone-400">
        {t.noProducts}
      </p>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <li key={p.id}>
          <Link
            href={`/product/${p.id}`}
            className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/80 transition hover:shadow-md dark:bg-zinc-900 dark:ring-stone-800"
          >
            <div className="aspect-[4/5] w-full bg-stone-100 dark:bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={productImageSrc(p.imageFilename)}
                alt={p.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div className="space-y-1 p-4">
              <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100">
                {p.name}
              </h3>
              {categoryLabels?.[p.categoryId] ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500">
                  {categoryLabels[p.categoryId]}
                </p>
              ) : null}
              <p className="text-sm text-stone-500 line-clamp-2 dark:text-stone-400">
                {p.description}
              </p>
              <p className="pt-2 font-medium text-stone-800 dark:text-stone-200">
                {formatMoney(p.price, lang, t.currency)}
              </p>
              <span className="inline-block pt-1 text-[10px] font-semibold uppercase tracking-widest text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-300">
                {t.view} →
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
