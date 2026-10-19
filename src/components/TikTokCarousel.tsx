"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
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
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
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
    setCanPrev(node.scrollLeft > 8);
    setCanNext(node.scrollLeft + node.clientWidth < node.scrollWidth - 8);
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

  const scrollBehavior = (): ScrollBehavior =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

  const goTo = (index: number) => {
    const node = scrollerRef.current;
    const slide = node?.children[index] as HTMLElement | undefined;
    if (!node || !slide) return;
    node.scrollTo({ left: slide.offsetLeft, behavior: scrollBehavior() });
  };

  const scrollByTile = (direction: -1 | 1) => {
    const node = scrollerRef.current;
    const slide = node?.querySelector<HTMLElement>(".tiktok-slide");
    if (!node || !slide) return;
    const styles = getComputedStyle(node);
    const gap = Number.parseFloat(styles.columnGap || "0") || 0;
    node.scrollBy({
      left: direction * (slide.offsetWidth + gap),
      behavior: scrollBehavior(),
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    scrollByTile(event.key === "ArrowRight" ? 1 : -1);
  };

  if (playable.length === 0) {
    return null;
  }

  const quietArrows = size === "hub";

  return (
    <section
      ref={rootRef}
      aria-label="TikTok proof"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="group"
    >
      <div className="relative">
        <div
          ref={scrollerRef}
          className={`tiktok-scroll flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain ${
            size === "page"
              ? "tiktok-scroll-page rounded-[16px] md:rounded-none"
              : "tiktok-scroll-hub"
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
          <>
            <CarouselArrow
              direction="left"
              label="Previous clip"
              disabled={!canPrev}
              quiet={quietArrows}
              onClick={() => scrollByTile(-1)}
            />
            <CarouselArrow
              direction="right"
              label="Next clip"
              disabled={!canNext}
              quiet={quietArrows}
              onClick={() => scrollByTile(1)}
            />
          </>
        ) : null}
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
        <span className="md:hidden">Tap the clip to open TikTok</span>
        <span className="hidden md:inline">Click the clip to open TikTok</span>
      </p>
    </section>
  );
}

function CarouselArrow({
  direction,
  label,
  disabled,
  quiet,
  onClick,
}: {
  direction: "left" | "right";
  label: string;
  disabled: boolean;
  quiet: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/15 bg-ink/80 text-cream shadow-lg backdrop-blur-md hover-bright disabled:cursor-default disabled:opacity-30 md:flex ${
        direction === "left" ? "left-3" : "right-3"
      } ${
        quiet
          ? "md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:focus-visible:pointer-events-auto md:focus-visible:opacity-100"
          : ""
      }`}
    >
      <Chevron direction={direction} />
    </button>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d={direction === "left" ? "M11.25 4.5 6.75 9l4.5 4.5" : "M6.75 4.5 11.25 9l-4.5 4.5"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
