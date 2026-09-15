"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isPlayableTikTokUrl, parseTikTokVideo } from "@/lib/tiktok";
import { PlayGlyph } from "./TikTokStrip";
import { TikTokPlayer } from "./TikTokPlayer";

export function TikTokCarousel({
  urls,
  tones,
}: {
  urls: string[];
  tones: string[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
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
  }, [syncActive]);

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
    <section aria-label="TikTok proof">
      <div className="surface rounded-[16px] px-3 py-3">
        <div
          ref={scrollerRef}
          className="tiktok-scroll mx-auto flex w-fit max-w-full snap-x snap-mandatory gap-2 overflow-x-auto"
        >
          {playable.map((url, index) => (
            <CarouselSlide
              key={url}
              url={url}
              tone={tones[index] ?? tones[0] ?? "#3a2f2c"}
              active={index === active}
              autoplay={index === active && autoplayOk}
            />
          ))}
        </div>
      </div>
      {playable.length > 1 ? (
        <div className="mt-1.5 flex justify-center gap-1">
          {playable.map((url, index) => (
            <button
              key={`${url}-dot`}
              type="button"
              aria-label={`TikTok ${index + 1}`}
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
  active,
  autoplay,
}: {
  url: string;
  tone: string;
  active: boolean;
  autoplay: boolean;
}) {
  const parsed = parseTikTokVideo(url);
  const playable = isPlayableTikTokUrl(url);

  if (playable && parsed && active) {
    return (
      <TikTokPlayer
        videoId={parsed.videoId}
        handle={parsed.handle}
        watchUrl={parsed.url}
        autoplay={autoplay}
        compact
        className="h-[180px] w-[101px] shrink-0 snap-start rounded-[14px] bg-[#111]"
      />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex h-[180px] w-[101px] shrink-0 snap-start items-center justify-center rounded-[14px]"
      style={{ background: tone }}
    >
      <PlayGlyph />
    </a>
  );
}
