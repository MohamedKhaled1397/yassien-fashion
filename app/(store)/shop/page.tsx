import { categoryLabelMap, readCategories } from "@/lib/categories";
import { ProductGrid } from "@/components/ProductGrid";
import { readProducts, sortProductsList, type ProductSort } from "@/lib/products";
import { getWhatsAppStoreContext } from "@/lib/store-whatsapp-context";
import { ShopToolbar } from "./ShopToolbar";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const raw = sp.sort ?? "newest";
  const sort: ProductSort = [
    "newest",
    "price-asc",
    "price-desc",
    "name",
  ].includes(raw)
    ? (raw as ProductSort)
    : "newest";

  const categories = await readCategories();
  const all = await readProducts();
  const catParam = typeof sp.category === "string" ? sp.category.trim() : "";
  const activeCategoryId =
    catParam && categories.some((c) => c.id === catParam) ? catParam : null;
  const filtered = activeCategoryId
    ? all.filter((p) => p.categoryId === activeCategoryId)
    : all;
  const products = sortProductsList(filtered, sort);
  const categoryLabels = categoryLabelMap(categories);
  const waCtx = await getWhatsAppStoreContext();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <ShopToolbar
        sort={sort}
        total={filtered.length}
        categories={categories}
        activeCategoryId={activeCategoryId}
      />
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
