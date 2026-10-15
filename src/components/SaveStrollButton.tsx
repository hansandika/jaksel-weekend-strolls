"use client";

import { useSavedStrolls } from "@/lib/saved-strolls";

export function SaveStrollButton({
  id,
  title,
  compact = false,
}: {
  id: string;
  title: string;
  compact?: boolean;
}) {
  const { ready, saved, toggle } = useSavedStrolls();
  const on = ready && saved(id);

  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={on}
      aria-label={on ? `Remove ${title} from saved` : `Save ${title}`}
      disabled={!ready}
      className={`flex items-center justify-center rounded-full text-[12px] font-semibold ${
        compact ? "h-11 min-w-11 px-3" : "h-8 px-2.5"
      } ${on ? "bg-coral text-ink" : "glass-pill text-cream"}`}
    >
      {on ? "Saved" : "Save"}
    </button>
  );
}
