#!/usr/bin/env node
/**
 * Import Google Maps places gathered by a browser lookup.
 * Does not call the Places API or fetch Maps HTML.
 *
 *   node scripts/import-gmaps.mjs places.json
 *   node scripts/import-gmaps.mjs places.csv
 *   node scripts/import-gmaps.mjs --dry-run places.json
 *
 * Upserts on gmaps_ftid through the candidates Edge Function.
 * Photos use scripts/lib/mapillary.mjs when MAPILLARY_ACCESS_TOKEN is set.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DISCOVERY_AREAS } from "./lib/areas.mjs";
import { candidatesPost, loadLocalEnv } from "./lib/admin-client.mjs";
import { placeTypesFromGoogleCategory } from "./lib/gmaps-categories.mjs";
import { toOsmOpeningHours } from "./lib/gmaps-hours.mjs";
import {
  mapillaryToken,
  nearestMapillaryImages,
  photoPath,
  sleep,
} from "./lib/mapillary.mjs";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const AREA_LABELS = new Map(DISCOVERY_AREAS.map((area) => [area.key, area.label]));
AREA_LABELS.set("glodok", "Glodok / Pancoran");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const fileArg = args.find((arg) => !arg.startsWith("--"));

function log(message) {
  process.stdout.write(`${message}\n`);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function asNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  const filled = rows.filter((columns) => columns.some((value) => value.trim()));
  const header = filled.shift();
  if (!header) return [];
  const keys = header.map((key) => key.trim());
  return filled.map((columns) => {
    const record = {};
    keys.forEach((key, index) => {
      record[key] = columns[index]?.trim() ?? "";
    });
    return record;
  });
}

function loadPlaces(path) {
  const text = readFileSync(path, "utf8");
  if (path.endsWith(".csv")) return parseCsv(text);
  const payload = JSON.parse(text);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.places)) return payload.places;
  fail("JSON must be an array or { places: [] }");
  return [];
}

function parseTikToks(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((url) => typeof url === "string" && url.includes("tiktok.com"));
  }
  const text = String(value).trim();
  if (!text) return [];
  if (text.startsWith("[")) {
    try {
      return parseTikToks(JSON.parse(text));
    } catch {
      return [];
    }
  }
  return text.split(/[|\s,]+/).filter((url) => url.includes("tiktok.com"));
}

function hoursInput(row) {
  const value = row.hours ?? row.hours_text ?? row.opening_hours ?? row.hours_by_day;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  return value ?? null;
}

function ftidOf(row) {
  const raw = String(row.ftid ?? row.gmaps_ftid ?? "").trim();
  return raw.replace(/^gmaps\//, "");
}

function draftWhy(place) {
  const bits = [`${place.name} in ${place.area_label}.`];
  if (place.gmaps_category) bits.push(`${place.gmaps_category}.`);
  if (place.rating != null && place.review_count != null) {
    bits.push(`★ ${place.rating} from ${place.review_count} Google reviews.`);
  } else if (place.rating != null) {
    bits.push(`★ ${place.rating} on Google Maps.`);
  }
  return bits.join(" ").slice(0, 320);
}

function draftTip(place) {
  const bits = [];
  if (place.price_range) bits.push(`Budget about ${place.price_range}.`);
  if (place.opening_hours) bits.push(`Hours ${place.opening_hours}.`);
  bits.push("Park once and walk the cluster.");
  return bits.join(" ").slice(0, 280);
}

export function mapGmapsPlace(row) {
  const name = String(row.name ?? "").trim();
  const ftid = ftidOf(row);
  const lat = asNumber(row.lat);
  const lng = asNumber(row.lng);
  const areaKey = String(row.area_key ?? "").trim();
  if (name.length < 2 || !ftid || !areaKey || lat == null || lng == null) {
    return null;
  }
  const category = String(row.category ?? row.gmaps_category ?? "").trim();
  const placeTypes = Array.isArray(row.place_types) && row.place_types.length > 0
    ? row.place_types.filter((type) => typeof type === "string")
    : placeTypesFromGoogleCategory(category);
  const openingHours = toOsmOpeningHours(hoursInput(row));
  const hoursText = typeof row.hours_text === "string"
    ? row.hours_text.trim()
    : typeof row.hours === "string"
      ? row.hours.trim()
      : null;
  const rating = asNumber(row.rating);
  const reviewCount = asNumber(row.review_count);
  const priceRange = String(row.price_range ?? "").trim() || null;
  const placeUrl = String(row.place_url ?? row.gmaps_place_url ?? "").trim() || null;
  const areaLabel = String(row.area_label ?? "").trim() || AREA_LABELS.get(areaKey) || areaKey;
  const tags = Array.isArray(row.tags)
    ? row.tags.filter((tag) => typeof tag === "string")
    : [];
  const place = {
    name,
    area_key: areaKey,
    area_label: areaLabel,
    lat,
    lng,
    gmaps_ftid: ftid,
    gmaps_place_url: placeUrl,
    gmaps_category: category || null,
    rating,
    review_count: reviewCount == null ? null : Math.round(reviewCount),
    price_range: priceRange,
    place_types: placeTypes,
    tags,
    opening_hours: openingHours,
    tiktok_urls: parseTikToks(row.tiktok_urls),
    draft_why: String(row.draft_why ?? "").trim() || null,
    draft_tip: String(row.draft_tip ?? "").trim() || null,
  };
  if (!place.draft_why) place.draft_why = draftWhy(place);
  if (!place.draft_tip) place.draft_tip = draftTip(place);
  const lookedUp = String(row.looked_up ?? "").trim() || today();
  place.raw = {
    source: "google_maps",
    opening_hours: openingHours,
    google_maps: {
      ftid,
      kg_id: row.kg_id ? String(row.kg_id) : null,
      place_url: placeUrl,
      category: category || null,
      address: row.address ? String(row.address) : null,
      rating,
      review_count: place.review_count,
      price_range: priceRange,
      hours_text: hoursText,
      opening_hours: openingHours,
      looked_up: lookedUp,
    },
  };
  return place;
}

async function attachPhoto(place) {
  if (!mapillaryToken()) return place;
  const images = await nearestMapillaryImages(place.lat, place.lng, {
    limit: 3,
    radius: 50,
  });
  const first = images[0];
  if (!first) return place;
  const path = photoPath(first.image_id);
  return {
    ...place,
    photo_url: path,
    photo_urls: images.map((image) => photoPath(image.image_id)),
    mapillary: first,
  };
}

async function main() {
  if (!fileArg) fail("Usage: node scripts/import-gmaps.mjs [--dry-run] places.json|places.csv");
  loadLocalEnv(ROOT);
  const path = resolve(fileArg);
  const rows = loadPlaces(path).map(mapGmapsPlace).filter(Boolean);
  log(`mapped ${rows.length} Google Maps places from ${path}`);
  if (rows.length === 0) fail("no valid places (need name, ftid, area_key, lat, lng)");
  if (dryRun) {
    process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
    return;
  }

  const withPhotos = [];
  if (mapillaryToken()) {
    for (const place of rows) {
      withPhotos.push(await attachPhoto(place));
      await sleep(180);
    }
  } else {
    log("Mapillary skip: MAPILLARY_ACCESS_TOKEN is not set");
    withPhotos.push(...rows);
  }

  let inserted = 0;
  let updated = 0;
  for (let index = 0; index < withPhotos.length; index += 40) {
    const chunk = withPhotos.slice(index, index + 40);
    const result = await candidatesPost({
      action: "upsert_gmaps",
      rows: chunk,
    });
    inserted += result.inserted ?? 0;
    updated += result.updated ?? 0;
    log(
      `upserted ${Math.min(index + chunk.length, withPhotos.length)}/${withPhotos.length} (inserted ${inserted}, updated ${updated})`,
    );
  }
}

const runningDirect = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (runningDirect) {
  main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
}
