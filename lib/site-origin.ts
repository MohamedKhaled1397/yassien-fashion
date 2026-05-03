type HeaderBag = { get(name: string): string | null };

/** Build absolute site origin for WhatsApp / share links (no trailing slash). */
export function siteOriginFromHeaders(h: HeaderBag): string {
  const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const host =
    h.get("x-forwarded-host")?.split(",")[0]?.trim() || h.get("host")?.trim();
  if (host) {
    return `${proto}://${host}`.replace(/\/$/, "");
  }
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return env ?? "";
}
