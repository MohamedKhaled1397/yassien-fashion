"use client";

import Link from "next/link";
import { productImageSrc } from "@/lib/product-image-url";
import type { Product } from "@/lib/products";
import type { Lang } from "@/lib/strings";
import { STRINGS } from "@/lib/strings";
import type { WhatsAppProductPayload } from "@/lib/whatsapp-product-link";
import { buildProductWhatsAppUrl } from "@/lib/whatsapp-product-link";
import { useStore } from "./StoreProviders";

function formatProductPrice(
  price: number | null,
  lang: Lang,
  currencyLabel: string,
  priceOnRequest: string,
) {
  if (price === null) return priceOnRequest;
  if (lang === "ar") {
    return `${price.toLocaleString("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currencyLabel}`;
  }
  return `${currencyLabel} ${price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function productToPayload(p: Product): WhatsAppProductPayload {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    imageFilename: p.imageFilename,
  };
}

export function ProductGrid({
  products,
  categoryLabels,
  waDigits,
  siteOrigin,
}: {
  products: Product[];
  categoryLabels?: Record<string, string>;
  waDigits?: string | null;
  siteOrigin?: string;
}) {
  const { lang } = useStore();
  const t = STRINGS[lang];

  const origin =
    (siteOrigin?.trim() ||
      (typeof window !== "undefined" ? window.location.origin : "")) ??
    "";

  const waEnabled = Boolean(waDigits && origin);

  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-200 bg-white/60 py-16 text-center text-sm text-stone-500 dark:border-stone-800 dark:bg-zinc-900/40 dark:text-stone-400">
        {t.noProducts}
      </p>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => {
        const whatsappHref =
          waEnabled && waDigits
            ? buildProductWhatsAppUrl(waDigits, origin, productToPayload(p), lang)
            : null;

        return (
          <li key={p.id}>
            <div className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/80 transition hover:shadow-md dark:bg-zinc-900 dark:ring-stone-800">
              <Link href={`/product/${p.id}`} className="block">
                <div className="aspect-[4/5] w-full bg-stone-100 dark:bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={productImageSrc(p.imageFilename)}
                    alt={p.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </Link>
              <div className="space-y-1 p-4">
                <Link
                  href={`/product/${p.id}`}
                  className="block font-serif text-lg text-stone-900 transition hover:text-stone-700 dark:text-stone-100 dark:hover:text-stone-200"
                >
                  {p.name}
                </Link>
                {categoryLabels?.[p.categoryId] ? (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500">
                    {categoryLabels[p.categoryId]}
                  </p>
                ) : null}
                <p className="text-sm text-stone-500 line-clamp-2 dark:text-stone-400">
                  {p.description}
                </p>
                <p className="pt-2 font-medium text-stone-800 dark:text-stone-200">
                  {formatProductPrice(p.price, lang, t.currency, t.priceOnRequest)}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <Link
                    href={`/product/${p.id}`}
                    className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 transition group-hover:text-stone-700 dark:group-hover:text-stone-300"
                  >
                    {t.view} →
                  </Link>
                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t.whatsAppCta}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
