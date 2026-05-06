"use client";

import Link from "next/link";
import type { SiteSocial } from "@/lib/site-social";
import { STRINGS } from "@/lib/strings";
import { SocialLinks } from "./SocialLinks";
import { useStore } from "./StoreProviders";

export function SiteHeader({ social }: { social: SiteSocial }) {
  const { lang, setLang, toggleTheme, theme } = useStore();
  const t = STRINGS[lang];

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/80 backdrop-blur-md dark:border-stone-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
        <nav className="hidden flex-1 flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium uppercase tracking-[0.2em] text-stone-600 dark:text-stone-400 md:flex">
          <Link
            href="/"
            className="transition hover:text-stone-900 dark:hover:text-stone-100"
          >
            {t.home}
          </Link>
          <Link
            href="/shop"
            className="transition hover:text-stone-900 dark:hover:text-stone-100"
          >
            {t.shop}
          </Link>
          <Link
            href="/categories"
            className="transition hover:text-stone-900 dark:hover:text-stone-100"
          >
            {t.categories}
          </Link>
          <Link
            href="/new-arrivals"
            className="transition hover:text-stone-900 dark:hover:text-stone-100"
          >
            {t.newArrivals}
          </Link>
        </nav>

        <Link
          href="/"
          className="text-center font-serif text-base font-medium tracking-[0.12em] text-stone-900 dark:text-stone-50 sm:text-lg md:absolute md:left-1/2 md:-translate-x-1/2 md:text-xl"
        >
          Yassin Fashion
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <SocialLinks social={social} className="hidden sm:flex" />
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-700 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-900"
            aria-label={theme === "light" ? "Dark mode" : "Light mode"}
          >
            {theme === "light" ? (
              <MoonIcon className="h-4 w-4" />
            ) : (
              <SunIcon className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="rounded-full border border-stone-200 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-stone-800 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-900"
          >
            {lang === "en" ? "AR" : "EN"}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 px-4 py-2 md:hidden dark:border-stone-900">
        <nav className="flex flex-wrap gap-4 text-[10px] font-medium uppercase tracking-widest text-stone-600 dark:text-stone-400">
          <Link href="/">{t.home}</Link>
          <Link href="/shop">{t.shop}</Link>
          <Link href="/categories">{t.categories}</Link>
          <Link href="/new-arrivals">{t.newArrivals}</Link>
        </nav>
        <SocialLinks social={social} iconClassName="h-4 w-4" />
      </div>
    </header>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  );
}
