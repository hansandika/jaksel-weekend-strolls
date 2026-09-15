import type { Stop } from "./types";
import { hasCoords } from "./walk";

/**
 * Official Google Maps URLs only (`maps/search/?api=1`, `maps/dir/?api=1`).
 * Never scrape Maps HTML or unofficial endpoints.
 */
export function googleMapsSearchUrl(options: {
  name: string;
  area?: string | null;
  lat?: number | null;
  lng?: number | null;
}): string {
  const { name, area, lat, lng } = options;
  if (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  const query = [name.trim(), area?.trim()].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Walking directions for a combo. Origin = first coord stop, dest = last. */
export function googleMapsWalkingDirUrl(stops: Stop[]): string | null {
  const points = stops.filter(hasCoords);
  if (points.length === 0) {
    return stops[0]?.googleMapsUrl ?? null;
  }
  if (points.length === 1) {
    return googleMapsSearchUrl({
      name: points[0].name,
      area: points[0].area,
      lat: points[0].lat,
      lng: points[0].lng,
    });
  }
  const origin = `${points[0].lat},${points[0].lng}`;
  const destination = `${points[points.length - 1].lat},${points[points.length - 1].lng}`;
  const middle = points.slice(1, -1);
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "walking",
  });
  if (middle.length > 0) {
    params.set(
      "waypoints",
      middle.map((stop) => `${stop.lat},${stop.lng}`).join("|"),
    );
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
