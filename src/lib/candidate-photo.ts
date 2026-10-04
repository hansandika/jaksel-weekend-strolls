import type { Candidate } from "./candidate-types";

export function candidatePhotoSrc(candidate: Candidate): string | null {
  if (candidate.photo_url) return candidate.photo_url;
  const imageId = candidate.mapillary?.image_id;
  if (imageId) return `/api/mapillary/${imageId}`;
  return null;
}
