import { NextResponse } from "next/server";
import { readCategories } from "@/lib/categories";

export async function GET() {
  const items = await readCategories();
  return NextResponse.json({ items });
}
