"use client";

import { useState } from "react";
import { displayLabel } from "@/lib/labels";
import type { WeekendPack } from "@/lib/types";

export function AskBar({ pack }: { pack: WeekendPack }) {
  const [value, setValue] = useState("");

  return (
    <section className="mt-3" aria-label="Ask for a stroll, coming soon">
      <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-cream/45">
        Vibe
      </p>
      <div className="tiktok-scroll -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {pack.askChips.map((chip) => {
          const active = value === chip;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => setValue(chip)}
              aria-pressed={active}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium ${
                active
                  ? "bg-coral text-ink"
                  : "border border-cream/10 bg-cream/[0.05] text-cream/80"
              }`}
            >
              {displayLabel(chip)}
            </button>
          );
        })}
      </div>
      <div className="surface mt-2 flex h-11 items-center gap-2 rounded-full py-1 pl-4 pr-1">
        <label className="sr-only" htmlFor="ask-input">
          Ask for a stroll
        </label>
        <input
          id="ask-input"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={pack.askPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-[13px] text-cream placeholder:text-cream/35 focus:outline-none"
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
      <p className="mt-1.5 text-[11px] leading-snug text-cream/35">
        {pack.askHint}
      </p>
    </section>
  );
}
