import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "yassien_admin";

function getSecret(): string {
  return process.env.ADMIN_SECRET || "dev-only-set-admin-secret-in-env";
}

export function signSession(expMs: number): string {
  const payload = Buffer.from(JSON.stringify({ exp: expMs }), "utf-8").toString(
    "base64url",
  );
  const sig = createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined): boolean {
  if (!token || !token.includes(".")) return false;
  const i = token.lastIndexOf(".");
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  try {
    const json = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8"),
    ) as { exp?: number };
    return typeof json.exp === "number" && json.exp > Date.now();
  } catch {
    return false;
  }
}

export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 1) {
    console.warn(
      "ADMIN_PASSWORD is not set; login disabled until configured in .env.local.",
    );
    return false;
  }
  if (password.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(password), Buffer.from(expected));
}
