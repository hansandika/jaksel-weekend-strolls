import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Combo, WeekendPack } from "./types";

const LIVE_PACK_PATH = join(process.cwd(), "content/packs/2026-W38.json");

export function getLivePack(): WeekendPack {
  const pack = JSON.parse(readFileSync(LIVE_PACK_PATH, "utf8")) as WeekendPack;
  if (pack.status !== "live") {
    throw new Error(`Expected live pack at ${LIVE_PACK_PATH}`);
  }
  return pack;
}

export function getCombo(id: string): Combo | undefined {
  return getLivePack().combos.find((combo) => combo.id === id);
}

export function formatComboMeta(combo: Combo): string {
  return `${combo.vibe} · ${combo.duration} · ${combo.area} · ${combo.budget}`;
}
