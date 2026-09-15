import { listAllCandidates } from "./admin-api";
import { candidatePhotoSrc } from "./candidate-photo";
import type { Candidate } from "./candidate-types";
import { isoWeekParts } from "./iso-week";
import { googleMapsSearchUrl } from "./maps";
import { isPlayableTikTokUrl } from "./tiktok";
import type { Combo, Stop, WeekendPack } from "./types";

const POSTER_TONES = [
  ["#5A3A2C", "#3A4A55", "#6E4E3A", "#4A342C"],
  ["#3F322C", "#45535A", "#5C4638", "#4A3C34"],
  ["#3A2F2C", "#2F3F48", "#5A463C", "#3E4F57"],
  ["#4A342C", "#3E4F57", "#6B5344", "#524038"],
  ["#46352F", "#3A464C", "#5E4A3C", "#2F3A40"],
];

const GENERIC_NAME =
  /^(kfc|mcdonald'?s|starbucks|pizza hut|kopi kenangan|flash coffee|fore coffee|tomoro coffee|janji jiwa|mixue|hokben|old town white coffee|point coffee|maxx coffee|cotti coffee)$/i;

const CAFE_TYPES = new Set(["cafe", "bakery", "ice_cream"]);
const FOOD_TYPES = new Set(["restaurant", "fast_food", "bar"]);
const MALL_TYPES = new Set(["mall", "marketplace"]);

type AreaRecipe = {
  key: string;
  comboId: string;
  title: string;
  subtitle: string;
  vibe: string;
  duration: string;
  areaLabel: string;
  budget: string;
  tags: string[];
  prefer: "food" | "cafe" | "mix";
  tip: string;
  rainNotes: string;
};

const AREA_RECIPES: AreaRecipe[] = [
  {
    key: "blok_m",
    comboId: "blok-m-food",
    title: "Blok M food cluster",
    subtitle: "Higher-energy Sat walk — ramen, bagel, kopi, Pasaraya",
    vibe: "Food walk",
    duration: "~4h",
    areaLabel: "Blok M / Melawai",
    budget: "Rp120-220k",
    tags: ["viral-food", "MRT", "queue-ok"],
    prefer: "food",
    tip: "Ride MRT to Blok M. Do the ramen stop before the mall pulse, then land on kopi.",
    rainNotes: "Pasaraya and Melawai shophouses are mostly covered. Skip street hops if Melawai ponds.",
  },
  {
    key: "cipete",
    comboId: "cipete-cafes",
    title: "Cipete café soft",
    subtitle: "Sunday recovery — long tables, MRT view, TUKU to-go",
    vibe: "Café soft",
    duration: "~3.5h",
    areaLabel: "Cipete / Kemang",
    budget: "Rp100-180k",
    tags: ["slow", "latte", "plugs"],
    prefer: "cafe",
    tip: "One drink per stop. Start at Dua or Titik Temu while Cipete Raya is still quiet.",
    rainNotes: "Grab between Cipete Raya shops if the street is ponding. Indoor seats fill first.",
  },
  {
    key: "tebet",
    comboId: "tebet-stroll",
    title: "Tebet food stroll",
    subtitle: "Food street + shabu + a café buffer on the east side",
    vibe: "Neighbourhood",
    duration: "~3.5h",
    areaLabel: "Tebet",
    budget: "Rp90-180k",
    tags: ["local", "walkable", "casual"],
    prefer: "mix",
    tip: "Park once near Tebet Timur. Food street first, then a sit-down if the heat spikes.",
    rainNotes: "Covered food-street awnings help. Jump to an indoor café if the canal path floods.",
  },
  {
    key: "scbd_senopati",
    comboId: "scbd-senopati-light",
    title: "SCBD / Senopati light",
    subtitle: "Kitsuné at Ashta, Anomali, a proper lunch, then out",
    vibe: "Soft polish",
    duration: "~3h",
    areaLabel: "SCBD / Senopati",
    budget: "Rp150-280k",
    tags: ["AC", "new-coffee", "one-grab"],
    prefer: "mix",
    tip: "Do Ashta first so Senopati lunch is a landing, not a second queue.",
    rainNotes: "Ashta is fully covered. Grab the one street crossing to Senopati if it sheets rain.",
  },
  {
    key: "fatmawati_pi",
    comboId: "pi-indoor",
    title: "PI indoor loop",
    subtitle: "Covered mall, kopi, a gallery bite — rain-proof Jaksel",
    vibe: "Indoor",
    duration: "~3.5h",
    areaLabel: "Pondok Indah",
    budget: "Rp120-220k",
    tags: ["AC", "covered", "mall"],
    prefer: "mix",
    tip: "Park once at PIM. Stay inside the skybridge loop; do not add a Cipete hop.",
    rainNotes: "Built for rain. If parking is jammed, drop at the basement and stay inside.",
  },
];

function hasLatLng(candidate: Candidate): boolean {
  return (
    typeof candidate.lat === "number" &&
    Number.isFinite(candidate.lat) &&
    typeof candidate.lng === "number" &&
    Number.isFinite(candidate.lng)
  );
}

function photoFor(candidate: Candidate): string | null {
  if (process.env.GOOGLE_MAPS_API_KEY?.trim()) {
    const places =
      typeof candidate.raw?.google_photo_url === "string"
        ? candidate.raw.google_photo_url
        : null;
    if (places) return places;
  }
  return candidatePhotoSrc(candidate);
}

function realTikTok(candidate: Candidate): string | null {
  for (const url of candidate.tiktok_urls ?? []) {
    if (isPlayableTikTokUrl(url)) return url;
  }
  return null;
}

function isGenericChain(name: string): boolean {
  return GENERIC_NAME.test(name.trim());
}

function bucket(candidate: Candidate): "cafe" | "food" | "mall" | "other" {
  const types = candidate.place_types ?? [];
  if (types.some((type) => MALL_TYPES.has(type))) return "mall";
  if (types.some((type) => FOOD_TYPES.has(type))) return "food";
  if (types.some((type) => CAFE_TYPES.has(type))) return "cafe";
  return "other";
}

function roleFor(candidate: Candidate): string {
  const kind = bucket(candidate);
  if (kind === "mall") return "stroll";
  if (kind === "food") return "eat";
  if (candidate.place_types?.includes("bakery") || candidate.place_types?.includes("ice_cream")) {
    return "dessert";
  }
  if (kind === "cafe") return "cafe";
  return "stop";
}

function score(candidate: Candidate, prefer: AreaRecipe["prefer"]): number {
  let value = 0;
  if (realTikTok(candidate)) value += 80;
  if (photoFor(candidate)) value += 12;
  if (!isGenericChain(candidate.name)) value += 24;
  const kind = bucket(candidate);
  if (prefer === "food") {
    if (kind === "food") value += 16;
    if (kind === "cafe") value += 8;
    if (kind === "mall") value += 10;
  } else if (prefer === "cafe") {
    if (kind === "cafe") value += 16;
    if (kind === "mall") value += 6;
    if (kind === "food") value += 4;
  } else {
    if (kind === "cafe" || kind === "food") value += 10;
    if (kind === "mall") value += 8;
  }
  if (candidate.draft_why) value += 4;
  return value;
}

function eligible(candidate: Candidate): boolean {
  if (candidate.status === "rejected") return false;
  if (candidate.area_key === "alam_sutera") return false;
  if (candidate.tags?.includes("out-of-jaksel")) return false;
  if (!hasLatLng(candidate)) return false;
  if (!photoFor(candidate)) return false;
  return true;
}

function pickMix(pool: Candidate[], prefer: AreaRecipe["prefer"]): Candidate[] {
  const ranked = [...pool].sort((a, b) => score(b, prefer) - score(a, prefer));
  const picked: Candidate[] = [];
  const usedNames = new Set<string>();
  const counts = { cafe: 0, food: 0, mall: 0, other: 0 };

  const tryAdd = (candidate: Candidate) => {
    const key = candidate.name.trim().toLowerCase();
    if (usedNames.has(key)) return false;
    if (picked.length >= 4) return false;
    usedNames.add(key);
    picked.push(candidate);
    counts[bucket(candidate)] += 1;
    return true;
  };

  const withTikTok = ranked.filter((item) => realTikTok(item));
  const without = ranked.filter((item) => !realTikTok(item));

  for (const candidate of withTikTok) {
    if (picked.length >= 4) break;
    tryAdd(candidate);
  }

  if (picked.length < 3) {
    for (const candidate of without) {
      if (picked.length >= 3) break;
      const kind = bucket(candidate);
      if (prefer === "cafe" && kind === "food" && counts.cafe === 0) continue;
      tryAdd(candidate);
    }
  }

  if (picked.length < 3) {
    for (const candidate of ranked) {
      if (picked.length >= 3) break;
      tryAdd(candidate);
    }
  }

  if (prefer === "food" && counts.food === 0) {
    const extra = ranked.find((item) => bucket(item) === "food" && !picked.includes(item));
    if (extra && picked.length < 4) tryAdd(extra);
  }
  if (prefer === "cafe" && counts.cafe === 0) {
    const extra = ranked.find((item) => bucket(item) === "cafe" && !picked.includes(item));
    if (extra && picked.length < 4) tryAdd(extra);
  }

  return picked.slice(0, 4);
}

function toStop(candidate: Candidate): Stop | null {
  const maps = googleMapsSearchUrl({
    name: candidate.name,
    area: candidate.area_label,
    lat: candidate.lat,
    lng: candidate.lng,
  });
  const photoUrl = photoFor(candidate);
  if (!photoUrl && !maps) return null;
  const tiktokUrl = realTikTok(candidate);
  const note =
    candidate.draft_why?.trim() ||
    candidate.draft_tip?.trim() ||
    `${candidate.area_label ?? "Jaksel"} · ${candidate.place_types.join(" / ") || "stroll stop"}`;
  return {
    candidateId: candidate.id,
    name: candidate.name,
    area: candidate.area_label ?? "Jaksel",
    role: roleFor(candidate),
    note,
    lat: candidate.lat,
    lng: candidate.lng,
    googleMapsUrl: maps,
    photoUrl,
    tiktokUrl,
  };
}

function comboFromRecipe(
  recipe: AreaRecipe,
  candidates: Candidate[],
  toneIndex: number,
): Combo | null {
  const pool = candidates.filter((item) => item.area_key === recipe.key && eligible(item));
  const chosen = pickMix(pool, recipe.prefer);
  const stops = chosen
    .map(toStop)
    .filter((stop): stop is Stop => Boolean(stop));
  if (stops.length < 3) return null;
  const tiktokUrls = stops
    .map((stop) => stop.tiktokUrl)
    .filter((url): url is string => Boolean(url));
  return {
    id: recipe.comboId,
    title: recipe.title,
    subtitle: recipe.subtitle,
    vibe: recipe.vibe,
    duration: recipe.duration,
    area: recipe.areaLabel,
    budget: recipe.budget,
    tags: recipe.tags,
    tiktokUrls,
    posterTones: POSTER_TONES[toneIndex % POSTER_TONES.length],
    stops,
    tip: recipe.tip,
    rainNotes: recipe.rainNotes,
  };
}

export async function assembleLivePack(): Promise<WeekendPack> {
  const week = isoWeekParts();
  const candidates = await listAllCandidates();
  const combos = AREA_RECIPES.map((recipe, index) =>
    comboFromRecipe(recipe, candidates, index),
  ).filter((combo): combo is Combo => Boolean(combo));

  const sat =
    combos.find((combo) => combo.id === "blok-m-food") ??
    combos.find((combo) => combo.vibe.toLowerCase().includes("food")) ??
    combos[0];
  const sun =
    combos.find((combo) => combo.id === "cipete-cafes" && combo.id !== sat?.id) ??
    combos.find((combo) => combo.id !== sat?.id) ??
    sat;

  return {
    isoWeek: week.isoWeek,
    weekLabel: week.weekLabel,
    status: "live",
    brand: "Jaksel",
    title: "Weekend Strolls",
    tagline: "Live combos from the Candidate Queue.",
    event: {
      name: "Auto-published from OSM",
      endsOn: week.isoWeek,
      endsLabel: `${week.weekLabel} · no approve gate`,
      note: "Geofabrik / HOT / Overpass · Mapillary stills",
      kind: "live",
    },
    askPlaceholder: "ask for a card — coming later",
    askChips: ["places in Blok M", "Cipete cafés", "Tebet stroll"],
    askHint: "AI drafts later. Public hub auto-assembles from the queue.",
    pairing: {
      satComboId: sat?.id ?? "",
      sunComboId: sun?.id ?? "",
      satLabel: sat ? `Sat · ${sat.title}` : "Sat",
      sunLabel: sun ? `Sun · ${sun.title}` : "Sun",
      label: sat && sun ? `Sat → ${sat.title} · Sun → ${sun.title}` : "",
    },
    combos,
  };
}
