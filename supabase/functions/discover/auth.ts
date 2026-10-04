import { json, safeEqual } from "./http.ts";

const DEMO_SECRET = "jaksel-m2-dev-secret";

export function adminSecret(): string {
  return Deno.env.get("ADMIN_SECRET") || DEMO_SECRET;
}

export function requireAdmin(req: Request): Response | null {
  const header = req.headers.get("x-admin-secret") ?? "";
  if (!safeEqual(header, adminSecret())) {
    return json({ error: "unauthorized" }, 401);
  }
  return null;
}
