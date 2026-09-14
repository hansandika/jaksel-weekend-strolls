export const DISCOVERY_AREAS = [
  {
    key: "blok_m",
    label: "Blok M / Melawai",
    outOfJaksel: false,
    bbox: [-6.252, 106.795, -6.235, 106.812],
  },
  {
    key: "cipete",
    label: "Cipete / Kemang",
    outOfJaksel: false,
    bbox: [-6.285, 106.793, -6.252, 106.825],
  },
  {
    key: "tebet",
    label: "Tebet",
    outOfJaksel: false,
    bbox: [-6.242, 106.838, -6.215, 106.868],
  },
  {
    key: "fatmawati_pi",
    label: "Fatmawati / Pondok Indah",
    outOfJaksel: false,
    bbox: [-6.302, 106.768, -6.255, 106.808],
  },
  {
    key: "alam_sutera",
    label: "Alam Sutera",
    outOfJaksel: true,
    bbox: [-6.258, 106.638, -6.222, 106.672],
  },
];

/** west, south, east, north — padded clip covering all discovery areas */
export const CLIP_BBOX = [106.63, -6.31, 106.875, -6.21];

export function areaForPoint(lat, lng) {
  for (const area of DISCOVERY_AREAS) {
    const [south, west, north, east] = area.bbox;
    if (lat >= south && lat <= north && lng >= west && lng <= east) {
      return area;
    }
  }
  return null;
}

export function inClipBbox(lat, lng) {
  const [west, south, east, north] = CLIP_BBOX;
  return lat >= south && lat <= north && lng >= west && lng <= east;
}
