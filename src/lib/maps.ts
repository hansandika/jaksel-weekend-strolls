/**
 * Official Google Maps URLs only (`maps/search/?api=1`).
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
