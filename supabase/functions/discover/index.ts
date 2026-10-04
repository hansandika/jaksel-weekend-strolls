import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { requireAdmin } from "./auth.ts";
import { json, optionsResponse } from "./http.ts";
import {
  resolveAreas,
  resolvePlaceTypes,
} from "./areas.ts";
import {
  buildOverpassQuery,
  enrichWikipediaBlurbs,
  fetchOverpass,
  mapOsmElement,
  type OsmElement,
} from "./osm.ts";
import { serviceClient } from "./supabase.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return optionsResponse();
  const denied = requireAdmin(req);
  if (denied) return denied;

  const supabase = serviceClient();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("discovery_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12);
    if (error) return json({ error: error.message }, 500);
    return json({ runs: data ?? [] });
  }

  if (req.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  const body = await req.json().catch(() => ({})) as {
    areas?: unknown;
    place_types?: unknown;
    elements?: unknown;
  };
  const areas = resolveAreas(body.areas);
  const placeTypes = resolvePlaceTypes(body.place_types);
  const areaKeys = areas.map((area) => area.key);
  const providedElements = Array.isArray(body.elements) ? body.elements : null;

  const { data: run, error: runError } = await supabase
    .from("discovery_runs")
    .insert({
      status: "running",
      areas: areaKeys,
      place_types: placeTypes,
    })
    .select("*")
    .single();
  if (runError || !run) {
    return json({ error: runError?.message ?? "could not start run" }, 500);
  }

  try {
    const query = buildOverpassQuery(areas, placeTypes);
    const elements: OsmElement[] = providedElements
      ? providedElements as OsmElement[]
      : await fetchOverpass(query);
    const mapped = [];
    const seen = new Set<string>();
    for (const element of elements) {
      const candidate = mapOsmElement(element, areas);
      if (!candidate) continue;
      if (seen.has(candidate.source_id)) continue;
      seen.add(candidate.source_id);
      mapped.push(candidate);
    }

    await enrichWikipediaBlurbs(mapped);

    const sourceIds = mapped.map((item) => item.source_id);
    const existingIds = new Set<string>();
    for (let i = 0; i < sourceIds.length; i += 100) {
      const chunk = sourceIds.slice(i, i + 100);
      const { data: existing, error: existingError } = await supabase
        .from("candidates")
        .select("source_id")
        .in("source_id", chunk);
      if (existingError) throw new Error(existingError.message);
      for (const row of existing ?? []) {
        if (row.source_id) existingIds.add(row.source_id);
      }
    }

    const fresh = mapped.filter((item) => !existingIds.has(item.source_id));
    const rows = fresh.map((item) => ({
      status: "new",
      name: item.name,
      area_label: item.area_label,
      area_key: item.area_key,
      source: item.source,
      source_id: item.source_id,
      lat: item.lat,
      lng: item.lng,
      osm_type: item.osm_type,
      tags: item.tags,
      place_types: item.place_types,
      draft_why: item.draft_why,
      draft_tip: item.draft_tip,
      tiktok_candidates: [],
      tiktok_urls: [],
      raw: item.raw,
    }));

    let inserted = 0;
    for (let i = 0; i < rows.length; i += 80) {
      const chunk = rows.slice(i, i + 80);
      const { data: insertedRows, error: insertError } = await supabase
        .from("candidates")
        .insert(chunk)
        .select("id");
      if (insertError) throw new Error(insertError.message);
      inserted += insertedRows?.length ?? 0;
    }

    const skipped = mapped.length - fresh.length;
    const summary = {
      source: "osm",
      overpass_elements: elements.length,
      named_mapped: mapped.length,
      per_area: Object.fromEntries(
        areaKeys.map((key) => [
          key,
          mapped.filter((item) => item.area_key === key).length,
        ]),
      ),
    };

    const { data: finished, error: finishError } = await supabase
      .from("discovery_runs")
      .update({
        status: "succeeded",
        found_count: mapped.length,
        inserted_count: inserted,
        skipped_count: skipped,
        summary,
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id)
      .select("*")
      .single();
    if (finishError) throw new Error(finishError.message);

    return json({
      run: finished,
      found: mapped.length,
      inserted,
      skipped,
      areas: areaKeys,
      place_types: placeTypes,
      source: "osm",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    await supabase
      .from("discovery_runs")
      .update({
        status: "failed",
        error: message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id);
    return json({ error: message, run_id: run.id }, 502);
  }
});
