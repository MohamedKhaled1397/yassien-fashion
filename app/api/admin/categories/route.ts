import { NextResponse } from "next/server";
import { addCategory, readCategories } from "@/lib/categories";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session";
import { getCookieValue } from "@/lib/cookies";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
  const token = getCookieValue(
    request.headers.get("cookie"),
    ADMIN_COOKIE,
  );
  if (!verifySession(token)) return unauthorized();

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

  const category = await addCategory(name);
  const items = await readCategories();
  return NextResponse.json({ ok: true, category, items });
}
