import { categoryLabelMap, readCategories } from "@/lib/categories";
import { ProductGrid } from "@/components/ProductGrid";
import { readProducts } from "@/lib/products";
import { getWhatsAppStoreContext } from "@/lib/store-whatsapp-context";
import { NewArrivalsHeader } from "./NewArrivalsHeader";

export default async function NewArrivalsPage() {
  const categories = await readCategories();
  const all = await readProducts();
  const products = all
    .filter((p) => p.newArrival)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const categoryLabels = categoryLabelMap(categories);
  const waCtx = await getWhatsAppStoreContext();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <NewArrivalsHeader count={products.length} />
      <div className="mt-10">
        <ProductGrid
          products={products}
          categoryLabels={categoryLabels}
          waDigits={waCtx.waDigits}
          siteOrigin={waCtx.siteOrigin}
        />
      </div>
    </section>
  );
}
