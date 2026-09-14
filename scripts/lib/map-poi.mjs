import { areaForPoint } from "./areas.mjs";

export function displayName(tags = {}) {
  const name = tags.name || tags["name:en"] || tags["name:id"];
  const trimmed = String(name ?? "").trim();
  return trimmed.length >= 2 ? trimmed : null;
}

export function placeTypesFromTags(tags = {}) {
  const types = new Set();
  if (tags.amenity === "cafe") types.add("cafe");
  if (tags.amenity === "restaurant") types.add("restaurant");
  if (tags.amenity === "fast_food") types.add("fast_food");
  if (tags.amenity === "ice_cream") types.add("cafe");
  if (tags.amenity === "food_court") types.add("restaurant");
  if (tags.shop === "mall" || tags.shop === "department_store") types.add("mall");
  if (["bakery", "pastry", "confectionery", "coffee"].includes(tags.shop)) {
    types.add("cafe");
  }
  return [...types];
}

export function extraTags(tags = {}, area) {
  const list = [];
  if (area?.outOfJaksel) list.push("out-of-jaksel");
  if (tags.cuisine) {
    for (const cuisine of String(tags.cuisine).split(/;|,/)) {
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

function typeLabel(types) {
  if (types.includes("mall")) return "Mall";
  if (types.includes("cafe")) return "Café";
  if (types.includes("fast_food")) return "Quick eat";
  if (types.includes("restaurant")) return "Restaurant";
  return "Place";
}

export function composeWhy(tags = {}, types, area) {
  if (tags.description?.trim()) return String(tags.description).trim().slice(0, 280);
  const bits = [];
  bits.push(`${typeLabel(types)} in ${area.label}, mapped on OpenStreetMap.`);
  if (tags.cuisine) bits.push(`Cuisine: ${String(tags.cuisine).replace(/;/g, ", ")}.`);
  if (tags.opening_hours) bits.push(`Hours: ${tags.opening_hours}.`);
  return bits.join(" ").slice(0, 320);
}

export function composeTip(types, area) {
  const areaTips = {
    blok_m:
      "MRT Blok M / ASEAN is the easy in. Melawai queues peak 11–14 on weekends.",
    cipete: "Cipete Raya is Grab-friendly; rain turns the sidewalk into a pond.",
    tebet: "Stay in one Tebet cluster — park-side or street, not both in the rain.",
    fatmawati_pi: "Pondok Indah is the covered backup. Park once.",
    alam_sutera:
      "Outside Jaksel — only use this if the week pack explicitly asks for Alam Sutera.",
  };
  const typeTips = [];
  if (types.includes("cafe")) typeTips.push("Go before 11 if you need a seat / plug.");
  if (types.includes("restaurant") || types.includes("fast_food")) {
    typeTips.push("Have a next-door backup if the line is the event.");
  }
  if (types.includes("mall")) {
    typeTips.push("Use as a rain / AC buffer between food stops.");
  }
  return [areaTips[area.key], ...typeTips].filter(Boolean).join(" ").slice(0, 280);
}

export function centroid(geometry) {
  if (!geometry) return null;
  if (geometry.type === "Point" && Array.isArray(geometry.coordinates)) {
    const [lng, lat] = geometry.coordinates;
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    return null;
  }
  let ring = null;
  if (geometry.type === "Polygon") ring = geometry.coordinates?.[0];
  else if (geometry.type === "MultiPolygon") ring = geometry.coordinates?.[0]?.[0];
  else if (geometry.type === "LineString") ring = geometry.coordinates;
  else if (geometry.type === "MultiLineString") ring = geometry.coordinates?.[0];
  if (!Array.isArray(ring) || ring.length === 0) return null;
  let x = 0;
  let y = 0;
  let n = 0;
  for (const pair of ring) {
    if (!Array.isArray(pair) || pair.length < 2) continue;
    const [lng, lat] = pair;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    x += lng;
    y += lat;
    n += 1;
  }
  return n > 0 ? { lat: y / n, lng: x / n } : null;
}

export function sourceIdFromOsmProps(props = {}) {
  if (typeof props["@id"] === "string" && String(props["@id"]).includes("/")) {
    return props["@id"];
  }
  const osmType = props.osm_type || props["@type"] || props.type;
  let osmId = props.osm_id ?? props["@id"] ?? props.id;
  if (typeof osmId === "string" && osmId.includes("/")) return osmId;
  if (osmId == null) return null;
  const numeric = Number(osmId);
  if (!Number.isFinite(numeric) || numeric === 0) return null;
  if (numeric < 0) {
    return `way/${Math.abs(numeric)}`;
  }
  const kind = String(osmType || "node").toLowerCase();
  if (kind.startsWith("w")) return `way/${numeric}`;
  if (kind.startsWith("r")) return `relation/${numeric}`;
  if (kind.startsWith("n")) return `node/${numeric}`;
  return `node/${numeric}`;
}

export function mapPoi({ source, sourceId, tags, lat, lng, osmType }) {
  const name = displayName(tags);
  if (!name) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const area = areaForPoint(lat, lng);
  if (!area) return null;
  const types = placeTypesFromTags(tags);
  if (types.length === 0) return null;
  const id = sourceId || null;
  if (!id) return null;
  return {
    name,
    area_label: area.label,
    area_key: area.key,
    source,
    source_id: id,
    lat,
    lng,
    osm_type: osmType || id.split("/")[0],
    tags: extraTags(tags, area),
    place_types: types,
    draft_why: composeWhy(tags, types, area),
    draft_tip: composeTip(types, area),
    raw: { [source]: { source_id: id, tags } },
  };
}

export function osmiumTags(props = {}) {
  const tags = { ...props };
  delete tags["@id"];
  delete tags["@type"];
  delete tags["@version"];
  delete tags["@changeset"];
  delete tags["@timestamp"];
  delete tags["@uid"];
  delete tags["@user"];
  return tags;
}
