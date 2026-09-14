import Link from "next/link";
import { notFound } from "next/navigation";
import { StopList } from "@/components/StopList";
import { TikTokCarousel } from "@/components/TikTokCarousel";
import { getCombo, getLivePack } from "@/lib/pack";

type ComboPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getLivePack().combos.map((combo) => ({ id: combo.id }));
}

export async function generateMetadata({ params }: ComboPageProps) {
  const { id } = await params;
  const combo = getCombo(id);
  return {
    title: combo ? `${combo.title} · Jaksel Weekend Strolls` : "Combo",
  };
}

export default async function ComboPage({ params }: ComboPageProps) {
  const { id } = await params;
  const combo = getCombo(id);
  const pack = getLivePack();

  if (!combo) {
    notFound();
  }

  const chips = [combo.vibe, combo.duration, combo.area, combo.budget];

  return (
    <main className="phone-shell">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-[13px] font-medium text-cream/70"
        >
          ← Hub
        </Link>
        <span className="rounded-full bg-coral px-2.5 py-[5px] text-[11px] font-semibold tracking-wide text-cream">
          {pack.weekLabel}
        </span>
      </div>

      <p className="mt-5 text-[13px] text-cream/55">{pack.brand}</p>
      <h1 className="mt-1 text-[26px] font-semibold leading-[1.15] tracking-[-0.035em] text-cream">
        {combo.title}
      </h1>
      <p className="mt-2 text-[14px] leading-snug text-cream/55">
        {combo.subtitle}
      </p>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-card px-2.5 py-1 text-[11px] text-cream/75"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="mt-5">
        <TikTokCarousel urls={combo.tiktokUrls} tones={combo.posterTones} />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-[16px] font-semibold tracking-[-0.02em]">
          Stops
        </h2>
        <StopList stops={combo.stops} />
      </section>

      <section className="mt-5 rounded-[16px] bg-card px-4 py-3.5">
        <p className="text-[13px] font-semibold text-coral">Tip</p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-cream/80">
          {combo.tip}
        </p>
      </section>

      <section className="mt-3 rounded-[16px] bg-card px-4 py-3.5">
        <p className="text-[13px] font-semibold text-coral">Rain notes</p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-cream/80">
          {combo.rainNotes}
        </p>
      </section>
    </main>
  );
}
