import { AskBar } from "@/components/AskBar";
import { ComboCard } from "@/components/ComboCard";
import { EventChip } from "@/components/EventChip";
import { HubHeader } from "@/components/HubHeader";
import { SavedStrolls } from "@/components/SavedStrolls";
import { SuggestedPairing } from "@/components/SuggestedPairing";
import { getDayTrips, getHubCombos, getLivePack } from "@/lib/pack";

export const dynamic = "force-dynamic";

export default async function HubPage() {
  const pack = await getLivePack();
  const hubCombos = getHubCombos(pack);
  const dayTrips = getDayTrips(pack);

  return (
    <main id="main" className="phone-shell">
      <div className="hub-hero">
        <div className="min-w-0">
          <HubHeader pack={pack} />
          <EventChip event={pack.event} />
        </div>
        <div className="hub-ask">
          <AskBar pack={pack} />
        </div>
      </div>

      <div className="hub-rail">
        <div className="hub-rail-main">
          <SuggestedPairing pack={pack} />
        </div>
        <SavedStrolls
          combos={pack.combos}
          className="lg:mt-0 lg:w-80 lg:shrink-0 xl:w-96"
        />
      </div>

      <section className="hub-combos mt-5">
        <h2 className="mb-2.5 text-[16px] font-semibold tracking-[-0.02em] text-cream lg:mb-4 lg:text-[20px]">
          This weekend · {hubCombos.length} stroll
          {hubCombos.length === 1 ? "" : "s"}
        </h2>
        <div className="combo-grid space-y-3 md:space-y-0">
          {hubCombos.map((combo) => (
            <ComboCard key={combo.id} combo={combo} />
          ))}
        </div>
      </section>

      {dayTrips.length > 0 ? (
        <section className="hub-combos mt-6" aria-labelledby="day-trips-heading">
          <h2
            id="day-trips-heading"
            className="text-[16px] font-semibold tracking-[-0.02em] text-cream lg:text-[20px]"
          >
            Day Trip · Outside Jaksel
          </h2>
          <p className="mb-2.5 mt-1 text-[12px] leading-snug text-cream/50 lg:mb-4 lg:text-[14px]">
            Glodok and Taman Mini.
          </p>
          <div className="combo-grid space-y-3 md:space-y-0">
            {dayTrips.map((combo) => (
              <ComboCard key={combo.id} combo={combo} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-center text-[11px] text-cream/35">
        Places from Google Maps + OpenStreetMap
      </p>
    </main>
  );
}
