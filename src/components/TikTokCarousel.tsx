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
    if (!node || node.clientWidth === 0) return;
    const index = Math.round(node.scrollLeft / node.clientWidth);
    setActive(Math.min(urls.length - 1, Math.max(0, index)));
  }, [urls.length]);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    syncActive();
    node.addEventListener("scroll", syncActive, { passive: true });
    return () => node.removeEventListener("scroll", syncActive);
  }, [syncActive]);

  return (
    <section aria-label="TikTok proof">
      <div
        ref={scrollerRef}
        className="tiktok-scroll flex snap-x snap-mandatory overflow-x-auto rounded-[18px]"
      >
        {urls.map((url, index) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex h-[210px] w-full shrink-0 snap-center items-center justify-center"
            style={{ background: tones[index] ?? tones[0] ?? "#3a2f2c" }}
          >
            <PlayGlyph />
          </a>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {urls.map((url, index) => (
          <button
            key={`${url}-dot`}
            type="button"
            aria-label={`TikTok ${index + 1}`}
            aria-current={index === active}
            onClick={() => {
              const node = scrollerRef.current;
              if (!node) return;
              node.scrollTo({
                left: index * node.clientWidth,
                behavior: "smooth",
              });
            }}
            className={`h-1.5 rounded-full transition-all ${
              index === active ? "w-4 bg-coral" : "w-1.5 bg-cream/25"
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-cream/40">
        Placeholder TikTok tiles — real clips replace these URLs later.
      </p>
    </section>
  );
}
