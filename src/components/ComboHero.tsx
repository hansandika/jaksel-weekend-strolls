"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { isPlayableTikTokUrl, parseTikTokVideo } from "@/lib/tiktok";
import { TikTokPlayer } from "./TikTokPlayer";

export function ComboHero({
  photoUrl,
  tone,
  tiktokUrl,
  children,
}: {
  photoUrl: string | null;
  tone: string;
  tiktokUrl?: string | null;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [autoplayOk, setAutoplayOk] = useState(true);
  const parsed = tiktokUrl && isPlayableTikTokUrl(tiktokUrl)
    ? parseTikTokVideo(tiktokUrl)
    : null;

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
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative h-[184px] overflow-hidden bg-[#1f1b19]"
      style={{ background: tone }}
    >
      {photoUrl ? (
        // Mapillary still — local proxy, not Google photo CDN.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <span className="absolute inset-0 bg-gradient-to-t from-[#1a1614] via-[#1a1614]/55 to-transparent" />

      {parsed && inView && autoplayOk ? (
        <div className="absolute right-2.5 top-2.5 z-20 h-[88px] w-[50px] overflow-hidden rounded-[10px] border border-cream/15 bg-[#111] shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          <TikTokPlayer
            videoId={parsed.videoId}
            handle={parsed.handle}
            watchUrl={parsed.url}
            autoplay
            compact
            className="h-full w-full"
          />
        </div>
      ) : parsed ? (
        <a
          href={parsed.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open @${parsed.handle} on TikTok`}
          className="absolute right-2.5 top-2.5 z-20 flex h-[88px] w-[50px] items-center justify-center rounded-[10px] border border-cream/15 bg-[#111]/70"
        >
          <span className="text-[10px] font-medium tracking-wide text-cream/90">
            ▶︎
          </span>
        </a>
      ) : null}

      <div
        className={`absolute inset-x-0 bottom-0 z-10 px-3.5 pb-3 pt-8 ${
          parsed ? "pr-[68px]" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}
