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
