import type { WeekendPack } from "@/lib/types";

export function HubHeader({ pack }: { pack: WeekendPack }) {
  return (
    <header className="relative pr-16">
      <p className="text-[11px] font-medium tracking-[0.12em] text-cream/45">
        {pack.brand.toUpperCase()}
      </p>
      <h1 className="mt-1 text-[26px] font-semibold leading-[1.1] tracking-[-0.035em] text-cream">
        {pack.title}
      </h1>
      <span className="glass-pill absolute right-0 top-0 rounded-full px-2.5 py-[5px] text-[11px] font-semibold tracking-wide text-cream">
        {pack.weekLabel}
      </span>
    </header>
  );
}
