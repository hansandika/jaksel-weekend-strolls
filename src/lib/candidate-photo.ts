import type { Candidate } from "./candidate-types";

const RAW_PHOTO_KEYS = ["photo_url", "wikimedia_url", "image_url", "commons_url"];

function httpUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
  return null;
}

export function candidatePhotoSrc(candidate: Candidate): string | null {
  if (candidate.photo_url) return candidate.photo_url;
  for (const url of candidate.photo_urls ?? []) {
    const photo = httpUrl(url);
    if (photo) return photo;
  }
  const raw = candidate.raw;
  if (raw) {
    for (const key of RAW_PHOTO_KEYS) {
      const photo = httpUrl(raw[key]);
      if (photo) return photo;
    }
  }
  const imageId = candidate.mapillary?.image_id;
  if (imageId) return `/api/mapillary/${imageId}`;
  return null;
}

export function candidatePhotoCredit(candidate: Candidate): string | null {
  const credit = candidate.raw?.photo_credit;
  if (typeof credit !== "string") return null;
  const trimmed = credit.trim();
  return trimmed || null;
}
