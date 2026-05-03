import { categoryLabelMap, readCategories } from "@/lib/categories";
import { ProductGrid } from "@/components/ProductGrid";
import { HeroSection } from "@/components/HeroSection";
import { readProducts } from "@/lib/products";
import { FeaturedHeading } from "./FeaturedHeading";

export default async function HomePage() {
  const categories = await readCategories();
  const all = await readProducts();
  const featured = all.filter((p) => p.featured);
  const categoryLabels = categoryLabelMap(categories);

  return (
    <>
      <HeroSection />
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <FeaturedHeading count={featured.length} />
        <div className="mt-8">
          <ProductGrid
            products={featured}
            categoryLabels={categoryLabels}
          />
        </div>
      </section>
    </>
  );
}