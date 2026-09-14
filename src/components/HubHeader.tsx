import type { WeekendPack } from "@/lib/types";

export function HubHeader({ pack }: { pack: WeekendPack }) {
  return (
    <header className="relative pr-[72px]">
      <p className="text-[13px] font-medium leading-none tracking-[-0.01em] text-cream/70">
        {pack.brand}
      </p>
      <h1 className="mt-1.5 text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] text-cream">
        {pack.title}
      </h1>
      <span className="absolute right-0 top-1 rounded-full bg-coral px-2.5 py-[5px] text-[11px] font-semibold tracking-wide text-cream">
        {pack.weekLabel}
      </span>
      <p className="mt-2 text-[14px] leading-snug text-cream/55">{pack.tagline}</p>
    </header>
  );
}
