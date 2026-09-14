import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { requireAdmin } from "./auth.ts";
import { json, optionsResponse } from "./http.ts";
import { serviceClient } from "./supabase.ts";

const STATUSES = new Set(["new", "approved", "rejected", "need_tiktok"]);

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

    let query = supabase
      .from("candidates")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(400);

    if (status && STATUSES.has(status)) query = query.eq("status", status);
    if (filter === "cafe") query = query.contains("place_types", ["cafe"]);
    if (filter === "food") {
      query = query.overlaps("place_types", ["restaurant", "fast_food"]);
    }
    if (filter === "mall") query = query.contains("place_types", ["mall"]);
    if (filter === "out") query = query.contains("tags", ["out-of-jaksel"]);
    if (q) query = query.ilike("name", `%${q}%`);

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

  return json({ error: "unknown action" }, 400);
});

