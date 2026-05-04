/**
 * URL for a product image: local basenames under `public/uploads/`, or `blob:me5a-product-images/…`
 * when stored in Vercel Blob. Both are served via GET `/api/uploads/[filename]`.
 */
export function productImageSrc(imageFilename: string): string {
  const name = imageFilename.trim();
  if (!name) return "";
  return `/api/uploads/${encodeURIComponent(name)}`;
}
