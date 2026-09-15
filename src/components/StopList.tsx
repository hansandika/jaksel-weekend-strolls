import { displayLabel } from "@/lib/labels";
import type { Stop } from "@/lib/types";
import { MapsPin } from "./MapsPin";

export function StopList({ stops }: { stops: Stop[] }) {
  return (
    <ol className="space-y-2.5">
      {stops.map((stop, index) => (
        <li
          key={`${stop.candidateId ?? stop.name}-${stop.role}`}
          className="surface overflow-hidden rounded-[16px] p-2.5"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-[#1f1b19]">
              {stop.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={stop.photoUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[12px] text-cream/30">
                  {index + 1}
                </span>
              )}
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
            <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-cream/65">
              {stop.note}
            </p>
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
        </li>
      ))}
    </ol>
  );
}
