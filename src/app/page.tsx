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
      <HubHeader pack={pack} />
      <EventChip event={pack.event} />
      <AskBar pack={pack} />
      <SuggestedPairing pack={pack} />
      <SavedStrolls combos={pack.combos} />

      <section className="mt-5">
        <h2 className="mb-2.5 text-[16px] font-semibold tracking-[-0.02em] text-cream">
          This weekend · {hubCombos.length} stroll
          {hubCombos.length === 1 ? "" : "s"}
        </h2>
        <div className="space-y-3">
          {hubCombos.map((combo) => (
            <ComboCard key={combo.id} combo={combo} />
          ))}
        </div>
      </section>
    </main>
  );
}
