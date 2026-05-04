"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/admin/session");
      const data = (await res.json()) as { ok?: boolean };
      if (!cancelled && data.ok) router.replace("/admin");
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        const base = data.error ?? "Login failed";
        setError(
          res.status === 401
            ? `${base} Use the exact value of ADMIN_PASSWORD for this environment (e.g. .env.local locally, or Vercel env vars in production).`
            : base,
        );
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-100 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-center font-serif text-xl tracking-wide text-stone-900 dark:text-stone-100 sm:text-2xl">
          Yassin Fashion
        </h1>
        <p className="mt-2 text-center text-sm text-stone-500 dark:text-stone-400">
          Admin sign in
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-400"
            >
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none ring-stone-900 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100 dark:ring-white"
              required
            />
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded border-stone-300"
              />
              Show password
            </label>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold uppercase tracking-widest text-white disabled:opacity-50 dark:bg-white dark:text-stone-900"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-stone-500">
          Set <code className="rounded bg-stone-100 px-1 dark:bg-zinc-800">ADMIN_PASSWORD</code> and{" "}
          <code className="rounded bg-stone-100 px-1 dark:bg-zinc-800">ADMIN_SECRET</code> in{" "}
          <code className="rounded bg-stone-100 px-1 dark:bg-zinc-800">.env.local</code>
        </p>
        <p className="mt-4 text-center">
          <Link href="/" className="text-sm text-stone-600 underline dark:text-stone-400">
            ← Back to site
          </Link>
        </p>
      </div>
    </main>
  );
}
