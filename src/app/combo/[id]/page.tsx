import Link from "next/link";
import { notFound } from "next/navigation";
import { StartStrollBar } from "@/components/StartStrollBar";
import { StopList } from "@/components/StopList";
import { TikTokCarousel } from "@/components/TikTokCarousel";
import { googleMapsWalkingDirUrl } from "@/lib/maps";
import { getComboTikTokSlides, getLivePack } from "@/lib/pack";
import { comboDayMath } from "@/lib/walk";

type ComboPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ComboPageProps) {
  const { id } = await params;
  const combo = (await getLivePack()).combos.find((item) => item.id === id);
  return {
    title: combo ? `${combo.title} · Jaksel Weekend Strolls` : "Combo",
  };
}

export default async function ComboPage({ params }: ComboPageProps) {
  const { id } = await params;
  const pack = await getLivePack();
  const combo = pack.combos.find((item) => item.id === id);

  if (!combo) {
    notFound();
  }

  const math = comboDayMath(combo);
  const slides = getComboTikTokSlides(combo);
  const startHref =
    googleMapsWalkingDirUrl(combo.stops) ?? combo.stops[0]?.googleMapsUrl ?? "";
  const summary = [
    `${math.stopCount} stop${math.stopCount === 1 ? "" : "s"}`,
    math.walkMinutes > 0 ? `~${math.walkMinutes} min walk` : null,
    math.format,
  ].filter((part): part is string => Boolean(part));

  return (
    <main className="phone-shell pb-24">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-[13px] font-medium text-cream/70">
          ← Hub
        </Link>
        <span className="glass-pill rounded-full px-2.5 py-[5px] text-[11px] font-semibold tracking-wide text-cream">
          {pack.weekLabel}
        </span>
      </div>

      <h1 className="mt-4 text-[26px] font-semibold leading-[1.12] tracking-[-0.035em] text-cream">
        {combo.title}
      </h1>
      <p className="mt-1.5 text-[13px] leading-snug text-cream/55">
        {combo.subtitle}
      </p>

      <div className="surface mt-3 flex flex-wrap gap-x-3 gap-y-1 rounded-[14px] px-3.5 py-2.5">
        {summary.map((part) => (
          <span key={part} className="text-[12px] font-medium text-cream/80">
            {part}
          </span>
        ))}
      </div>

      {slides.urls.length > 0 ? (
        <div className="mt-4">
          <TikTokCarousel
            urls={slides.urls}
            photos={slides.photos}
            tones={combo.posterTones}
            size="page"
          />
        </div>
      ) : null}

      <section className="mt-5">
        <h2 className="mb-2.5 text-[16px] font-semibold tracking-[-0.02em]">
          Stops
        </h2>
        <StopList stops={combo.stops} />
      </section>

      <section className="surface mt-4 rounded-[16px] px-3.5 py-3">
        <p className="text-[11px] font-semibold tracking-wide text-cream/45">
          TIP
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-cream/80">
          {combo.tip}
        </p>
      </section>

      <section className="surface mt-2 rounded-[16px] px-3.5 py-3">
        <p className="text-[11px] font-semibold tracking-wide text-cream/45">
          RAIN
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-cream/80">
          {combo.rainNotes}
        </p>
      </section>

      {startHref ? <StartStrollBar href={startHref} /> : null}
    </main>
  );
}
