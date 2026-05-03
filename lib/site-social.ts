import { promises as fs } from "fs";
import path from "path";

export type SiteSocial = {
  whatsapp: string;
  instagram: string;
  facebook: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "site-social.json");

const DEFAULT: SiteSocial = {
  whatsapp: "",
  instagram: "",
  facebook: "",
};

const MAX_LEN = 2000;

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function normalizeSocial(
  raw: string,
  options: { allowWaPhone?: boolean },
): { ok: true; value: string } | { ok: false; error: string } {
  const s = raw.trim();
  if (!s) return { ok: true, value: "" };
  if (s.length > MAX_LEN) return { ok: false, error: "Link is too long." };
  const lower = s.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return { ok: false, error: "Invalid link." };
  }
  if (s.startsWith("tel:")) {
    try {
      new URL(s);
      return { ok: true, value: s };
    } catch {
      return { ok: false, error: "Invalid phone link." };
    }
  }
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return { ok: false, error: "Use an https (or http) link." };
    }
    return { ok: true, value: u.toString() };
  } catch {
    if (options.allowWaPhone) {
      const digits = s.replace(/\D/g, "");
      if (digits.length >= 10) {
        return { ok: true, value: `https://wa.me/${digits}` };
      }
    }
    return {
      ok: false,
      error: "Enter a full URL (e.g. https://instagram.com/yourname).",
    };
  }
}

export function parseSiteSocialPatch(body: unknown):
  | { ok: true; value: SiteSocial }
  | { ok: false; error: string } {
  const o = body as Record<string, unknown>;
  const wa = normalizeSocial(String(o.whatsapp ?? ""), { allowWaPhone: true });
  if (!wa.ok) return { ok: false, error: `WhatsApp: ${wa.error}` };
  const ig = normalizeSocial(String(o.instagram ?? ""), {});
  if (!ig.ok) return { ok: false, error: `Instagram: ${ig.error}` };
  const fb = normalizeSocial(String(o.facebook ?? ""), {});
  if (!fb.ok) return { ok: false, error: `Facebook: ${fb.error}` };
  return { ok: true, value: { whatsapp: wa.value, instagram: ig.value, facebook: fb.value } };
}

function normalizeStored(item: unknown): SiteSocial {
  const o = item as Record<string, unknown>;
  return {
    whatsapp: typeof o.whatsapp === "string" ? o.whatsapp : "",
    instagram: typeof o.instagram === "string" ? o.instagram : "",
    facebook: typeof o.facebook === "string" ? o.facebook : "",
  };
}

export async function readSiteSocial(): Promise<SiteSocial> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT };
    return normalizeStored(parsed);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT, null, 2), "utf-8");
    return { ...DEFAULT };
  }
}

export async function writeSiteSocial(social: SiteSocial): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(social, null, 2), "utf-8");
}
