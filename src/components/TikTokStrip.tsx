"use client";

import { useEffect, useRef, useState } from "react";
import { isPlayableTikTokUrl, parseTikTokVideo } from "@/lib/tiktok";
import { TikTokPlayer } from "./TikTokPlayer";

export function PlayGlyph() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium tracking-wide text-cream/90">
      <svg
        width="9"
        height="10"
        viewBox="0 0 9 10"
        fill="currentColor"
        aria-hidden
      >
        <path d="M8.2 4.13a1 1 0 0 1 0 1.74L1.7 9.64A1 1 0 0 1 .2 8.77V1.23A1 1 0 0 1 1.7.36l6.5 3.77Z" />
      </svg>
      TikTok
    </span>
  );
}

export function TikTokStrip({
  urls,
  tones,
  photos,
}: {
  urls: string[];
  tones: string[];
  photos?: Array<string | null>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [autoplayOk, setAutoplayOk] = useState(true);
  const tiles = urls.slice(0, 3);
  const firstPlayable = tiles.findIndex(isPlayableTikTokUrl);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setAutoplayOk(!media.matches);
    syncMotion();
    media.addEventListener("change", syncMotion);
    return () => media.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.55 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="grid grid-cols-3 overflow-hidden rounded-t-[20px]"
    >
      {tiles.map((url, index) => {
        const photo = photos?.[index] ?? null;
        const parsed = parseTikTokVideo(url);
        const playHere =
          index === firstPlayable &&
          Boolean(parsed) &&
          inView &&
          autoplayOk;

        if (playHere && parsed) {
          return (
            <div
              key={url}
              className="relative h-[96px] overflow-hidden bg-[#111]"
            >
              <TikTokPlayer
                videoId={parsed.videoId}
                handle={parsed.handle}
                autoplay
                compact
                className="h-full w-full border-0"
              />
            </div>
          );
        }

        return (
          <div
            key={url}
            className="relative flex h-[96px] items-center justify-center overflow-hidden"
            style={{ background: tones[index] ?? tones[0] ?? "#3a2f2c" }}
          >
            {photo ? (
              // Street-level still from Mapillary; gradient fallback if the proxy 404s.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <span className="absolute inset-0 bg-[#1a1614]/35" />
            <span className="relative">
              <PlayGlyph />
            </span>
          </div>
        );
      })}
    </div>
  );
}
