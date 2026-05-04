import { BlobNotFoundError, del, head, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Private blob pathnames for product photos (see `app/api/admin/product-image/upload`). */
export const PRODUCT_IMAGE_BLOB_PREFIX = "me5a-product-images";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function hasBlobTokenForProductImages(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isBlobStoredProductImage(stored: string): boolean {
  const s = stored.trim();
  return s.startsWith(`blob:${PRODUCT_IMAGE_BLOB_PREFIX}/`);
}

export function blobPathnameFromStoredRef(stored: string): string | null {
  if (!isBlobStoredProductImage(stored)) return null;
  return stored.slice("blob:".length);
}

export function storedRefFromBlobPathname(pathname: string): string {
  return `blob:${pathname}`;
}

export function isSafeProductImageBlobPathname(pathname: string): boolean {
  return new RegExp(
    `^${PRODUCT_IMAGE_BLOB_PREFIX}/[a-f0-9-]+\\.(jpg|png|gif|webp)$`,
    "i",
  ).test(pathname);
}

export async function verifyUploadedProductBlobPathname(
  pathname: string,
): Promise<boolean> {
  if (!isSafeProductImageBlobPathname(pathname)) return false;
  try {
    await head(pathname);
    return true;
  } catch (e) {
    if (e instanceof BlobNotFoundError) return false;
    throw e;
  }
}

/** Declared MIME we accept before sniffing bytes (empty = let sniff decide). */
const ALLOWED_CLAIM = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/octet-stream",
  "",
]);

export type SniffedKind = "jpeg" | "png" | "gif" | "webp";

function sniffImageKind(buf: Buffer): SniffedKind | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "png";
  }
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "gif";
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

function extForKind(kind: SniffedKind): string {
  if (kind === "jpeg") return ".jpg";
  if (kind === "png") return ".png";
  if (kind === "gif") return ".gif";
  return ".webp";
}

function mimeForKind(kind: SniffedKind): string {
  if (kind === "jpeg") return "image/jpeg";
  if (kind === "png") return "image/png";
  if (kind === "gif") return "image/gif";
  return "image/webp";
}

/** First bytes of a stored upload; used when serving files via the API route. */
export function sniffedMimeFromBuffer(buf: Buffer): string | null {
  const kind = sniffImageKind(buf);
  return kind ? mimeForKind(kind) : null;
}

export function extForMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m === "image/jpeg" || m === "image/jpg" || m === "image/pjpeg") return ".jpg";
  if (m === "image/png") return ".png";
  if (m === "image/gif") return ".gif";
  if (m === "image/webp") return ".webp";
  return ".bin";
}

export function validateImage(file: File): { ok: true } | { ok: false; error: string } {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image file." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Image must be 8 MB or smaller." };
  }
  const mime = (file.type || "").toLowerCase();
  if (mime && !ALLOWED_CLAIM.has(mime)) {
    return {
      ok: false,
      error: "Only JPEG, PNG, GIF, or WebP images are allowed.",
    };
  }
  return { ok: true };
}

/** Sniff bytes and cross-check optional declared MIME (e.g. `File.type` or `Content-Type`). */
export function assertProductImageBytes(
  buffer: Buffer,
  claimedMime: string,
): SniffedKind {
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 8 MB or smaller.");
  }
  const sniffed = sniffImageKind(buffer);
  if (!sniffed) {
    throw new Error(
      "Could not read this image. Use JPEG or PNG, or re-save the photo (HEIC is not supported).",
    );
  }
  const claimed = claimedMime.toLowerCase().split(";")[0]?.trim() ?? "";
  if (
    claimed &&
    claimed !== "application/octet-stream" &&
    claimed !== mimeForKind(sniffed) &&
    !ALLOWED_CLAIM.has(claimed)
  ) {
    throw new Error("Only JPEG, PNG, GIF, or WebP images are allowed.");
  }
  return sniffed;
}

/**
 * Stores validated image bytes in Vercel Blob (when configured) or under `public/uploads/`.
 * Call `assertProductImageBytes` first. Returns a basename or `blob:me5a-product-images/…`.
 */
export async function persistProductImageFromBuffer(
  buffer: Buffer,
  sniffed: SniffedKind,
): Promise<string> {
  const ext = extForKind(sniffed);
  const mime = mimeForKind(sniffed);

  if (hasBlobTokenForProductImages()) {
    const pathname = `${PRODUCT_IMAGE_BLOB_PREFIX}/${crypto.randomUUID()}${ext}`;
    await put(pathname, buffer, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: mime,
    });
    return storedRefFromBlobPathname(pathname);
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${crypto.randomUUID()}${ext}`;
  try {
    await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  } catch {
    throw new Error(
      "Cannot save image on this host (filesystem is read-only). Connect Vercel Blob (BLOB_READ_WRITE_TOKEN) or upload from a machine with a writable disk.",
    );
  }
  return filename;
}

export async function saveUploadedImage(file: File): Promise<string> {
  const v = validateImage(file);
  if (!v.ok) throw new Error(v.error);

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = assertProductImageBytes(buffer, file.type || "");
  return persistProductImageFromBuffer(buffer, sniffed);
}

export async function removeImageFile(filename: string): Promise<void> {
  if (!filename) return;
  const pathname = blobPathnameFromStoredRef(filename);
  if (pathname) {
    try {
      await del(pathname);
    } catch {
      /* ignore */
    }
    return;
  }
  if (filename.includes("..") || filename.includes("/") || filename.includes(":")) {
    return;
  }
  const full = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(full);
  } catch {
    /* ignore */
  }
}
