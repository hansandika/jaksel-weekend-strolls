import type { Combo } from "@/lib/types";
import { comboDayMath, comboWalkTotal, formatKm } from "@/lib/walk";
import { MapsPin } from "./MapsPin";
import { SaveStrollButton } from "./SaveStrollButton";
import { ShareStrollButton } from "./ShareStrollButton";

export function StrollRoutePanel({
  combo,
  startHref,
  shareText,
}: {
  combo: Combo;
  startHref: string;
  shareText: string;
}) {
  const math = comboDayMath(combo);
  const { gaps, minutes, km } = comboWalkTotal(combo.stops);

  return (
    <aside className="stroll-route" aria-label="Stroll route">
      <div className="surface rounded-[20px] p-4 xl:p-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-cream/45">
          ROUTE
        </p>
        <p className="mt-2 text-[18px] font-semibold leading-snug tracking-[-0.03em] text-cream">
          {math.line}
        </p>
        <p className="mt-1 text-[12px] text-cream/50">
          {combo.area} · {combo.budget}
        </p>

        <ol className="mt-4">
          {combo.stops.map((stop, index) => {
            const gap = gaps[index];
            const last = index === combo.stops.length - 1;
            return (
              <li key={`${stop.candidateId ?? stop.name}-${stop.role}`} className="relative pl-9">
                <span className="absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-coral text-[11px] font-semibold text-ink">
                  {index + 1}
                </span>
                {last ? null : (
                  <span
                    className="absolute bottom-1 left-[11px] top-7 w-px bg-cream/15"
                    aria-hidden
                  />
                )}
                <p className="text-[14px] font-semibold leading-snug text-cream">
                  {stop.name}
                </p>
                <p className="mt-0.5 text-[11px] text-cream/45">{stop.area}</p>
                {stop.hoursHint ? (
                  <p
                    className={`mt-1.5 inline-flex rounded-full px-2 py-[3px] text-[11px] font-medium ${
                      stop.hoursHint.open === true
                        ? "bg-[#1e3324] text-[#8fce9a]"
                        : stop.hoursHint.open === false
                          ? "bg-cream/[0.06] text-cream/40"
                          : "bg-cream/[0.06] text-cream/55"
                    }`}
                  >
                    {stop.hoursHint.label}
                  </p>
                ) : null}
                {gap ? (
                  <p className="py-3 text-[12px] font-medium text-cream/55">
                    {gap.label}
                  </p>
                ) : last ? null : (
                  <div className="h-4" />
                )}
              </li>
            );
          })}
        </ol>

        {minutes > 0 ? (
          <p className="mt-1 border-t border-cream/10 pt-3 text-[13px] font-medium text-cream/75">
            Total walk · ~{minutes} min · {formatKm(km)}
          </p>
        ) : null}

        {startHref ? (
          <a
            href={startHref}
            target="_blank"
            rel="noreferrer"
            className="hover-bright mt-4 flex h-12 items-center justify-center gap-1.5 rounded-[14px] bg-coral text-[15px] font-semibold text-ink"
          >
            <MapsPin />
            Start this stroll
          </a>
        ) : null}

        <div className="mt-2.5 flex gap-2">
          <SaveStrollButton id={combo.id} title={combo.title} prominent />
          <ShareStrollButton
            title={combo.title}
            text={shareText}
            path={`/combo/${combo.id}`}
            prominent
          />
        </div>
      </div>
    </aside>
  );
}
