const PLACEHOLDER_HANDLE = /jaksel\.strolls/i;
const PLACEHOLDER_VIDEO = /^7380{8,}/;

export type TikTokVideoRef = {
  url: string;
  handle: string;
  videoId: string;
};

function safeUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/**
 * Real TikTok watch URLs look like tiktok.com/@user/video/{id}.
 * Pack placeholders use @jaksel.strolls and a 738000… id — those stay posters.
 */
export function parseTikTokVideo(url: string): TikTokVideoRef | null {
  const parsed = safeUrl(url);
  if (!parsed) return null;
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  if (host !== "tiktok.com" && host !== "vm.tiktok.com") return null;
  const match = parsed.pathname.match(/\/@([^/]+)\/video\/(\d{15,})\/?$/);
  if (!match) return null;
  return { url, handle: match[1], videoId: match[2] };
}

export function isPlayableTikTokUrl(url: string): boolean {
  const parsed = parseTikTokVideo(url);
  if (!parsed) return false;
  if (PLACEHOLDER_HANDLE.test(parsed.handle) && PLACEHOLDER_VIDEO.test(parsed.videoId)) {
    return false;
  }
  return true;
}

export function tiktokEmbedSrc(
  videoId: string,
  options: { autoplay?: boolean; muted?: boolean } = {},
): string {
  const autoplay = Boolean(options.autoplay);
  const muted = options.muted ?? autoplay;
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    muted: muted ? "1" : "0",
    music_info: "1",
    description: "1",
  });
  return `https://www.tiktok.com/player/v1/${encodeURIComponent(videoId)}?${params}`;
}

export const TIKTOK_IFRAME_ALLOW =
  "autoplay; encrypted-media; fullscreen; picture-in-picture";
