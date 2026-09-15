import { displayLabel } from "@/lib/labels";
import type { Stop } from "@/lib/types";

export function StopList({ stops }: { stops: Stop[] }) {
  return (
    <ol className="space-y-3">
      {stops.map((stop, index) => (
        <li key={`${stop.candidateId ?? stop.name}-${stop.role}`}>
          <a
            href={stop.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="block rounded-[16px] bg-card px-4 py-3.5 transition-colors hover:bg-[#2d2724]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-cream">
                <span className="mr-2 text-cream/35">{index + 1}</span>
                {stop.name}
              </p>
              <span className="shrink-0 rounded-full bg-[#1f1b19] px-2.5 py-1 text-[11px] text-coral">
                {displayLabel(stop.role)}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-cream/50">
              {stop.area}
              <span className="text-cream/30"> · Maps</span>
            </p>
            <p className="mt-2 text-[13px] leading-snug text-cream/70">
              {stop.note}
            </p>
          </a>
        </li>
      ))}
    </ol>
  );
}
