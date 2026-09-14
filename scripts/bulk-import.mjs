#!/usr/bin/env node
/**
 * Bulk OSM import for Jaksel Weekend Strolls (no Google Places).
 *
 * 1. Geofabrik Java PBF (Jakarta city clip is not published; we clip the Java
 *    extract to the Jaksel + Alam Sutera bbox).
 * 2. HOT Indonesia POIs from HDX (best-effort; skipped if the zip is awkward).
 * 3. Mapillary nearest-image enrichment when MAPILLARY_ACCESS_TOKEN is set.
 *
 * Usage:
 *   npm run import:bulk
 *   npm run import:photos
 *   node scripts/bulk-import.mjs --skip-geofabrik --skip-hot
 */

import { spawnSync } from "node:child_process";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { createInterface } from "node:readline";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CLIP_BBOX, DISCOVERY_AREAS } from "./lib/areas.mjs";
import {
  centroid,
  mapPoi,
  osmiumTags,
  sourceIdFromOsmProps,
} from "./lib/map-poi.mjs";
import {
  candidatesGet,
  candidatesPost,
  ingestBatches,
  loadLocalEnv,
} from "./lib/admin-client.mjs";
import {
  mapillaryToken,
  nearestMapillaryImages,
  photoPath,
  sleep,
} from "./lib/mapillary.mjs";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const CACHE = join(ROOT, "data/cache");
const USER_AGENT =
  "JakselWeekendStrolls/m2.5 (https://github.com/hansandika/jaksel-weekend-strolls; OSM Geofabrik + HOT, not Google Places)";
const GEOFABRIK_URL =
  "https://download.geofabrik.de/asia/indonesia/java-latest.osm.pbf";
const HOT_ZIP_URL =
  "https://s3.dualstack.us-east-1.amazonaws.com/production-raw-data-api/ISO3/IDN/points_of_interest/points/hotosm_idn_points_of_interest_points_geojson.zip";
const PACK_PATH = join(ROOT, "content/packs/2026-W38.json");
const PHOTOS_PATH = join(ROOT, "content/photos.json");

const args = new Set(process.argv.slice(2));
const photosOnly = args.has("--photos-only");
const skipGeofabrik = photosOnly || args.has("--skip-geofabrik");
const skipHot = photosOnly || args.has("--skip-hot");
const skipPhotos = args.has("--skip-photos");

loadLocalEnv(ROOT);
mkdirSync(CACHE, { recursive: true });

function log(message) {
  process.stdout.write(`${message}\n`);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function run(command, argv, opts = {}) {
  const result = spawnSync(command, argv, {
    stdio: "inherit",
    ...opts,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${argv.join(" ")} failed (${result.status})`);
  }
}

async function download(url, dest) {
  if (existsSync(dest)) {
    log(`cached ${basename(dest)}`);
    return dest;
  }
  const partial = `${dest}.partial`;
  log(`downloading ${url}`);
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    redirect: "follow",
  });
  if (!response.ok || !response.body) {
    throw new Error(`download ${response.status} ${url}`);
  }
  await pipeline(Readable.fromWeb(response.body), createWriteStream(partial));
  run("mv", [partial, dest]);
  return dest;
}

function requireOsmium() {
  const check = spawnSync("osmium", ["--version"], { encoding: "utf8" });
  if (check.status !== 0) {
    fail("osmium-tool is required. Install with: sudo apt-get install osmium-tool");
  }
}

async function importGeofabrik() {
  requireOsmium();
  const pbf = await download(GEOFABRIK_URL, join(CACHE, "java-latest.osm.pbf"));
  const clipped = join(CACHE, "jaksel-clip.osm.pbf");
  const filtered = join(CACHE, "jaksel-pois.osm.pbf");
  const geojsonseq = join(CACHE, "jaksel-pois.geojsonseq");
  const [west, south, east, north] = CLIP_BBOX;
  log(`osmium extract bbox ${west},${south},${east},${north}`);
  run("osmium", [
    "extract",
    "-b",
    `${west},${south},${east},${north}`,
    "--overwrite",
    "-o",
    clipped,
    pbf,
  ]);
  log("osmium tags-filter amenity/shop stroll set");
  run("osmium", [
    "tags-filter",
    clipped,
    "nwr/amenity=cafe,restaurant,fast_food,ice_cream,food_court",
    "nwr/shop=mall,department_store,bakery,pastry,confectionery,coffee",
    "--overwrite",
    "-o",
    filtered,
  ]);
  log("osmium export geojsonseq");
  run("osmium", [
    "export",
    filtered,
    "-c",
    join(ROOT, "scripts/osmium-export.json"),
    "-f",
    "geojsonseq",
    "--overwrite",
    "-o",
    geojsonseq,
  ]);

  const rows = [];
  const seen = new Set();
  const rl = createInterface({ input: createReadStream(geojsonseq) });
  for await (const line of rl) {
    if (!line.trim()) continue;
    const cleaned = line.replace(/^\u001e/, "").trim();
    if (!cleaned) continue;
    let feature;
    try {
      feature = JSON.parse(cleaned);
    } catch {
      continue;
    }
    const props = feature.properties ?? {};
    const point = centroid(feature.geometry);
    if (!point) continue;
    const sourceId = sourceIdFromOsmProps(props);
    if (!sourceId || seen.has(sourceId)) continue;
    const mapped = mapPoi({
      source: "geofabrik",
      sourceId,
      tags: osmiumTags(props),
      lat: point.lat,
      lng: point.lng,
      osmType: sourceId.split("/")[0],
    });
    if (!mapped) continue;
    seen.add(sourceId);
    rows.push(mapped);
  }
  log(`geofabrik mapped ${rows.length} named stroll POIs in area boxes`);
  const stats = await ingestBatches("geofabrik", rows, {
    areas: DISCOVERY_AREAS.map((area) => area.key),
    place_types: ["cafe", "restaurant", "fast_food", "mall"],
  });
  return stats;
}

function unzipToDir(zipPath, destDir) {
  mkdirSync(destDir, { recursive: true });
  run("unzip", ["-o", "-q", zipPath, "-d", destDir]);
}

function findGeojson(dir) {
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) stack.push(path);
      else if (entry.name.endsWith(".geojson") || entry.name.endsWith(".json")) {
        return path;
      }
    }
  }
  return null;
}

async function loadHotFeatures(filePath) {
  const first = readFileSync(filePath, { encoding: "utf8", flag: "r" }).slice(0, 80);
  const features = [];
  if (first.trim().startsWith("{")) {
    const json = JSON.parse(readFileSync(filePath, "utf8"));
    if (Array.isArray(json.features)) return json.features;
    throw new Error("HOT geojson has no features array");
  }
  const rl = createInterface({ input: createReadStream(filePath) });
  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      features.push(JSON.parse(line));
    } catch {
      // skip
    }
  }
  return features;
}

async function importHot() {
  try {
    const zip = await download(
      HOT_ZIP_URL,
      join(CACHE, "hotosm_idn_points_of_interest_points_geojson.zip"),
    );
    const dest = join(CACHE, "hot-pois");
    unzipToDir(zip, dest);
    const geojsonPath = findGeojson(dest);
    if (!geojsonPath) {
      log("HOT skip: no geojson inside zip");
      return { skippedClean: true };
    }
    log(`HOT reading ${geojsonPath}`);
    const features = await loadHotFeatures(geojsonPath);
    const rows = [];
    const seen = new Set();
    for (const feature of features) {
      const props = feature.properties ?? {};
      const point = centroid(feature.geometry);
      if (!point) continue;
      const sourceId = sourceIdFromOsmProps(props);
      if (!sourceId || seen.has(sourceId)) continue;
      const mapped = mapPoi({
        source: "hot",
        sourceId,
        tags: osmiumTags(props),
        lat: point.lat,
        lng: point.lng,
        osmType: sourceId.split("/")[0],
      });
      if (!mapped) continue;
      seen.add(sourceId);
      rows.push(mapped);
    }
    log(`HOT mapped ${rows.length} stroll POIs in area boxes`);
    const stats = await ingestBatches("hot", rows, {
      areas: DISCOVERY_AREAS.map((area) => area.key),
      place_types: ["cafe", "restaurant", "fast_food", "mall"],
    });
    return stats;
  } catch (error) {
    log(`HOT skip: ${error instanceof Error ? error.message : String(error)}`);
    return { skippedClean: true };
  }
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

async function listAllCandidates() {
  const all = [];
  for (let offset = 0; offset < 5000; offset += 1000) {
    const payload = await candidatesGet(`?limit=1000&offset=${offset}`);
    const chunk = payload.candidates ?? [];
    all.push(...chunk);
    if (chunk.length < 1000) break;
  }
  return all;
}

async function enrichPhotos() {
  const token = mapillaryToken();
  if (!token) {
    log("Mapillary skip: MAPILLARY_ACCESS_TOKEN is not set");
    return { skipped: true, updated: 0 };
  }
  const candidates = await listAllCandidates();
  const missing = candidates.filter(
    (row) =>
      !row.photo_url &&
      Number.isFinite(row.lat) &&
      Number.isFinite(row.lng),
  );
  log(`Mapillary looking up ${missing.length} candidates without photos`);
  let updated = 0;
  const pending = [];
  for (const row of missing) {
    const images = await nearestMapillaryImages(row.lat, row.lng, {
      limit: 3,
      radius: 50,
    });
    const first = images[0];
    if (first) {
      const path = photoPath(first.image_id);
      pending.push({
        id: row.id,
        photo_url: path,
        photo_urls: images.map((image) => photoPath(image.image_id)),
        mapillary: first,
      });
      row.photo_url = path;
      row.mapillary = first;
      updated += 1;
    }
    if (pending.length >= 40) {
      await candidatesPost({ action: "set_photos", updates: pending.splice(0) });
    }
    await sleep(180);
  }
  if (pending.length > 0) {
    await candidatesPost({ action: "set_photos", updates: pending });
  }
  writePackPhotos(candidates);
  log(`Mapillary updated ${updated} rows`);
  return { skipped: false, updated };
}

function writePackPhotos(candidates) {
  const pack = JSON.parse(readFileSync(PACK_PATH, "utf8"));
  const byNorm = new Map();
  for (const row of candidates) {
    if (!row.photo_url && !row.mapillary?.image_id) continue;
    const key = normalizeName(row.name);
    if (!key) continue;
    if (!byNorm.has(key)) byNorm.set(key, row);
  }
  const byStopName = {};
  for (const combo of pack.combos ?? []) {
    for (const stop of combo.stops ?? []) {
      const key = normalizeName(stop.name);
      let match = byNorm.get(key);
      if (!match) {
        match = [...byNorm.entries()].find(([name]) =>
          name.includes(key) || key.includes(name)
        )?.[1];
      }
      const imageId = match?.mapillary?.image_id;
      if (!imageId) continue;
      byStopName[stop.name] = {
        imageId,
        photoUrl: photoPath(imageId),
        candidateName: match.name,
      };
    }
  }
  writeFileSync(
    PHOTOS_PATH,
    `${JSON.stringify({ updatedAt: new Date().toISOString(), byStopName }, null, 2)}\n`,
  );
  log(`wrote ${Object.keys(byStopName).length} pack stop photos → content/photos.json`);
}

const summary = {
  geofabrik: null,
  hot: null,
  mapillary: null,
};

if (!skipGeofabrik) {
  log("== Geofabrik Java PBF (clipped to Jaksel bbox) ==");
  summary.geofabrik = await importGeofabrik();
}
if (!skipHot) {
  log("== HOT Indonesia POIs ==");
  summary.hot = await importHot();
}
if (!skipPhotos) {
  log("== Mapillary nearest images ==");
  summary.mapillary = await enrichPhotos();
} else if (!existsSync(PHOTOS_PATH)) {
  writeFileSync(
    PHOTOS_PATH,
    `${JSON.stringify({ updatedAt: null, byStopName: {} }, null, 2)}\n`,
  );
}

log("bulk import done");
log(JSON.stringify(summary, null, 2));
