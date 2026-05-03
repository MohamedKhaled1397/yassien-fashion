import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session";
import { getCookieValue } from "@/lib/cookies";

export async function GET(request: Request) {
  const token = getCookieValue(
    request.headers.get("cookie"),
    ADMIN_COOKIE,
  );
  const ok = verifySession(token);
  return NextResponse.json({ ok });
}
