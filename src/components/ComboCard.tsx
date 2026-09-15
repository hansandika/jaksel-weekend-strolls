import Link from "next/link";
import type { Combo } from "@/lib/types";
import { displayLabel } from "@/lib/labels";
import { ComboHero } from "./ComboHero";

export function ComboCard({ combo }: { combo: Combo }) {
  const heroPhoto = combo.stops.find((stop) => stop.photoUrl)?.photoUrl ?? null;
  const proof = combo.tiktokUrls[0] ?? combo.stops.find((stop) => stop.tiktokUrl)?.tiktokUrl ?? null;

  return (
    <article className="surface overflow-hidden rounded-[20px]">
      <ComboHero
        photoUrl={heroPhoto}
        tone={combo.posterTones[0] ?? "#3a2f2c"}
        tiktokUrl={proof}
      >
        <h3 className="text-[22px] font-semibold leading-[1.15] tracking-[-0.03em] text-cream">
          {combo.title}
        </h3>
        <p className="mt-1 text-[11px] leading-snug text-cream/70">
          {combo.duration} · {combo.area} · {combo.budget}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {combo.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="glass-pill rounded-full px-2 py-[3px] text-[11px] leading-none text-cream/85"
            >
              {displayLabel(tag)}
            </span>
          ))}
        </div>
      </ComboHero>
      <div className="px-3 pb-3 pt-2.5">
        <Link
          href={`/combo/${combo.id}`}
          className="flex h-11 items-center justify-center rounded-[12px] bg-coral text-[15px] font-semibold text-ink"
        >
          Open combo
        </Link>
      </div>
    </article>
  );
}
