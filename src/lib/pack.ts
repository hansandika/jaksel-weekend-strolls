import { assembleLivePack } from "./assemble-pack";
import type { Combo, WeekendPack } from "./types";

export async function getLivePack(): Promise<WeekendPack> {
  return assembleLivePack();
}

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
