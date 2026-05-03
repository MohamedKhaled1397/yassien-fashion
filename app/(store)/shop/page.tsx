import { categoryLabelMap, readCategories } from "@/lib/categories";
import { ProductGrid } from "@/components/ProductGrid";
import { readProducts } from "@/lib/products";
import type { ProductSort } from "@/lib/products";
import { ShopToolbar } from "./ShopToolbar";

function sortProducts<T extends { price: number; name: string; createdAt: string }>(
  items: T[],
  sort: ProductSort,
): T[] {
  const copy = [...items];
  if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
  else if (sort === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
  else copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return copy;
}

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
  const products = sortProducts(filtered, sort);
  const categoryLabels = categoryLabelMap(categories);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <ShopToolbar
        sort={sort}
        total={filtered.length}
        categories={categories}
        activeCategoryId={activeCategoryId}
      />
      <div className="mt-10">
        <ProductGrid products={products} categoryLabels={categoryLabels} />
      </div>
    </section>
  );
}
