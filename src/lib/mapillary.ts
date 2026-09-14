const GRAPH = "https://graph.mapillary.com";

export function mapillaryConfigured(): boolean {
  return Boolean(process.env.MAPILLARY_ACCESS_TOKEN);
}

export type MapillaryHit = {
  image_id: string;
  captured_at?: string | number;
  compass_angle?: number;
};

export async function nearestMapillary(
  lat: number,
  lng: number,
): Promise<MapillaryHit | null> {
  const token = process.env.MAPILLARY_ACCESS_TOKEN;
  if (!token) return null;
  const params = new URLSearchParams({
    fields: "id,captured_at,compass_angle",
    lat: String(lat),
    lng: String(lng),
    radius: "50",
    limit: "3",
  });
  const response = await fetch(`${GRAPH}/images?${params}`, {
    headers: { Authorization: `OAuth ${token}` },
    cache: "no-store",
  });
  if (response.status === 429) return null;
  if (!response.ok) return null;
  const payload = (await response.json()) as { data?: Array<{ id?: string; captured_at?: string | number; compass_angle?: number }> };
  const first = payload.data?.[0];
  if (!first?.id) return null;
  return {
    image_id: String(first.id),
    captured_at: first.captured_at,
    compass_angle: first.compass_angle,
  };
}

export function mapillaryPhotoPath(imageId: string): string {
  return `/api/mapillary/${imageId}`;
}
