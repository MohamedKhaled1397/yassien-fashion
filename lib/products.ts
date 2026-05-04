import { promises as fs } from "fs";
import path from "path";
import {
  isBlobJsonPersistence,
  readBlobJsonText,
  writeBlobJsonText,
} from "@/lib/vercel-blob-json";

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name";

export type Product = {
  id: string;
  name: string;
  description: string;
  /** `null` = no price shown (e.g. contact for price). */
  price: number | null;
  imageFilename: string;
  featured: boolean;
  /** Shown on /new-arrivals when true (set from admin). */
  newArrival: boolean;
  categoryId: string;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "products.json");
const BLOB_FILE = "products.json";

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function normalizePrice(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const s = value.trim();
    if (s === "") return null;
    const n = Number.parseFloat(s);
    return Number.isFinite(n) ? n : null;
  }
  const n = Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

function normalizeProduct(item: unknown): Product {
  const p = item as Record<string, unknown>;
  const categoryId =
    typeof p.categoryId === "string" && p.categoryId.length > 0
      ? p.categoryId
      : "general";
  return {
    id: String(p.id ?? ""),
    name: String(p.name ?? "Untitled"),
    description: String(p.description ?? ""),
    price: normalizePrice(p.price),
    imageFilename: String(p.imageFilename ?? ""),
    featured: Boolean(p.featured),
    newArrival: Boolean(p.newArrival),
    categoryId,
    createdAt: String(p.createdAt ?? new Date().toISOString()),
  };
}

export async function readProducts(): Promise<Product[]> {
  if (isBlobJsonPersistence()) {
    try {
      const raw = await readBlobJsonText(BLOB_FILE);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.map((row) => normalizeProduct(row));
        }
      }
    } catch {
      /* fall through to FS */
    }
  }
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row) => normalizeProduct(row));
  } catch {
    return [];
  }
}

export async function writeProducts(items: Product[]): Promise<void> {
  const json = JSON.stringify(items, null, 2);
  if (isBlobJsonPersistence()) {
    await writeBlobJsonText(BLOB_FILE, json);
    return;
  }
  try {
    await ensureDataDir();
    await fs.writeFile(DATA_FILE, json, "utf-8");
  } catch {
    throw new Error(
      "Cannot save products on this host (filesystem is read-only). On Vercel: connect Vercel Blob so BLOB_READ_WRITE_TOKEN is set, then redeploy.",
    );
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const items = await readProducts();
  return items.find((p) => p.id === id) ?? null;
}

export async function addProduct(item: Product): Promise<void> {
  const items = await readProducts();
  items.unshift(item);
  await writeProducts(items);
}

export async function updateProduct(
  id: string,
  patch: Partial<Omit<Product, "id" | "createdAt">>,
): Promise<Product | null> {
  const items = await readProducts();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const next = { ...items[idx], ...patch };
  items[idx] = next;
  await writeProducts(items);
  return next;
}

export async function deleteProduct(id: string): Promise<Product | null> {
  const items = await readProducts();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const [removed] = items.splice(idx, 1);
  await writeProducts(items);
  return removed ?? null;
}

/** Sort key so `null` prices sort last in ascending order and last in descending order. */
function priceSortKeyAsc(p: number | null): number {
  return p === null ? Number.POSITIVE_INFINITY : p;
}

function priceSortKeyDesc(p: number | null): number {
  return p === null ? Number.NEGATIVE_INFINITY : p;
}

export function sortProductsList<T extends Product>(items: T[], sort: ProductSort): T[] {
  const copy = [...items];
  if (sort === "price-asc") {
    copy.sort(
      (a, b) => priceSortKeyAsc(a.price) - priceSortKeyAsc(b.price),
    );
  } else if (sort === "price-desc") {
    copy.sort(
      (a, b) => priceSortKeyDesc(b.price) - priceSortKeyDesc(a.price),
    );
  } else if (sort === "name") {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  return copy;
}
