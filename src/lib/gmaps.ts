import type { Candidate } from "./candidate-types";

export type GooglePlaceMeta = {
  google: boolean;
  placeUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  priceRange: string | null;
};

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function rawGoogle(candidate: Candidate): Record<string, unknown> {
  const raw = candidate.raw?.google_maps;
  if (!raw || typeof raw !== "object") return {};
  return raw as Record<string, unknown>;
}

export function googlePlaceMeta(candidate: Candidate): GooglePlaceMeta {
  const raw = rawGoogle(candidate);
  const placeUrl = asText(candidate.gmaps_place_url) ?? asText(raw.place_url);
  const rating = asNumber(candidate.rating) ?? asNumber(raw.rating);
  const reviewCount = asNumber(candidate.review_count) ?? asNumber(raw.review_count);
  const priceRange = asText(candidate.price_range) ?? asText(raw.price_range);
  return {
    google:
      candidate.source === "google_maps" ||
      Boolean(asText(candidate.gmaps_ftid)) ||
      Boolean(asText(raw.ftid)),
    placeUrl,
    rating,
    reviewCount: reviewCount == null ? null : Math.round(reviewCount),
    priceRange,
  };
}

export function formatPlaceFacts(meta: {
  rating?: number | null;
  reviewCount?: number | null;
  priceRange?: string | null;
}): string | null {
  const bits: string[] = [];
  if (typeof meta.rating === "number") {
    const reviews =
      typeof meta.reviewCount === "number" ? ` · ${meta.reviewCount}` : "";
    bits.push(`★ ${meta.rating.toFixed(1)}${reviews}`);
  }
  if (meta.priceRange) bits.push(meta.priceRange);
  return bits.length > 0 ? bits.join(" · ") : null;
}
