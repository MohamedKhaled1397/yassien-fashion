import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session";
import { getCookieValue } from "@/lib/cookies";
import { parseSiteSocialPatch, readSiteSocial, writeSiteSocial } from "@/lib/site-social";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const token = getCookieValue(request.headers.get("cookie"), ADMIN_COOKIE);
  if (!verifySession(token)) return unauthorized();
  const social = await readSiteSocial();
  return NextResponse.json(social);
}

export async function PATCH(request: Request) {
  const token = getCookieValue(request.headers.get("cookie"), ADMIN_COOKIE);
  if (!verifySession(token)) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseSiteSocialPatch(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    await writeSiteSocial(parsed.value);
    return NextResponse.json({ ok: true, social: parsed.value });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed." },
      { status: 500 },
    );
  }
}
