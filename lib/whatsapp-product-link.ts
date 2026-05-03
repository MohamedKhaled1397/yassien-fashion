import type { Lang } from "@/lib/strings";
import { productImageSrc } from "@/lib/product-image-url";

/** Extract digits for wa.me from admin “WhatsApp” field (URL, tel:, or digits). */
export function digitsFromSocialWhatsApp(whatsapp: string): string | null {
  const s = whatsapp.trim();
  if (!s) return null;
  const waMe = s.match(/wa\.me\/+(\d+)/i);
  if (waMe?.[1]) return waMe[1];
  try {
    const u = new URL(s.includes("://") ? s : `https://${s}`);
    const host = u.hostname.replace(/^www\./i, "");
    if (host === "wa.me") {
      const m = u.pathname.match(/\/+(\d+)/);
      if (m?.[1]) return m[1];
    }
    if (host === "api.whatsapp.com" || host.includes("whatsapp.com")) {
      const p = u.searchParams.get("phone");
      if (p) {
        const d = p.replace(/\D/g, "");
        if (d.length >= 10) return d;
      }
    }
  } catch {
    /* ignore */
  }
  if (s.startsWith("tel:")) {
    const d = s.slice(4).replace(/\D/g, "");
    return d.length >= 10 ? d : null;
  }
  const digits = s.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

export type WhatsAppProductPayload = {
  id: string;
  name: string;
  price: number;
  imageFilename: string;
};

export function buildProductWhatsAppUrl(
  waDigits: string,
  siteOrigin: string,
  product: WhatsAppProductPayload,
  lang: Lang,
): string {
  const origin = siteOrigin.replace(/\/$/, "");
  const productUrl = `${origin}/product/${encodeURIComponent(product.id)}`;
  const imagePath = product.imageFilename.trim()
    ? `${origin}${productImageSrc(product.imageFilename)}`
    : "";

  let msg: string;
  if (lang === "ar") {
    msg = `مرحباً، أود الاستفسار عن هذا المنتج:\n${product.name}\nالسعر: ${product.price}`;
    if (imagePath) msg += `\nصورة المنتج: ${imagePath}`;
    msg += `\nرابط الصفحة: ${productUrl}`;
  } else {
    msg = `Hi, I'm interested in this product:\n${product.name}\nPrice: ${product.price}`;
    if (imagePath) msg += `\nProduct photo: ${imagePath}`;
    msg += `\nPage: ${productUrl}`;
  }

  return `https://wa.me/${waDigits}?text=${encodeURIComponent(msg)}`;
}
