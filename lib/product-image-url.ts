/**
 * Public URL for a product image stored under `public/uploads/`.
 * Served via GET /api/uploads/[filename] so the file is always read from the app cwd.
 */
export function productImageSrc(imageFilename: string): string {
  const name = imageFilename.trim();
  if (!name) return "";
  return `/api/uploads/${encodeURIComponent(name)}`;
}
