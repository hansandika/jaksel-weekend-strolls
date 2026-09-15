import type { WeekendEvent } from "@/lib/types";

export function EventChip({ event }: { event: WeekendEvent }) {
  return (
    <section className="surface mt-3 flex items-center gap-2.5 rounded-full px-3 py-2">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-coral" aria-hidden />
      <p className="min-w-0 truncate text-[12px] leading-none text-cream/75">
        {event.name}
        <span className="text-cream/40"> · {event.endsLabel}</span>
      </p>
    </section>
  );
}
