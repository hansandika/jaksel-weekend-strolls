import Link from "next/link";
import type { Combo } from "@/lib/types";
import { displayLabel } from "@/lib/labels";
import { formatComboMeta, getComboCardPhotos } from "@/lib/pack";
import { TikTokStrip } from "./TikTokStrip";

export function ComboCard({ combo }: { combo: Combo }) {
  const photos = getComboCardPhotos(combo);
  return (
    <article className="overflow-hidden rounded-[20px] bg-card">
      <TikTokStrip
        urls={combo.tiktokUrls}
        tones={combo.posterTones}
        photos={photos}
      />
      <div className="px-4 pb-4 pt-3.5">
        <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.02em] text-cream">
          {combo.title}
        </h3>
        <p className="mt-1 text-[13px] leading-snug text-cream/55">
          {combo.subtitle}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {combo.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#1f1b19] px-2.5 py-1 text-[11px] text-cream/70"
            >
              {displayLabel(tag)}
            </span>
          ))}
        </div>
        <p className="mt-2.5 text-[12px] text-cream/50">
          {formatComboMeta(combo)}
        </p>
        <Link
          href={`/combo/${combo.id}`}
          className="mt-3 flex h-11 items-center justify-center rounded-[12px] bg-coral text-[15px] font-semibold text-ink"
        >
          Open combo
        </Link>
      </div>
    </article>
  );
}
