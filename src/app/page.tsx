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
        <h2 className="mb-2.5 text-[16px] font-semibold tracking-[-0.02em] text-cream">
          This weekend · {pack.combos.length} stroll
          {pack.combos.length === 1 ? "" : "s"}
        </h2>
        <div className="space-y-3">
          {pack.combos.map((combo) => (
            <ComboCard key={combo.id} combo={combo} />
          ))}
        </div>
      </section>
    </main>
  );
}
