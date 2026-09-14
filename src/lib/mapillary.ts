const GRAPH = "https://graph.mapillary.com";
const LOOKUP_TIMEOUT_MS = 8000;

export const MAPILLARY_TOKEN_MISSING =
  "MAPILLARY_ACCESS_TOKEN is not set. The parent Cloud Agent environment must inject it (listed in CLOUD_AGENT_INJECTED_SECRET_NAMES). Set the same name as a Supabase Edge Function secret for candidates. Photo lookup will not run until then.";

export function mapillaryAccessToken(): string {
  return (process.env.MAPILLARY_ACCESS_TOKEN ?? "").trim();
}

export function mapillaryConfigured(): boolean {
  return Boolean(mapillaryAccessToken());
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
  const token = mapillaryAccessToken();
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
    signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
  });
  if (response.status === 429) return null;
  if (!response.ok) return null;
  const payload = (await response.json()) as {
    data?: Array<{ id?: string; captured_at?: string | number; compass_angle?: number }>;
  };
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
