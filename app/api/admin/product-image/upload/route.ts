import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session";
import { getCookieValue } from "@/lib/cookies";
import {
  assertProductImageBytes,
  blobPathnameFromStoredRef,
  persistProductImageFromBuffer,
} from "@/lib/image-upload";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Client-side upload of raw image bytes to Vercel Blob (same pattern as Vercel’s avatar example).
 * When Blob is not configured, returns 501 so the client falls back to multipart `image` on
 * `/api/admin/products`.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const token = getCookieValue(
    request.headers.get("cookie"),
    ADMIN_COOKIE,
  );
  if (!verifySession(token)) return unauthorized();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ useFileField: true }, { status: 501 });
  }

  const claimed =
    request.headers.get("content-type")?.split(";")[0]?.trim() ?? "";

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await request.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Empty body" }, { status: 400 });
  }

  let sniffed;
  try {
    sniffed = assertProductImageBytes(buffer, claimed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid image";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    const stored = await persistProductImageFromBuffer(buffer, sniffed);
    const pathname = blobPathnameFromStoredRef(stored);
    if (!pathname) {
      return NextResponse.json(
        { error: "Blob upload did not return a pathname." },
        { status: 500 },
      );
    }
    return NextResponse.json({ pathname });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
