import type { Metadata } from "next";
import { categoryLabelMap, readCategories } from "@/lib/categories";
import { ProductGrid } from "@/components/ProductGrid";
import { HeroSection } from "@/components/HeroSection";
import { readProducts } from "@/lib/products";
import { getWhatsAppStoreContext } from "@/lib/store-whatsapp-context";
import { FeaturedHeading } from "./FeaturedHeading";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Discover featured picks and signature looks from yassinfashion.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const categories = await readCategories();
  const all = await readProducts();
  const featured = all.filter((p) => p.featured);
  const categoryLabels = categoryLabelMap(categories);
  const waCtx = await getWhatsAppStoreContext();
  const leadProduct = featured[0] ?? all[0] ?? null;
  const leadPayload = leadProduct
    ? {
        id: leadProduct.id,
        name: leadProduct.name,
        price: leadProduct.price,
        imageFilename: leadProduct.imageFilename,
      }
    : null;

  return (
    <>
      <HeroSection
        waDigits={waCtx.waDigits}
        siteOrigin={waCtx.siteOrigin}
        leadProduct={leadPayload}
      />
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <FeaturedHeading count={featured.length} />
        <div className="mt-8">
          <ProductGrid
            products={featured}
            categoryLabels={categoryLabels}
            waDigits={waCtx.waDigits}
            siteOrigin={waCtx.siteOrigin}
          />
        </div>
      </section>
    </>
  );
}