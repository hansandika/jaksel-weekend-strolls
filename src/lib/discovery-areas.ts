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
    defaultOn: true,
    outOfJaksel: false,
    bbox: [-6.242, 106.838, -6.215, 106.868] as [number, number, number, number],
  },
  {
    key: "fatmawati_pi",
    label: "Fatmawati / Pondok Indah",
    defaultOn: true,
    outOfJaksel: false,
    bbox: [-6.302, 106.768, -6.255, 106.808] as [number, number, number, number],
  },
  {
    key: "scbd_senopati",
    label: "SCBD / Senopati",
    defaultOn: true,
    outOfJaksel: false,
    bbox: [-6.234, 106.802, -6.218, 106.821] as [number, number, number, number],
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
  { key: "cafe", label: "Café", defaultOn: true },
  { key: "restaurant", label: "Restaurant", defaultOn: true },
  { key: "fast_food", label: "Fast food", defaultOn: true },
  { key: "bakery", label: "Bakery", defaultOn: true },
  { key: "ice_cream", label: "Ice cream", defaultOn: true },
  { key: "bar", label: "Bar (soft stop)", defaultOn: true },
  { key: "mall", label: "Mall", defaultOn: true },
  { key: "marketplace", label: "Marketplace", defaultOn: true },
  { key: "attraction", label: "Attraction", defaultOn: false },
] as const;
