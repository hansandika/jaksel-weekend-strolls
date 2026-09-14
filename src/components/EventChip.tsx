import { displayLabel } from "@/lib/labels";
import type { WeekendEvent } from "@/lib/types";

export function EventChip({ event }: { event: WeekendEvent }) {
  return (
    <section className="mt-4 flex items-start justify-between gap-3 rounded-[18px] bg-[#4a2a24] px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold leading-tight text-coral">
          {event.name}
        </p>
        <p className="mt-1 text-[12px] leading-snug text-cream/55">
          {event.endsLabel} · {event.note}
        </p>
      </div>
      <span className="mt-0.5 shrink-0 rounded-full border border-coral/70 px-2.5 py-[3px] text-[11px] font-medium text-coral">
        {displayLabel(event.kind)}
      </span>
    </section>
  );
}
