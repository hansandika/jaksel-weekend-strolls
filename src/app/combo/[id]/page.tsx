import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SaveStrollButton } from "@/components/SaveStrollButton";
import { ShareStrollButton } from "@/components/ShareStrollButton";
import { StartStrollBar } from "@/components/StartStrollBar";
import { StopList } from "@/components/StopList";
import { StrollRoutePanel } from "@/components/StrollRoutePanel";
import { TikTokCarousel } from "@/components/TikTokCarousel";
import { googleMapsWalkingDirUrl } from "@/lib/maps";
import { getComboTikTokSlides, getLivePack } from "@/lib/pack";
import { getSiteUrl } from "@/lib/site-url";
import { comboDayMath } from "@/lib/walk";

type ComboPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ComboPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const pack = await getLivePack();
    const combo = pack.combos.find((item) => item.id === id);
    if (!combo) return { title: "Stroll" };
    const math = comboDayMath(combo);
    const title = combo.title;
    const description = `${math.line}. ${combo.subtitle}`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${getSiteUrl()}/combo/${combo.id}`,
        type: "website",
      },
    };
  } catch {
    return { title: "Stroll" };
  }
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
  const shareText = `${math.line} · ${combo.area}`;

  return (
    <main id="main" className="phone-shell combo-page pb-24">
      <div className="combo-layout">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              className="text-[13px] font-medium text-cream/70 hover:text-cream"
            >
              ← Hub
            </Link>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 lg:hidden">
                <SaveStrollButton id={combo.id} title={combo.title} />
                <ShareStrollButton
                  title={combo.title}
                  text={shareText}
                  path={`/combo/${combo.id}`}
                />
              </div>
              <span className="glass-pill rounded-full px-2.5 py-[5px] text-[11px] font-semibold tracking-wide text-cream">
                {pack.weekLabel}
              </span>
            </div>
          </div>

          <h1 className="mt-4 text-[26px] font-semibold leading-[1.12] tracking-[-0.035em] text-cream lg:text-[40px]">
            {combo.title}
          </h1>
          <p className="mt-1.5 text-[13px] leading-snug text-cream/55 lg:max-w-2xl lg:text-[15px]">
            {combo.subtitle}
          </p>

          <div className="surface mt-3 flex flex-wrap gap-x-3 gap-y-1 rounded-[14px] px-3.5 py-2.5 lg:hidden">
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
            <h2 className="mb-2.5 text-[16px] font-semibold tracking-[-0.02em] lg:text-[20px]">
              Stops
            </h2>
            <StopList stops={combo.stops} />
          </section>

          <section className="surface mt-4 rounded-[16px] px-3.5 py-3 md:px-4 md:py-4">
            <p className="text-[11px] font-semibold tracking-wide text-cream/45">
              TIP
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-cream/80 lg:text-[15px]">
              {combo.tip}
            </p>
          </section>

          <section className="surface mt-2 rounded-[16px] px-3.5 py-3 md:px-4 md:py-4">
            <p className="text-[11px] font-semibold tracking-wide text-cream/45">
              RAIN
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-cream/80 lg:text-[15px]">
              {combo.rainNotes}
            </p>
            {combo.rainSwapId && combo.rainSwapTitle ? (
              <Link
                href={`/combo/${combo.rainSwapId}`}
                className="hover-bright mt-2.5 flex h-10 items-center justify-center rounded-[12px] bg-cream/[0.08] text-[13px] font-semibold text-coral md:w-fit md:px-4"
              >
                Raining? Swap to {combo.rainSwapTitle}
              </Link>
            ) : null}
          </section>
        </div>

        <StrollRoutePanel
          combo={combo}
          startHref={startHref}
          shareText={shareText}
        />
      </div>

      {startHref ? <StartStrollBar href={startHref} /> : null}
    </main>
  );
}
