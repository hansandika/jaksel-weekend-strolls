import { displayLabel } from "@/lib/labels";
import type { WeekendPack } from "@/lib/types";

export function AskBar({ pack }: { pack: WeekendPack }) {
  return (
    <section className="mt-3" aria-label="Ask for a card, coming soon">
      <div className="surface flex h-11 items-center gap-2 rounded-full py-1 pl-4 pr-1">
        <label className="sr-only" htmlFor="ask-input">
          Ask for a card
        </label>
        <input
          id="ask-input"
          type="text"
          disabled
          placeholder={pack.askPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-[13px] text-cream placeholder:text-cream/35 focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          type="button"
          disabled
          title="Coming soon"
          aria-label="Ask, coming soon"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral text-[15px] font-semibold text-ink disabled:cursor-not-allowed"
        >
          ↑
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {pack.askChips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-cream/8 bg-cream/[0.04] px-2.5 py-1 text-[11px] text-cream/55"
          >
            {displayLabel(chip)}
          </span>
        ))}
      </div>
    </section>
  );
}
