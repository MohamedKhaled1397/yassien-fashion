import { NextResponse } from "next/server";
import { readCategories } from "@/lib/categories";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session";
import { getCookieValue } from "@/lib/cookies";
import { removeImageFile, saveUploadedImage } from "@/lib/image-upload";
import {
  deleteProduct,
  getProductById,
  updateProduct,
} from "@/lib/products";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

type Ctx = { params: Promise<{ id: string }> };

async function categoryExists(id: string): Promise<boolean> {
  const cats = await readCategories();
  return cats.some((c) => c.id === id);
}

export async function PATCH(request: Request, ctx: Ctx) {
  const token = getCookieValue(
    request.headers.get("cookie"),
    ADMIN_COOKIE,
  );
  if (!verifySession(token)) return unauthorized();

  const { id } = await ctx.params;
  const existing = await getProductById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const nameRaw = formData.get("name");
  const descriptionRaw = formData.get("description");
  const priceRaw = formData.get("price");
  const featuredRaw = formData.get("featured");
  const newArrivalRaw = formData.get("newArrival");
  const categoryRaw = formData.get("categoryId");
  const file = formData.get("image");

  const patch: Partial<{
    name: string;
    description: string;
    price: number;
    featured: boolean;
    newArrival: boolean;
    imageFilename: string;
    categoryId: string;
  }> = {};

  if (typeof nameRaw === "string") {
    const name = nameRaw.trim().slice(0, 200);
    if (!name) {
      return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    }
    patch.name = name;
  }

  if (typeof descriptionRaw === "string") {
    patch.description = descriptionRaw.trim().slice(0, 4000);
  }

  if (typeof priceRaw === "string") {
    const priceNum = Number.parseFloat(priceRaw);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: "Valid price is required." }, { status: 400 });
    }
    patch.price = Math.round(priceNum * 100) / 100;
  }

  if (featuredRaw !== null && featuredRaw !== undefined) {
    patch.featured =
      featuredRaw === "true" ||
      featuredRaw === "on" ||
      featuredRaw === "1";
  }

  if (newArrivalRaw !== null && newArrivalRaw !== undefined) {
    patch.newArrival =
      newArrivalRaw === "true" ||
      newArrivalRaw === "on" ||
      newArrivalRaw === "1";
  }

  if (typeof categoryRaw === "string") {
    const cid = categoryRaw.trim();
    if (!cid || !(await categoryExists(cid))) {
      return NextResponse.json(
        { error: "Choose a valid category." },
        { status: 400 },
      );
    }
    patch.categoryId = cid;
  }

  if (file instanceof File && file.size > 0) {
    let newName: string;
    try {
      newName = await saveUploadedImage(file);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const old = existing.imageFilename;
    patch.imageFilename = newName;
    await removeImageFile(old);
  }

  const product = await updateProduct(id, patch);
  return NextResponse.json({ ok: true, product });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const token = getCookieValue(
    _request.headers.get("cookie"),
    ADMIN_COOKIE,
  );
  if (!verifySession(token)) return unauthorized();

  const { id } = await ctx.params;
  const removed = await deleteProduct(id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await removeImageFile(removed.imageFilename);
  return NextResponse.json({ ok: true });
}
