export type AreaDef = {
  key: string;
  label: string;
  /** south, west, north, east */
  bbox: [number, number, number, number];
  outOfJaksel?: boolean;
};

export const AREAS: Record<string, AreaDef> = {
  blok_m: {
    key: "blok_m",
    label: "Blok M / Melawai",
    bbox: [-6.252, 106.795, -6.235, 106.812],
  },
  cipete: {
    key: "cipete",
    label: "Cipete / Kemang",
    bbox: [-6.285, 106.793, -6.252, 106.825],
  },
  tebet: {
    key: "tebet",
    label: "Tebet",
    bbox: [-6.242, 106.838, -6.215, 106.868],
  },
  fatmawati_pi: {
    key: "fatmawati_pi",
    label: "Fatmawati / Pondok Indah",
    bbox: [-6.302, 106.768, -6.255, 106.808],
  },
  scbd_senopati: {
    key: "scbd_senopati",
    label: "SCBD / Senopati",
    bbox: [-6.234, 106.802, -6.218, 106.821],
  },
  alam_sutera: {
    key: "alam_sutera",
    label: "Alam Sutera",
    bbox: [-6.258, 106.638, -6.222, 106.672],
    outOfJaksel: true,
  },
};

export const DEFAULT_AREA_KEYS = [
  "blok_m",
  "cipete",
  "tebet",
  "fatmawati_pi",
  "scbd_senopati",
] as const;
export const ALL_AREA_KEYS = Object.keys(AREAS);

export const PLACE_TYPE_KEYS = [
  "cafe",
  "restaurant",
  "fast_food",
  "bakery",
  "ice_cream",
  "bar",
  "mall",
  "marketplace",
  "attraction",
] as const;
export type PlaceTypeKey = (typeof PLACE_TYPE_KEYS)[number];
export const DEFAULT_PLACE_TYPES: PlaceTypeKey[] = [
  "cafe",
  "restaurant",
  "fast_food",
  "bakery",
  "ice_cream",
  "bar",
  "mall",
  "marketplace",
];

export function resolveAreas(keys: unknown): AreaDef[] {
  const requested = Array.isArray(keys) && keys.length > 0
    ? keys.map(String)
    : [...DEFAULT_AREA_KEYS];
  const unique = [...new Set(requested)];
  const resolved = unique
    .map((key) => AREAS[key])
    .filter((area): area is AreaDef => Boolean(area));
  return resolved.length > 0
    ? resolved
    : DEFAULT_AREA_KEYS.map((key) => AREAS[key]);
}

export function resolvePlaceTypes(types: unknown): PlaceTypeKey[] {
  const requested = Array.isArray(types) && types.length > 0
    ? types.map(String)
    : [...DEFAULT_PLACE_TYPES];
  const allowed = new Set<string>(PLACE_TYPE_KEYS);
  const unique = [...new Set(requested)].filter((type): type is PlaceTypeKey =>
    allowed.has(type)
  );
  return unique.length > 0 ? unique : [...DEFAULT_PLACE_TYPES];
}

export function areaForPoint(
  lat: number,
  lng: number,
  areas: AreaDef[],
): AreaDef | null {
  for (const area of areas) {
    const [south, west, north, east] = area.bbox;
    if (lat >= south && lat <= north && lng >= west && lng <= east) {
      return area;
    }
  }
  return null;
}
