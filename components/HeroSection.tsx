"use client";

import Link from "next/link";
import { STRINGS } from "@/lib/strings";
import { useStore } from "./StoreProviders";

export function HeroSection() {
  const { lang } = useStore();
  const t = STRINGS[lang];

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
      <div className="rounded-[2rem] bg-white/90 p-10 shadow-sm ring-1 ring-stone-200/90 dark:bg-zinc-900/90 dark:ring-stone-800 sm:p-14 md:p-16">
        <h1 className="max-w-3xl font-serif text-4xl font-medium leading-tight tracking-tight text-stone-900 dark:text-stone-50 sm:text-5xl md:text-6xl">
          {t.heroTitle}
        </h1>
        <p className="mt-6 max-w-2xl text-xs font-medium uppercase leading-relaxed tracking-[0.25em] text-stone-600 dark:text-stone-400 sm:text-sm">
          {t.heroSubtitle}
        </p>
        <Link
          href="/shop"
          className="mt-10 inline-flex items-center justify-center bg-stone-900 px-10 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
        >
          {t.shopNow}
        </Link>
      </div>
    </section>
  );
}
