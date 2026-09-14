import type { WeekendPack } from "@/lib/types";

export function AskBar({ pack }: { pack: WeekendPack }) {
  return (
    <section className="mt-3.5" aria-label="Ask for a card, coming soon">
      <div className="flex items-center gap-2 rounded-full bg-[#2b2522] py-1.5 pl-4 pr-1.5">
        <label className="sr-only" htmlFor="ask-input">
          Ask for a card
        </label>
        <input
          id="ask-input"
          type="text"
          disabled
          placeholder={pack.askPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-[14px] text-cream placeholder:text-cream/35 focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          type="button"
          disabled
          title="Coming soon"
          className="rounded-full bg-coral px-4 py-2 text-[14px] font-semibold text-cream disabled:cursor-not-allowed"
        >
          Ask
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2">
        {pack.askChips.map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-[#2b2522] px-3 py-1.5 text-[12px] text-cream/70"
          >
            {chip}
          </span>
        ))}
      </div>

      <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-cream/45">
        <span aria-hidden className="text-[10px] text-cream/50">
          ✦
        </span>
        {pack.askHint}
      </p>
    </section>
  );
}
