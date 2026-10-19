import { AskBar } from "@/components/AskBar";
import { ComboCard } from "@/components/ComboCard";
import { EventChip } from "@/components/EventChip";
import { HubHeader } from "@/components/HubHeader";
import { SavedStrolls } from "@/components/SavedStrolls";
import { SuggestedPairing } from "@/components/SuggestedPairing";
import { getHubCombos, getLivePack } from "@/lib/pack";

export const dynamic = "force-dynamic";

export default async function HubPage() {
  const pack = await getLivePack();
  const hubCombos = getHubCombos(pack);

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
    </main>
  );
}
