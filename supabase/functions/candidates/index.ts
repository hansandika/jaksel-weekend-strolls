import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { requireAdmin } from "./auth.ts";
import { json, optionsResponse } from "./http.ts";
import { serviceClient } from "./supabase.ts";

const STATUSES = new Set(["new", "approved", "rejected", "need_tiktok"]);
const INGEST_SOURCES = new Set(["geofabrik", "osm_bulk", "hot", "osm"]);
const MAX_INGEST = 80;
const MAX_PHOTO_UPDATES = 80;

type IngestRow = {
  name?: unknown;
  area_label?: unknown;
  area_key?: unknown;
  source?: unknown;
  source_id?: unknown;
  lat?: unknown;
  lng?: unknown;
  osm_type?: unknown;
  tags?: unknown;
  place_types?: unknown;
  draft_why?: unknown;
  draft_tip?: unknown;
  raw?: unknown;
};

type PhotoUpdate = {
  id?: unknown;
  photo_url?: unknown;
  photo_urls?: unknown;
  mapillary?: unknown;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return optionsResponse();
  const denied = requireAdmin(req);
  if (denied) return denied;

  const supabase = serviceClient();
  const url = new URL(req.url);

  if (req.method === "GET") {
    try {
      const id = url.searchParams.get("id");
      if (id) {
        const { data, error } = await supabase
          .from("candidates")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: "not found" }, 404);
        return json({ candidate: data });
      }

      const filter = url.searchParams.get("filter") ?? "all";
      const status = url.searchParams.get("status");
      const q = url.searchParams.get("q")?.trim();
      const missingPhotos = url.searchParams.get("missing_photos") === "1";
      const source = url.searchParams.get("source");
      const parsedLimit = Number(url.searchParams.get("limit") ?? "1000");
      const parsedOffset = Number(url.searchParams.get("offset") ?? "0");
      const limit = Number.isFinite(parsedLimit)
        ? Math.min(Math.max(parsedLimit, 1), 1000)
        : 1000;
      const offset = Number.isFinite(parsedOffset)
        ? Math.max(parsedOffset, 0)
        : 0;

      let query = supabase
        .from("candidates")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status && STATUSES.has(status)) query = query.eq("status", status);
      if (source) query = query.eq("source", source);
      if (filter === "cafe") query = query.contains("place_types", ["cafe"]);
      if (filter === "food") {
        query = query.overlaps("place_types", ["restaurant", "fast_food"]);
      }
      if (filter === "mall") query = query.contains("place_types", ["mall"]);
      if (filter === "out") query = query.contains("tags", ["out-of-jaksel"]);
      if (q) query = query.ilike("name", `%${q}%`);
      if (missingPhotos) {
        query = query.is("photo_url", null);
      }

      const [listResult, statusResult] = await Promise.all([
        query,
        supabase.from("candidates").select("status"),
      ]);

      if (listResult.error) return json({ error: listResult.error.message }, 500);
      if (statusResult.error) {
        return json({ error: statusResult.error.message }, 500);
      }

      const counts = { new: 0, approved: 0, need_tiktok: 0, rejected: 0 };
      for (const row of statusResult.data ?? []) {
        if (row.status in counts) {
          counts[row.status as keyof typeof counts] += 1;
        }
      }

      return json({
        candidates: listResult.data ?? [],
        counts,
      });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : JSON.stringify(error);
      return json({ error: message }, 500);
    }
  }

  if (req.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  const body = await req.json().catch(() => ({})) as {
    action?: string;
    id?: string;
    ids?: string[];
    status?: string;
    draft_why?: string;
    draft_tip?: string;
    tiktok_urls?: string[];
    source?: string;
    rows?: IngestRow[];
    updates?: PhotoUpdate[];
    log_run?: boolean;
    areas?: string[];
    place_types?: string[];
    limit?: number;
  };

  if (body.action === "set_status") {
    const ids = Array.isArray(body.ids)
      ? body.ids.filter(Boolean)
      : body.id
      ? [body.id]
      : [];
    if (ids.length === 0) return json({ error: "ids required" }, 400);
    if (!body.status || !STATUSES.has(body.status)) {
      return json({ error: "invalid status" }, 400);
    }
    const { data, error } = await supabase
      .from("candidates")
      .update({ status: body.status })
      .in("id", ids)
      .select("id, status");
    if (error) return json({ error: error.message }, 500);
    return json({ updated: data?.length ?? 0, candidates: data ?? [] });
  }

  if (body.action === "update") {
    if (!body.id) return json({ error: "id required" }, 400);
    const patch: Record<string, unknown> = {};
    if (typeof body.draft_why === "string") patch.draft_why = body.draft_why;
    if (typeof body.draft_tip === "string") patch.draft_tip = body.draft_tip;
    if (Array.isArray(body.tiktok_urls)) {
      patch.tiktok_urls = body.tiktok_urls.filter((url) => typeof url === "string");
    }
    if (typeof body.status === "string") {
      if (!STATUSES.has(body.status)) {
        return json({ error: "invalid status" }, 400);
      }
      patch.status = body.status;
    }
    if (Object.keys(patch).length === 0) {
      return json({ error: "nothing to update" }, 400);
    }
    const { data, error } = await supabase
      .from("candidates")
      .update(patch)
      .eq("id", body.id)
      .select("*")
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);
    if (!data) return json({ error: "not found" }, 404);
    return json({ candidate: data });
  }

  if (body.action === "ingest") {
    const source = typeof body.source === "string" ? body.source : "";
    if (!INGEST_SOURCES.has(source)) {
      return json({ error: "invalid ingest source" }, 400);
    }
    const incoming = Array.isArray(body.rows) ? body.rows : [];
    if (incoming.length === 0) return json({ error: "rows required" }, 400);
    if (incoming.length > MAX_INGEST) {
      return json({ error: `max ${MAX_INGEST} rows per request` }, 400);
    }

    const mapped = [];
    const seen = new Set<string>();
    for (const row of incoming) {
      const name = typeof row.name === "string" ? row.name.trim() : "";
      const sourceId = typeof row.source_id === "string" ? row.source_id.trim() : "";
      const lat = typeof row.lat === "number" ? row.lat : Number(row.lat);
      const lng = typeof row.lng === "number" ? row.lng : Number(row.lng);
      if (name.length < 2 || !sourceId) continue;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      if (seen.has(sourceId)) continue;
      seen.add(sourceId);
      mapped.push({
        status: "new",
        name,
        area_label: typeof row.area_label === "string" ? row.area_label : null,
        area_key: typeof row.area_key === "string" ? row.area_key : null,
        source,
        source_id: sourceId,
        lat,
        lng,
        osm_type: typeof row.osm_type === "string" ? row.osm_type : null,
        tags: Array.isArray(row.tags)
          ? row.tags.filter((tag): tag is string => typeof tag === "string")
          : [],
        place_types: Array.isArray(row.place_types)
          ? row.place_types.filter((tag): tag is string => typeof tag === "string")
          : [],
        draft_why: typeof row.draft_why === "string" ? row.draft_why : null,
        draft_tip: typeof row.draft_tip === "string" ? row.draft_tip : null,
        tiktok_candidates: [],
        tiktok_urls: [],
        raw: row.raw && typeof row.raw === "object" ? row.raw : {},
      });
    }

    const sourceIds = mapped.map((item) => item.source_id);
    const existingIds = new Set<string>();
    for (let i = 0; i < sourceIds.length; i += 100) {
      const chunk = sourceIds.slice(i, i + 100);
      const { data: existing, error: existingError } = await supabase
        .from("candidates")
        .select("source_id")
        .in("source_id", chunk);
      if (existingError) return json({ error: existingError.message }, 500);
      for (const row of existing ?? []) {
        if (row.source_id) existingIds.add(row.source_id);
      }
    }

    const fresh = mapped.filter((item) => !existingIds.has(item.source_id));
    let inserted = 0;
    if (fresh.length > 0) {
      const { data: insertedRows, error: insertError } = await supabase
        .from("candidates")
        .insert(fresh)
        .select("id");
      if (insertError) return json({ error: insertError.message }, 500);
      inserted = insertedRows?.length ?? 0;
    }

    const skipped = mapped.length - inserted;
    if (body.log_run) {
      await supabase.from("discovery_runs").insert({
        status: "succeeded",
        areas: Array.isArray(body.areas) ? body.areas : [],
        place_types: Array.isArray(body.place_types) ? body.place_types : [],
        found_count: mapped.length,
        inserted_count: inserted,
        skipped_count: skipped,
        summary: { source, batch: true },
        finished_at: new Date().toISOString(),
      });
    }

    return json({
      source,
      found: mapped.length,
      inserted,
      skipped,
    });
  }

  if (body.action === "set_photos") {
    const updates = Array.isArray(body.updates) ? body.updates : [];
    if (updates.length === 0) return json({ error: "updates required" }, 400);
    if (updates.length > MAX_PHOTO_UPDATES) {
      return json({ error: `max ${MAX_PHOTO_UPDATES} photo updates` }, 400);
    }
    let updated = 0;
    for (const item of updates) {
      if (typeof item.id !== "string" || !item.id) continue;
      const patch: Record<string, unknown> = {};
      if (typeof item.photo_url === "string") patch.photo_url = item.photo_url;
      if (Array.isArray(item.photo_urls)) {
        patch.photo_urls = item.photo_urls.filter((url) => typeof url === "string");
      }
      if (item.mapillary && typeof item.mapillary === "object") {
        patch.mapillary = item.mapillary;
      }
      if (Object.keys(patch).length === 0) continue;
      const { error } = await supabase
        .from("candidates")
        .update(patch)
        .eq("id", item.id);
      if (error) return json({ error: error.message }, 500);
      updated += 1;
    }
    return json({ updated });
  }

  if (body.action === "fetch_photos") {
    const token = (Deno.env.get("MAPILLARY_ACCESS_TOKEN") ?? "").trim();
    if (!token) {
      return json({
        skipped: true,
        updated: 0,
        error:
          "MAPILLARY_ACCESS_TOKEN is not set on this function. The parent environment must inject it as a Function secret.",
      });
    }
    const limit = Math.min(Math.max(Number(body.limit) || 40, 1), 80);
    const { data: rows, error: listError } = await supabase
      .from("candidates")
      .select("id, lat, lng, photo_url")
      .is("photo_url", null)
      .not("lat", "is", null)
      .not("lng", "is", null)
      .limit(limit);
    if (listError) return json({ error: listError.message }, 500);

    let updated = 0;
    let looked = 0;
    for (const row of rows ?? []) {
      looked += 1;
      const photo = await nearestMapillary(token, row.lat, row.lng);
      if (!photo) continue;
      const photoUrl = `/api/mapillary/${photo.image_id}`;
      const { error } = await supabase
        .from("candidates")
        .update({
          photo_url: photoUrl,
          photo_urls: [photoUrl],
          mapillary: photo,
        })
        .eq("id", row.id);
      if (error) return json({ error: error.message }, 500);
      updated += 1;
      await sleep(180);
    }
    return json({ skipped: false, looked, updated });
  }

  return json({ error: "unknown action" }, 400);
});

type MapillaryPhoto = {
  image_id: string;
  captured_at?: string | number;
  compass_angle?: number;
};

async function nearestMapillary(
  token: string,
  lat: number,
  lng: number,
): Promise<MapillaryPhoto | null> {
  const params = new URLSearchParams({
    fields: "id,thumb_256_url,thumb_1024_url,captured_at,compass_angle",
    lat: String(lat),
    lng: String(lng),
    radius: "50",
    limit: "3",
  });
  const response = await fetch(`https://graph.mapillary.com/images?${params}`, {
    headers: { Authorization: `OAuth ${token}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  const payload = await response.json() as {
    data?: Array<{
      id?: string;
      captured_at?: string | number;
      compass_angle?: number;
    }>;
  };
  const first = payload.data?.[0];
  if (!first?.id) return null;
  return {
    image_id: first.id,
    captured_at: first.captured_at,
    compass_angle: first.compass_angle,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
