"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PlayGlyph } from "./TikTokStrip";

export function TikTokCarousel({
  urls,
  tones,
}: {
  urls: string[];
  tones: string[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

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

  return (
    <section aria-label="TikTok proof">
      <div
        ref={scrollerRef}
        className="tiktok-scroll flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
      >
        {urls.map((url, index) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex h-[248px] w-[158px] shrink-0 snap-start items-center justify-center rounded-[16px]"
            style={{ background: tones[index] ?? tones[0] ?? "#3a2f2c" }}
          >
            <PlayGlyph />
          </a>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-1">
        {urls.map((url, index) => (
          <button
            key={`${url}-dot`}
            type="button"
            aria-label={`TikTok ${index + 1}`}
            aria-current={index === active}
            onClick={() => goTo(index)}
            className="flex h-8 w-8 items-center justify-center"
          >
            <span
              className={`block h-1.5 rounded-full transition-all ${
                index === active ? "w-4 bg-coral" : "w-1.5 bg-cream/25"
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-center text-[11px] text-cream/40">
        Placeholder TikTok tiles — live clips replace these URLs later.
      </p>
    </section>
  );
}
