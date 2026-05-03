"use client";

import { STRINGS } from "@/lib/strings";
import { useStore } from "@/components/StoreProviders";

export function CategoriesHeader() {
  const { lang } = useStore();
  const t = STRINGS[lang];

  return (
    <div className="mb-10">
      <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-50">
        {t.categories}
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        {t.categoriesIntro}
      </p>
    </div>
  );
}
