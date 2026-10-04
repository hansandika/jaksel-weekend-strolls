import Link from "next/link";
import type { Combo } from "@/lib/types";
import { displayLabel } from "@/lib/labels";
import { getComboTikTokSlides } from "@/lib/pack";
import { comboDayMath } from "@/lib/walk";
import { ComboHero } from "./ComboHero";
import { TikTokCarousel } from "./TikTokCarousel";

export function ComboCard({ combo }: { combo: Combo }) {
  const heroPhoto = combo.stops.find((stop) => stop.photoUrl)?.photoUrl ?? null;
  const slides = getComboTikTokSlides(combo);
  const math = comboDayMath(combo);
  const title = (
    <>
      <h3 className="text-[22px] font-semibold leading-[1.15] tracking-[-0.03em] text-cream">
        {combo.title}
      </h3>
      <p className="mt-1 text-[12px] leading-snug text-cream/70">{math.line}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-cream/45">
        {combo.area} · {combo.budget}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {[combo.vibe, ...combo.tags.slice(0, 2)].map((tag) => (
          <span
            key={tag}
            className="glass-pill rounded-full px-2 py-[3px] text-[11px] leading-none text-cream/85"
          >
            {displayLabel(tag)}
          </span>
        ))}
      </div>
    </>
  );

  return (
    <article className="surface overflow-hidden rounded-[20px]">
      {slides.urls.length > 0 ? (
        <>
          <TikTokCarousel
            urls={slides.urls}
            photos={slides.photos}
            tones={combo.posterTones}
            size="hub"
          />
          <div className="px-3.5 pt-1">{title}</div>
        </>
      ) : (
        <ComboHero
          photoUrl={heroPhoto}
          tone={combo.posterTones[0] ?? "#3a2f2c"}
        >
          {title}
        </ComboHero>
      )}
      <div className="px-3 pb-3 pt-2.5">
        <Link
          href={`/combo/${combo.id}`}
          className="flex h-11 items-center justify-center rounded-[12px] bg-coral text-[15px] font-semibold text-ink"
        >
          Open stroll
        </Link>
      </div>
    </article>
  );
}
