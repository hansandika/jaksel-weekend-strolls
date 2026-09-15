import { displayLabel } from "@/lib/labels";
import type { Stop } from "@/lib/types";
import { comboWalkTotal } from "@/lib/walk";
import { MapsPin } from "./MapsPin";

export function StopList({ stops }: { stops: Stop[] }) {
  const { gaps } = comboWalkTotal(stops);

  return (
    <div>
      {stops.map((stop, index) => (
        <div key={`${stop.candidateId ?? stop.name}-${stop.role}`}>
          <article className="surface overflow-hidden rounded-[16px] p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-[#1f1b19]">
                {stop.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={stop.photoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-[11px] font-semibold text-cream">
                  {index + 1}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[14px] font-semibold leading-snug tracking-[-0.02em] text-cream">
                    {stop.name}
                  </p>
                  <span className="glass-pill shrink-0 rounded-full px-2 py-[3px] text-[11px] text-cream/80">
                    {displayLabel(stop.role)}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-cream/45">{stop.area}</p>
              </div>
            </div>
            {stop.note ? (
              <div className="mt-2">
                <p className="text-[10px] font-semibold tracking-wide text-cream/40">
                  WHY
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-cream/70">
                  {stop.note}
                </p>
              </div>
            ) : null}
            <a
              href={stop.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2.5 flex h-10 items-center justify-center gap-1.5 rounded-[12px] border border-cream/8 bg-cream/[0.06] text-[13px] font-semibold text-cream"
            >
              <MapsPin />
              Open in Google Maps
            </a>
          </article>
          {gaps[index] ? (
            <div
              className="flex items-center gap-2.5 px-1 py-2.5"
              aria-label={gaps[index]?.label}
            >
              <span className="flex w-14 justify-center" aria-hidden>
                <span className="h-8 w-px bg-cream/20" />
              </span>
              <p className="text-[12px] font-medium text-cream/60">
                {gaps[index]?.label}
              </p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
