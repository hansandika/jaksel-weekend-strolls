import type { Combo, Stop } from "./types";

const EARTH_KM = 6371;
const WALK_KMH = 4.5;

export type WalkGap = {
  km: number;
  minutes: number;
  label: string;
};

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function hasCoords(
  stop: Pick<Stop, "lat" | "lng">,
): stop is Stop & { lat: number; lng: number } {
  return (
    typeof stop.lat === "number" &&
    Number.isFinite(stop.lat) &&
    typeof stop.lng === "number" &&
    Number.isFinite(stop.lng)
  );
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function walkMinutesForKm(km: number): number {
  if (km <= 0) return 0;
  return Math.max(1, Math.round((km / WALK_KMH) * 60));
}

export function formatKm(km: number): string {
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function formatWalkGap(km: number): WalkGap {
  const minutes = walkMinutesForKm(km);
  return {
    km,
    minutes,
    label: `~${minutes} min walk · ${formatKm(km)}`,
  };
}

export function walkGapBetween(from: Stop, to: Stop): WalkGap | null {
  if (!hasCoords(from) || !hasCoords(to)) return null;
  const km = haversineKm(from.lat, from.lng, to.lat, to.lng);
  if (km < 0.03) return null;
  return formatWalkGap(km);
}

export function comboWalkTotal(stops: Stop[]): {
  minutes: number;
  km: number;
  gaps: Array<WalkGap | null>;
} {
  const gaps: Array<WalkGap | null> = [];
  let km = 0;
  let minutes = 0;
  for (let index = 0; index < stops.length - 1; index += 1) {
    const gap = walkGapBetween(stops[index], stops[index + 1]);
    gaps.push(gap);
    if (gap) {
      km += gap.km;
      minutes += gap.minutes;
    }
  }
  return { minutes, km, gaps };
}

export function comboDayMath(combo: Combo): {
  stopCount: number;
  walkMinutes: number;
  walkKm: number;
  format: string;
  line: string;
} {
  const { minutes, km } = comboWalkTotal(combo.stops);
  const stopCount = combo.stops.length;
  const format = combo.format;
  const parts = [`${stopCount} stop${stopCount === 1 ? "" : "s"}`];
  if (minutes > 0) parts.push(`~${minutes} min walk`);
  parts.push(format);
  return {
    stopCount,
    walkMinutes: minutes,
    walkKm: km,
    format,
    line: parts.join(" · "),
  };
}
