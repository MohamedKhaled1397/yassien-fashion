import { NextResponse } from "next/server";
import { readCategories } from "@/lib/categories";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session";
import { getCookieValue } from "@/lib/cookies";
import {
  saveUploadedImage,
  storedRefFromBlobPathname,
  verifyUploadedProductBlobPathname,
} from "@/lib/image-upload";
import { addProduct } from "@/lib/products";

async function categoryExists(id: string): Promise<boolean> {
  const cats = await readCategories();
  return cats.some((c) => c.id === id);
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
  const token = getCookieValue(
    request.headers.get("cookie"),
    ADMIN_COOKIE,
  );
  if (!verifySession(token)) return unauthorized();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const imagePathnameRaw = formData.get("imagePathname");
  const file = formData.get("image");
  const nameRaw = formData.get("name");
  const descriptionRaw = formData.get("description");
  const priceRaw = formData.get("price");
  const featuredRaw = formData.get("featured");
  const newArrivalRaw = formData.get("newArrival");
  const categoryRaw = formData.get("categoryId");

  const categoryId =
    typeof categoryRaw === "string" ? categoryRaw.trim() : "";
  if (!categoryId || !(await categoryExists(categoryId))) {
    return NextResponse.json(
      { error: "Choose a valid category." },
      { status: 400 },
    );
  }

  const name =
    typeof nameRaw === "string" ? nameRaw.trim().slice(0, 200) : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const description =
    typeof descriptionRaw === "string"
      ? descriptionRaw.trim().slice(0, 4000)
      : "";

  const priceNum =
    typeof priceRaw === "string" ? Number.parseFloat(priceRaw) : Number.NaN;
  if (!Number.isFinite(priceNum) || priceNum < 0) {
    return NextResponse.json({ error: "Valid price is required." }, { status: 400 });
  }

  const featured =
    featuredRaw === "true" ||
    featuredRaw === "on" ||
    featuredRaw === "1";

  const newArrival =
    newArrivalRaw === "true" ||
    newArrivalRaw === "on" ||
    newArrivalRaw === "1";

  let imageFilename: string;
  if (typeof imagePathnameRaw === "string" && imagePathnameRaw.trim()) {
    const pathname = imagePathnameRaw.trim();
    if (!(await verifyUploadedProductBlobPathname(pathname))) {
      return NextResponse.json(
        { error: "Invalid or missing uploaded image." },
        { status: 400 },
      );
    }
    imageFilename = storedRefFromBlobPathname(pathname);
  } else if (file instanceof File && file.size > 0) {
    try {
      imageFilename = await saveUploadedImage(file);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Image is required." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const product = {
    id,
    name,
    description,
    price: Math.round(priceNum * 100) / 100,
    imageFilename,
    featured,
    newArrival,
    categoryId,
    createdAt: new Date().toISOString(),
  };

  try {
    await addProduct(product);
    return NextResponse.json({ ok: true, product });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed." },
      { status: 500 },
    );
  }
}
