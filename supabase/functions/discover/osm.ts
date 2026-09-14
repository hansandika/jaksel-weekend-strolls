import {
  type AreaDef,
  type PlaceTypeKey,
  areaForPoint,
} from "./areas.ts";

export const OSM_USER_AGENT =
  "JakselWeekendStrolls/m2 (https://github.com/hansandika/jaksel-weekend-strolls; OSM Overpass, not Google Places)";

const OVERPASS_ENDPOINTS = [
  "https://overpass.openstreetmap.fr/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

export type OsmElement = {
  type: "node" | "way" | "relation" | string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export type MappedCandidate = {
  name: string;
  area_label: string;
  area_key: string;
  source: "osm";
  source_id: string;
  lat: number | null;
  lng: number | null;
  osm_type: string;
  tags: string[];
  place_types: string[];
  draft_why: string;
  draft_tip: string;
  raw: Record<string, unknown>;
  wikipedia?: string;
};

export function buildOverpassQuery(
  areas: AreaDef[],
  placeTypes: PlaceTypeKey[],
): string {
  const clauses: string[] = [];
  for (const area of areas) {
    const [south, west, north, east] = area.bbox;
    const bbox = `(${south},${west},${north},${east})`;
    for (const type of placeTypes) {
      if (type === "mall") {
        clauses.push(`nwr["shop"="mall"]${bbox};`);
        clauses.push(`nwr["shop"="department_store"]${bbox};`);
      } else {
        clauses.push(`nwr["amenity"="${type}"]${bbox};`);
      }
    }
  }
  return `[out:json][timeout:45];(${clauses.join("")});out center tags;`;
}

export async function fetchOverpass(query: string): Promise<OsmElement[]> {
  let lastError = "Overpass failed";
  for (const endpoint of OVERPASS_ENDPOINTS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": OSM_USER_AGENT,
          },
          body: new URLSearchParams({ data: query }).toString(),
          signal: AbortSignal.timeout(20000),
        });
        if (!response.ok) {
          lastError = `Overpass ${response.status} from ${endpoint}`;
          continue;
        }
        const payload = await response.json() as { elements?: OsmElement[] };
        if (!Array.isArray(payload.elements)) {
          lastError = `Overpass returned no elements from ${endpoint}`;
          continue;
        }
        return payload.elements;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
    }
  }
  throw new Error(lastError);
}

function coords(element: OsmElement): { lat: number; lng: number } | null {
  if (typeof element.lat === "number" && typeof element.lon === "number") {
    return { lat: element.lat, lng: element.lon };
  }
  if (
    element.center &&
    typeof element.center.lat === "number" &&
    typeof element.center.lon === "number"
  ) {
    return { lat: element.center.lat, lng: element.center.lon };
  }
  return null;
}

function displayName(tags: Record<string, string>): string | null {
  const name = tags.name || tags["name:en"] || tags["name:id"];
  const trimmed = name?.trim() ?? "";
  return trimmed.length >= 2 ? trimmed : null;
}

function placeTypesFromTags(tags: Record<string, string>): string[] {
  const types = new Set<string>();
  if (tags.amenity === "cafe") types.add("cafe");
  if (tags.amenity === "restaurant") types.add("restaurant");
  if (tags.amenity === "fast_food") types.add("fast_food");
  if (tags.shop === "mall" || tags.shop === "department_store") types.add("mall");
  return [...types];
}

function extraTags(
  tags: Record<string, string>,
  area: AreaDef,
): string[] {
  const list: string[] = [];
  if (area.outOfJaksel) list.push("out-of-jaksel");
  if (tags.cuisine) {
    for (const cuisine of tags.cuisine.split(/;|,/)) {
      const value = cuisine.trim().toLowerCase();
      if (value) list.push(value);
    }
  }
  if (tags.internet_access === "wlan" || tags.internet_access === "yes") {
    list.push("wifi");
  }
  if (tags.outdoor_seating === "yes") list.push("outdoor");
  if (tags.takeaway === "yes") list.push("takeaway");
  if (tags.air_conditioning === "yes") list.push("ac");
  return [...new Set(list)].slice(0, 8);
}

function typeLabel(types: string[]): string {
  if (types.includes("mall")) return "Mall";
  if (types.includes("cafe")) return "Café";
  if (types.includes("fast_food")) return "Quick eat";
  if (types.includes("restaurant")) return "Restaurant";
  return "Place";
}

function composeWhy(
  tags: Record<string, string>,
  types: string[],
  area: AreaDef,
): string {
  if (tags.description?.trim()) return tags.description.trim().slice(0, 280);
  const bits: string[] = [];
  bits.push(`${typeLabel(types)} in ${area.label}, mapped on OpenStreetMap.`);
  if (tags.cuisine) {
    bits.push(`Cuisine: ${tags.cuisine.replace(/;/g, ", ")}.`);
  }
  if (tags.opening_hours) bits.push(`Hours: ${tags.opening_hours}.`);
  return bits.join(" ").slice(0, 320);
}

function composeTip(types: string[], area: AreaDef): string {
  const areaTips: Record<string, string> = {
    blok_m:
      "MRT Blok M / ASEAN is the easy in. Melawai queues peak 11–14 on weekends.",
    cipete:
      "Cipete Raya is Grab-friendly; rain turns the sidewalk into a pond.",
    tebet: "Stay in one Tebet cluster — park-side or street, not both in the rain.",
    fatmawati_pi: "Pondok Indah is the covered backup. Park once.",
    alam_sutera:
      "Outside Jaksel — only use this if the week pack explicitly asks for Alam Sutera.",
  };
  const typeTips: string[] = [];
  if (types.includes("cafe")) {
    typeTips.push("Go before 11 if you need a seat / plug.");
  }
  if (types.includes("restaurant") || types.includes("fast_food")) {
    typeTips.push("Have a next-door backup if the line is the event.");
  }
  if (types.includes("mall")) {
    typeTips.push("Use as a rain / AC buffer between food stops.");
  }
  return [areaTips[area.key], ...typeTips].filter(Boolean).join(" ").slice(0, 280);
}

export function mapOsmElement(
  element: OsmElement,
  areas: AreaDef[],
): MappedCandidate | null {
  const tags = element.tags ?? {};
  const name = displayName(tags);
  if (!name) return null;
  const point = coords(element);
  if (!point) return null;
  const area = areaForPoint(point.lat, point.lng, areas);
  if (!area) return null;
  const types = placeTypesFromTags(tags);
  if (types.length === 0) return null;
  return {
    name,
    area_label: area.label,
    area_key: area.key,
    source: "osm",
    source_id: `${element.type}/${element.id}`,
    lat: point.lat,
    lng: point.lng,
    osm_type: element.type,
    tags: extraTags(tags, area),
    place_types: types,
    draft_why: composeWhy(tags, types, area),
    draft_tip: composeTip(types, area),
    wikipedia: tags.wikipedia,
    raw: {
      osm: { type: element.type, id: element.id, tags },
    },
  };
}

export async function enrichWikipediaBlurbs(
  mapped: MappedCandidate[],
  limit = 8,
): Promise<void> {
  const withWiki = mapped.filter((item) => item.wikipedia).slice(0, limit);
  await Promise.all(
    withWiki.map(async (item) => {
      const extract = await wikipediaExtract(item.wikipedia!);
      if (extract) item.draft_why = extract;
    }),
  );
}

async function wikipediaExtract(tag: string): Promise<string | null> {
  const [lang, ...rest] = tag.split(":");
  const title = rest.join(":").trim();
  if (!lang || !title) return null;
  try {
    const url =
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${
        encodeURIComponent(title)
      }`;
    const response = await fetch(url, {
      headers: { "User-Agent": OSM_USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const payload = await response.json() as { extract?: string };
    const extract = payload.extract?.trim();
    return extract ? extract.slice(0, 400) : null;
  } catch {
    return null;
  }
}
