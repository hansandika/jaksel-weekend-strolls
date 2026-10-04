import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export function loadLocalEnv(cwd = process.cwd()) {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(cwd, name);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const raw of text.split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

export function adminConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secret = process.env.ADMIN_SECRET;
  if (!url || !anon || !secret) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, or ADMIN_SECRET");
  }
  return { url, anon, secret };
}

export async function candidatesPost(body) {
  const { url, anon, secret } = adminConfig();
  const response = await fetch(`${url}/functions/v1/candidates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": secret,
      apikey: anon,
      Authorization: `Bearer ${anon}`,
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload.error === "string"
      ? payload.error
      : `candidates ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

export async function candidatesGet(search = "") {
  const { url, anon, secret } = adminConfig();
  const response = await fetch(`${url}/functions/v1/candidates${search}`, {
    headers: {
      "x-admin-secret": secret,
      apikey: anon,
      Authorization: `Bearer ${anon}`,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload.error === "string"
      ? payload.error
      : `candidates GET ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

export async function ingestBatches(source, rows, extra = {}) {
  const batchSize = 80;
  let inserted = 0;
  let skipped = 0;
  let found = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const result = await candidatesPost({
      action: "ingest",
      source,
      rows: chunk,
      log_run: i === 0,
      ...extra,
    });
    inserted += result.inserted ?? 0;
    skipped += result.skipped ?? 0;
    found += result.found ?? chunk.length;
    process.stdout.write(
      `  ${source} ${Math.min(i + chunk.length, rows.length)}/${rows.length} (inserted ${inserted}, skipped ${skipped})\n`,
    );
  }
  return { found, inserted, skipped };
}
