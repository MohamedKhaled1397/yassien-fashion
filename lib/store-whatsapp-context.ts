import { headers } from "next/headers";
import { readSiteSocial } from "@/lib/site-social";
import { siteOriginFromHeaders } from "@/lib/site-origin";
import { digitsFromSocialWhatsApp } from "@/lib/whatsapp-product-link";

/** Server-only: WhatsApp number + public site URL for product inquiry links. */
export async function getWhatsAppStoreContext(): Promise<{
  waDigits: string | null;
  siteOrigin: string;
}> {
  const h = await headers();
  const social = await readSiteSocial();
  return {
    waDigits: digitsFromSocialWhatsApp(social.whatsapp),
    siteOrigin: siteOriginFromHeaders(h),
  };
}
