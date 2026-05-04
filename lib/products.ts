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
  price: number;
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
    price:
      typeof p.price === "number" && Number.isFinite(p.price)
        ? p.price
        : Number.parseFloat(String(p.price)) || 0,
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
