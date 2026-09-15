import { AskBar } from "@/components/AskBar";
import { ComboCard } from "@/components/ComboCard";
import { EventChip } from "@/components/EventChip";
import { HubHeader } from "@/components/HubHeader";
import { SuggestedPairing } from "@/components/SuggestedPairing";
import { getLivePack } from "@/lib/pack";

export const dynamic = "force-dynamic";

export default async function HubPage() {
  const pack = await getLivePack();

  return (
    <main className="phone-shell">
      <HubHeader pack={pack} />
      <EventChip event={pack.event} />
      <AskBar pack={pack} />
      <SuggestedPairing pack={pack} />

      <section className="mt-5">
        <div className="mb-2.5 flex items-end justify-between">
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-cream">
            This weekend
          </h2>
          <p className="text-[11px] text-cream/40">{pack.combos.length} combos</p>
        </div>
        <div className="space-y-3">
          {pack.combos.map((combo) => (
            <ComboCard key={combo.id} combo={combo} />
          ))}
        </div>
      </section>
    </main>
  );
}
