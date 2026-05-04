import { NextResponse } from "next/server";
import { readProducts, sortProductsList, type ProductSort } from "@/lib/products";

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
  items = sortProductsList(items, validSort);

  return NextResponse.json({ items });
}
