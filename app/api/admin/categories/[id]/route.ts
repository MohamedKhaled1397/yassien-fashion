import { NextResponse } from "next/server";
import {
  deleteCategory,
  readCategories,
  updateCategory,
} from "@/lib/categories";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session";
import { getCookieValue } from "@/lib/cookies";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const token = getCookieValue(
    request.headers.get("cookie"),
    ADMIN_COOKIE,
  );
  if (!verifySession(token)) return unauthorized();

  const { id } = await ctx.params;
  let body: { name?: string };
  try {
    body = (await request.json()) as { name?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const category = await updateCategory(id, name);
  if (!category) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const items = await readCategories();
  return NextResponse.json({ ok: true, category, items });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const token = getCookieValue(
    _request.headers.get("cookie"),
    ADMIN_COOKIE,
  );
  if (!verifySession(token)) return unauthorized();

  const { id } = await ctx.params;
  const result = await deleteCategory(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const items = await readCategories();
  return NextResponse.json({ ok: true, items });
}
