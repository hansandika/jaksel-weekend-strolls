import { cache } from "react";
import { assembleLivePack } from "./assemble-pack";
import { isPlayableTikTokUrl } from "./tiktok";
import type { Combo, WeekendPack } from "./types";

export const getLivePack = cache(async (): Promise<WeekendPack> => {
  return assembleLivePack();
});

export async function getCombo(id: string): Promise<Combo | undefined> {
  const pack = await getLivePack();
  return pack.combos.find((combo) => combo.id === id);
}

export function formatComboMeta(combo: Combo): string {
  return `${combo.vibe} · ${combo.duration} · ${combo.area} · ${combo.budget}`;
}

export const DAY_TRIP_LABEL = "Day Trip · Outside Jaksel";

export function isDayTrip(combo: Combo): boolean {
  return combo.tags.includes("out-of-jaksel");
}

export function getHubCombos(pack: WeekendPack): Combo[] {
  const weekend = pack.combos.filter((combo) => !isDayTrip(combo));
  if (pack.featuredIds.length === 0) return weekend.slice(0, 4);
  return pack.featuredIds
    .map((id) => pack.combos.find((combo) => combo.id === id))
    .filter((combo): combo is Combo => Boolean(combo))
    .filter((combo) => !isDayTrip(combo));
}

export function getDayTrips(pack: WeekendPack): Combo[] {
  const featured = new Set(getHubCombos(pack).map((combo) => combo.id));
  return pack.combos.filter((combo) => isDayTrip(combo) && !featured.has(combo.id));
}

export function getComboCardPhotos(combo: Combo): Array<string | null> {
  return [0, 1, 2].map(
    (index) => combo.stops[index]?.photoUrl ?? combo.stops[0]?.photoUrl ?? null,
  );
}

export function getComboTikTokSlides(combo: Combo): {
  urls: string[];
  photos: Array<string | null>;
} {
  const seen = new Set<string>();
  const urls: string[] = [];
  const photos: Array<string | null> = [];

  for (const stop of combo.stops) {
    if (
      !stop.tiktokUrl ||
      !isPlayableTikTokUrl(stop.tiktokUrl) ||
      seen.has(stop.tiktokUrl)
    ) {
      continue;
    }
    seen.add(stop.tiktokUrl);
    urls.push(stop.tiktokUrl);
    photos.push(stop.photoUrl);
  }

  for (const url of combo.tiktokUrls) {
    if (!isPlayableTikTokUrl(url) || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
    photos.push(null);
  }

  return { urls, photos };
}
