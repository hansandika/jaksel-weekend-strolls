import { DISCOVERY_AREAS } from "./discovery-areas";

const OSM_USER_AGENT =
  "JakselWeekendStrolls/m2 (https://github.com/hansandika/jaksel-weekend-strolls; OSM Overpass, not Google Places)";

const OVERPASS_ENDPOINTS = [
  "https://overpass.openstreetmap.fr/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

export function buildOverpassQuery(areaKeys: string[], placeTypes: string[]): string {
  const areas = DISCOVERY_AREAS.filter((area) => areaKeys.includes(area.key));
  const types = placeTypes.length > 0
    ? placeTypes
    : ["cafe", "restaurant", "fast_food", "bakery", "ice_cream", "bar", "mall", "marketplace"];
  const clauses: string[] = [];
  for (const area of areas) {
    const [south, west, north, east] = area.bbox;
    const bbox = `(${south},${west},${north},${east})`;
    for (const type of types) {
      clauses.push(...overpassClauses(type, bbox));
    }
  }
  return `[out:json][timeout:55];(${clauses.join("")});out center tags;`;
}

function overpassClauses(type: string, bbox: string): string[] {
  switch (type) {
    case "mall":
      return [`nwr["shop"="mall"]${bbox};`, `nwr["shop"="department_store"]${bbox};`];
    case "bakery":
      return [`nwr["shop"="bakery"]${bbox};`, `nwr["shop"="pastry"]${bbox};`];
    case "ice_cream":
      return [`nwr["amenity"="ice_cream"]${bbox};`];
    case "bar":
      return [`nwr["amenity"="bar"]${bbox};`];
    case "marketplace":
      return [
        `nwr["amenity"="marketplace"]${bbox};`,
        `nwr["shop"="marketplace"]${bbox};`,
      ];
    case "attraction":
      return [`nwr["tourism"="attraction"]["name"]${bbox};`];
    default:
      return [`nwr["amenity"="${type}"]${bbox};`];
  }
}

export async function fetchOverpassElements(
  areaKeys: string[],
  placeTypes: string[],
): Promise<unknown[]> {
  const query = buildOverpassQuery(areaKeys, placeTypes);
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
          signal: AbortSignal.timeout(40000),
        });
        if (!response.ok) {
          lastError = `Overpass ${response.status} from ${endpoint}`;
          continue;
        }
        const payload = (await response.json()) as { elements?: unknown[] };
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
