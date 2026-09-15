import Link from "next/link";
import { notFound } from "next/navigation";
import { StopList } from "@/components/StopList";
import { TikTokCarousel } from "@/components/TikTokCarousel";
import { getComboTikTokSlides, getLivePack } from "@/lib/pack";

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

  const chips = [combo.area, combo.duration, combo.budget, combo.vibe];
  const slides = getComboTikTokSlides(combo);

  return (
    <main className="phone-shell">
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

      <div className="mt-3 flex flex-wrap gap-1">
        {chips.map((chip) => (
          <span
            key={chip}
            className="glass-pill rounded-full px-2.5 py-1 text-[11px] text-cream/80"
          >
            {chip}
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
    </main>
  );
}
