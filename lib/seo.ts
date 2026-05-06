export const BRAND_NAME = "yassinfashion";

export const SITE_TITLE = "Yassin Fashion | ياسين فاشون";

export const SITE_DESCRIPTION =
  "Shop curated fashion pieces from Yassin Fashion | ياسين فاشون (yassinfashion): new arrivals, featured styles, and everyday essentials. تسوق أحدث الأزياء المختارة: وصل حديثا، قطع مميزة، وإطلالات يومية.";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "https://www.yassinfashion.com";
  return raw.replace(/\/$/, "");
}
