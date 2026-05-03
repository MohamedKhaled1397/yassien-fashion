"use client";

import type { SiteSocial } from "@/lib/site-social";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminSiteSocialPanel({ initial }: { initial: SiteSocial }) {
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);
  const [instagram, setInstagram] = useState(initial.instagram);
  const [facebook, setFacebook] = useState(initial.facebook);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setWhatsapp(initial.whatsapp);
    setInstagram(initial.instagram);
    setFacebook(initial.facebook);
  }, [initial.whatsapp, initial.instagram, initial.facebook]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/site-social", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp, instagram, facebook }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      setMessage("Social links saved. Storefront updated.");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100">
        Social links (storefront)
      </h2>
      <p className="mt-1 text-sm text-stone-500 dark:text-zinc-400">
        Icons appear in the site header and footer. Use full URLs (WhatsApp also accepts a phone
        number with country code, e.g.{" "}
        <span className="font-mono text-xs">201234567890</span>).
      </p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-zinc-400">
            WhatsApp
          </span>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="https://wa.me/201234567890 or phone digits"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-zinc-400">
            Instagram
          </span>
          <input
            type="url"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://www.instagram.com/yourname"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-zinc-400">
            Facebook
          </span>
          <input
            type="url"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://www.facebook.com/yourpage"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900"
          >
            {loading ? "Saving…" : "Save social links"}
          </button>
          {message ? (
            <span className="text-sm text-emerald-700 dark:text-emerald-400">{message}</span>
          ) : null}
          {error ? <span className="text-sm text-red-600 dark:text-red-400">{error}</span> : null}
        </div>
      </form>
    </section>
  );
}
