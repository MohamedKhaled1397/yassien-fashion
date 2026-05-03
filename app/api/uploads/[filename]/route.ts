import { promises as fs } from "fs";
import path from "path";
import { MAX_IMAGE_BYTES, sniffedMimeFromBuffer } from "@/lib/image-upload";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Basenames only; matches files written by `saveUploadedImage`. */
const SAFE_UPLOAD_NAME = /^[a-zA-Z0-9._-]{1,240}$/;

export async function GET(
  _req: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename: raw } = await context.params;
  const name = decodeURIComponent(raw);
  if (!SAFE_UPLOAD_NAME.test(name) || name.includes("..")) {
    return new Response("Bad request", { status: 400 });
  }

  const resolvedDir = path.resolve(UPLOAD_DIR);
  const full = path.resolve(resolvedDir, name);
  if (!full.startsWith(resolvedDir + path.sep) && full !== resolvedDir) {
    return new Response("Forbidden", { status: 403 });
  }

  let stat;
  try {
    stat = await fs.stat(full);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (!stat.isFile() || stat.size > MAX_IMAGE_BYTES) {
    return new Response("Not found", { status: 404 });
  }

  const buf = await fs.readFile(full);
  const mime =
    sniffedMimeFromBuffer(buf.subarray(0, Math.min(buf.length, 64))) ??
    "application/octet-stream";

  return new Response(buf, {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
