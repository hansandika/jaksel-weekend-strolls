import { AskBar } from "@/components/AskBar";
import { ComboCard } from "@/components/ComboCard";
import { EventChip } from "@/components/EventChip";
import { HubHeader } from "@/components/HubHeader";
import { SuggestedPairing } from "@/components/SuggestedPairing";
import { getLivePack } from "@/lib/pack";

export default function HubPage() {
  const pack = getLivePack();

  return (
    <main className="phone-shell">
      <HubHeader pack={pack} />
      <EventChip event={pack.event} />
      <AskBar pack={pack} />

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-cream">
            This weekend
          </h2>
          <p className="text-[13px] text-cream/45">
            {pack.combos.length} combos
          </p>
        </div>
        <div className="space-y-4">
          {pack.combos.map((combo) => (
            <ComboCard key={combo.id} combo={combo} />
          ))}
        </div>
      </section>

      <SuggestedPairing pack={pack} />
    </main>
  );
}
