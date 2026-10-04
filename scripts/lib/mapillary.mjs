const GRAPH = "https://graph.mapillary.com";

export function mapillaryToken() {
  return (process.env.MAPILLARY_ACCESS_TOKEN || "").trim();
}

export function photoPath(imageId) {
  return `/api/mapillary/${imageId}`;
}

export async function nearestMapillaryImages(
  lat,
  lng,
  { limit = 3, radius = 50 } = {},
  attempt = 0,
) {
  const token = mapillaryToken();
  if (!token) return [];
  const params = new URLSearchParams({
    fields: "id,thumb_256_url,thumb_1024_url,captured_at,compass_angle",
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
    limit: String(limit),
  });
  let response;
  try {
    response = await fetch(`${GRAPH}/images?${params}`, {
      headers: { Authorization: `OAuth ${token}` },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return [];
  }
  if (!response.ok) {
    if (response.status === 429 && attempt < 1) {
      await sleep(1500);
      return nearestMapillaryImages(lat, lng, { limit, radius }, attempt + 1);
    }
    return [];
  }
  const payload = await response.json();
  const data = Array.isArray(payload.data) ? payload.data : [];
  return data
    .filter((item) => item?.id)
    .map((item) => ({
      image_id: String(item.id),
      captured_at: item.captured_at,
      compass_angle: item.compass_angle,
    }));
}

export async function mapillaryThumbUrl(imageId, size = 1024) {
  const token = mapillaryToken();
  if (!token) return null;
  const field = size <= 256 ? "thumb_256_url" : "thumb_1024_url";
  let response;
  try {
    response = await fetch(`${GRAPH}/${imageId}?fields=${field}`, {
      headers: { Authorization: `OAuth ${token}` },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return null;
  }
  if (!response.ok) return null;
  const payload = await response.json();
  return typeof payload[field] === "string" ? payload[field] : null;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
