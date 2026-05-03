"use client";

import Link from "next/link";
import { STRINGS } from "@/lib/strings";
import { useStore } from "@/components/StoreProviders";

export function NewArrivalsHeader({ count }: { count: number }) {
  const { lang } = useStore();
  const t = STRINGS[lang];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-50">
          {t.newArrivals}
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {count} {t.productsCount}
        </p>
      </div>
      <Link
        href="/shop"
        className="text-xs font-semibold uppercase tracking-widest text-stone-600 underline-offset-4 hover:underline dark:text-stone-300"
      >
        {t.shop} →
      </Link>
    </div>
  );
}
