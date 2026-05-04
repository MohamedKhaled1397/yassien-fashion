import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkAdminPassword,
  isAdminPasswordConfigured,
  signSession,
} from "@/lib/admin-session";

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const password =
    typeof body.password === "string"
      ? body.password
      : body.password != null
        ? String(body.password)
        : "";
  if (!isAdminPasswordConfigured()) {
    return NextResponse.json(
      {
        error:
          "Admin password is not set on the server. Add ADMIN_PASSWORD to .env.local (local) or project environment variables (Vercel/hosting).",
      },
      { status: 503 },
    );
  }
  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const exp = Date.now() + SESSION_MS;
  const token = signSession(exp);
  const res = NextResponse.json({ ok: true });
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "";
  /** Only mark Secure when the request is HTTPS (avoids dropping cookie on http://localhost with NODE_ENV=production). */
  const secureCookie = proto === "https";
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: secureCookie,
    maxAge: Math.floor(SESSION_MS / 1000),
  });
  return res;
}
