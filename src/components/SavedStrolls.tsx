"use client";

import Link from "next/link";
import { useSavedStrolls } from "@/lib/saved-strolls";
import type { Combo } from "@/lib/types";

export function SavedStrolls({
  combos,
  className = "",
}: {
  combos: Combo[];
  className?: string;
}) {
  const { ids, ready } = useSavedStrolls();
  if (!ready) return null;
  const items = ids
    .map((id) => combos.find((combo) => combo.id === id))
    .filter((combo): combo is Combo => Boolean(combo));
  if (items.length === 0) return null;

  return (
    <section className={`mt-5 ${className}`} aria-label="Saved strolls">
      <h2 className="mb-2.5 text-[16px] font-semibold tracking-[-0.02em] text-cream">
        Saved
      </h2>
      <ul className="space-y-2">
        {items.map((combo) => (
          <li key={combo.id}>
            <Link
              href={`/combo/${combo.id}`}
              className="surface hover-lift flex items-center justify-between rounded-[14px] px-3.5 py-3"
            >
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold text-cream">
                  {combo.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-cream/45">
                  {combo.area} · {combo.budget}
                </span>
              </span>
              <span className="text-[12px] font-semibold text-coral">Open →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
