import { promises as fs } from "fs";
import path from "path";
import { readProducts, writeProducts } from "@/lib/products";

export type Category = {
  id: string;
  name: string;
};

export function categoryLabelMap(
  categories: Category[],
): Record<string, string> {
  return Object.fromEntries(categories.map((c) => [c.id, c.name]));
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "categories.json");

const SEED: Category[] = [{ id: "general", name: "General" }];

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readCategories(): Promise<Category[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      await fs.writeFile(DATA_FILE, JSON.stringify(SEED, null, 2), "utf-8");
      return [...SEED];
    }
    return parsed as Category[];
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(SEED, null, 2), "utf-8");
    return [...SEED];
  }
}

export async function writeCategories(items: Category[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const items = await readCategories();
  return items.find((c) => c.id === id) ?? null;
}

export async function addCategory(name: string): Promise<Category> {
  const items = await readCategories();
  const cat: Category = {
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 120),
  };
  items.push(cat);
  await writeCategories(items);
  return cat;
}

export async function updateCategory(
  id: string,
  name: string,
): Promise<Category | null> {
  const items = await readCategories();
  const idx = items.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], name: name.trim().slice(0, 120) };
  await writeCategories(items);
  return items[idx];
}

export async function deleteCategory(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const items = await readCategories();
  if (items.length <= 1) {
    return { ok: false, error: "Cannot delete the last category." };
  }
  const idx = items.findIndex((c) => c.id === id);
  if (idx === -1) return { ok: false, error: "Category not found." };
  const replacement = items.find((c) => c.id !== id);
  if (!replacement) {
    return { ok: false, error: "Cannot delete category." };
  }
  const products = await readProducts();
  const next = products.map((p) =>
    p.categoryId === id ? { ...p, categoryId: replacement.id } : p,
  );
  await writeProducts(next);
  items.splice(idx, 1);
  await writeCategories(items);
  return { ok: true };
}
