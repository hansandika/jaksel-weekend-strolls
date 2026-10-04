"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isPlayableTikTokUrl, parseTikTokVideo } from "@/lib/tiktok";
import { PlayGlyph } from "./TikTokStrip";
import { TikTokPlayer } from "./TikTokPlayer";

export function TikTokCarousel({
  urls,
  tones,
  photos,
  size = "page",
}: {
  urls: string[];
  tones: string[];
  photos?: Array<string | null>;
  size?: "page" | "hub";
}) {
  const rootRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [autoplayOk, setAutoplayOk] = useState(true);
  const playable = urls.filter(isPlayableTikTokUrl);

  const syncActive = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const slides = Array.from(node.children) as HTMLElement[];
    if (slides.length === 0) return;
    const center = node.scrollLeft + node.clientWidth / 2;
    let closest = 0;
    let closestDist = Number.POSITIVE_INFINITY;
    slides.forEach((slide, index) => {
      const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
      const dist = Math.abs(slideCenter - center);
      if (dist < closestDist) {
        closestDist = dist;
        closest = index;
      }
    });
    setActive(closest);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setAutoplayOk(!media.matches);
    syncMotion();
    media.addEventListener("change", syncMotion);
    return () => media.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    syncActive();
    node.addEventListener("scroll", syncActive, { passive: true });
    return () => node.removeEventListener("scroll", syncActive);
  }, [syncActive, playable.length]);

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

  const goTo = (index: number) => {
    const node = scrollerRef.current;
    const slide = node?.children[index] as HTMLElement | undefined;
    if (!node || !slide) return;
    node.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  };

  if (playable.length === 0) {
    return null;
  }

  return (
    <section ref={rootRef} aria-label="TikTok proof">
      <div
        ref={scrollerRef}
        className={`tiktok-scroll flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain ${
          size === "page" ? "tiktok-scroll-page rounded-[16px]" : ""
        }`}
      >
        {playable.map((url, index) => (
          <CarouselSlide
            key={`${url}-${index}`}
            url={url}
            tone={tones[index] ?? tones[0] ?? "#3a2f2c"}
            photo={photos?.[index] ?? null}
            autoplay={index === active && autoplayOk && inView}
          />
        ))}
      </div>
      {playable.length > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-2.5">
          <div className="flex items-center gap-1">
            {playable.map((url, index) => (
              <button
                key={`${url}-dot-${index}`}
                type="button"
                aria-label={`TikTok ${index + 1} of ${playable.length}`}
                aria-current={index === active}
                onClick={() => goTo(index)}
                className="flex h-7 w-7 items-center justify-center"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    index === active ? "w-4 bg-coral" : "w-1.5 bg-cream/25"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-[11px] tabular-nums text-cream/45">
            {active + 1} / {playable.length}
          </p>
        </div>
      ) : null}
      <p className="mt-1 text-center text-[11px] text-cream/40">
        Tap the clip to open TikTok
      </p>
    </section>
  );
}

function CarouselSlide({
  url,
  tone,
  photo,
  autoplay,
}: {
  url: string;
  tone: string;
  photo: string | null;
  autoplay: boolean;
}) {
  const parsed = parseTikTokVideo(url);

  if (parsed && autoplay) {
    return (
      <TikTokPlayer
        videoId={parsed.videoId}
        handle={parsed.handle}
        watchUrl={parsed.url}
        autoplay
        compact
        className="tiktok-slide"
      />
    );
  }

  return (
    <a
      href={parsed?.url ?? url}
      target="_blank"
      rel="noreferrer"
      aria-label={
        parsed ? `Open @${parsed.handle} on TikTok` : "Open on TikTok"
      }
      className="tiktok-slide flex items-center justify-center"
      style={{ background: tone }}
    >
      {photo ? (
        // Mapillary still used as the idle poster — not a Google photo CDN.
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
    </a>
  );
}
