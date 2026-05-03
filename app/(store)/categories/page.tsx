import { readCategories } from "@/lib/categories";
import { readProducts } from "@/lib/products";
import { CategoriesHeader } from "./CategoriesHeader";
import { CategoriesGrid } from "./CategoriesGrid";

export default async function CategoriesPage() {
  const categories = await readCategories();
  const products = await readProducts();
  const counts: Record<string, number> = Object.fromEntries(
    categories.map((c) => [
      c.id,
      products.filter((p) => p.categoryId === c.id).length,
    ]),
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <CategoriesHeader />
      <CategoriesGrid categories={categories} counts={counts} />
    </section>
  );
}
