export const DISCOVERY_AREAS = [
  {
    key: "blok_m",
    label: "Blok M / Melawai",
    defaultOn: true,
    outOfJaksel: false,
    bbox: [-6.252, 106.795, -6.235, 106.812] as [number, number, number, number],
  },
  {
    key: "cipete",
    label: "Cipete / Kemang",
    defaultOn: true,
    outOfJaksel: false,
    bbox: [-6.285, 106.793, -6.252, 106.825] as [number, number, number, number],
  },
  {
    key: "tebet",
    label: "Tebet",
    defaultOn: false,
    outOfJaksel: false,
    bbox: [-6.242, 106.838, -6.215, 106.868] as [number, number, number, number],
  },
  {
    key: "fatmawati_pi",
    label: "Fatmawati / Pondok Indah",
    defaultOn: false,
    outOfJaksel: false,
    bbox: [-6.302, 106.768, -6.255, 106.808] as [number, number, number, number],
  },
  {
    key: "alam_sutera",
    label: "Alam Sutera",
    defaultOn: false,
    outOfJaksel: true,
    bbox: [-6.258, 106.638, -6.222, 106.672] as [number, number, number, number],
  },
] as const;

export const DISCOVERY_PLACE_TYPES = [
  { key: "cafe", label: "Café" },
  { key: "restaurant", label: "Restaurant" },
  { key: "fast_food", label: "Fast food" },
  { key: "mall", label: "Mall" },
] as const;
