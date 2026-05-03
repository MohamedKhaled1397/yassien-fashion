import { NextResponse } from "next/server";
import type { ProductSort } from "@/lib/products";
import { readProducts } from "@/lib/products";

function sortItems<T extends { price: number; name: string; createdAt: string }>(
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featuredOnly = searchParams.get("featured") === "1";
  const sort = (searchParams.get("sort") as ProductSort) || "newest";
  const validSort: ProductSort = ["newest", "price-asc", "price-desc", "name"].includes(
    sort,
  )
    ? sort
    : "newest";

  let items = await readProducts();
  if (featuredOnly) items = items.filter((p) => p.featured);
  items = sortItems(items, validSort);

  return NextResponse.json({ items });
}
