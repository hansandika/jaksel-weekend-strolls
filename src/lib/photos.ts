import { readFileSync } from "node:fs";
import { join } from "node:path";

export type StopPhoto = {
  imageId: string;
  photoUrl: string;
  candidateName?: string;
};

type PhotosFile = {
  updatedAt: string | null;
  byStopName: Record<string, StopPhoto>;
};

const PHOTOS_PATH = join(process.cwd(), "content/photos.json");

export function getStopPhotos(): PhotosFile {
  try {
    return JSON.parse(readFileSync(PHOTOS_PATH, "utf8")) as PhotosFile;
  } catch {
    return { updatedAt: null, byStopName: {} };
  }
}

export function photoForStop(name: string): StopPhoto | null {
  const photos = getStopPhotos().byStopName;
  if (photos[name]) return photos[name];
  const needle = normalizeName(name);
  for (const [key, value] of Object.entries(photos)) {
    if (normalizeName(key) === needle) return value;
  }
  return null;
}

export function comboStopPhotoUrls(stopNames: string[]): Array<string | null> {
  const photos = getStopPhotos().byStopName;
  return stopNames.map((name) => {
    if (photos[name]?.photoUrl) return photos[name].photoUrl;
    const needle = normalizeName(name);
    for (const [key, value] of Object.entries(photos)) {
      if (normalizeName(key) === needle) return value.photoUrl;
    }
    return null;
  });
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}
