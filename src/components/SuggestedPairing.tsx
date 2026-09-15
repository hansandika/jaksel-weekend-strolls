import Link from "next/link";
import type { Combo, WeekendPack } from "@/lib/types";
import { comboDayMath } from "@/lib/walk";

export function SuggestedPairing({ pack }: { pack: WeekendPack }) {
  const sat = pack.combos.find((combo) => combo.id === pack.pairing.satComboId);
  const sun = pack.combos.find((combo) => combo.id === pack.pairing.sunComboId);

  if (!sat && !sun) return null;

  return (
    <section className="mt-5">
      <div className="mb-2.5 flex items-end justify-between">
        <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-cream">
          Sat vs Sun
        </h2>
        <p className="text-[11px] text-cream/40">Pick a path ticket</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {sat ? (
          <TicketCard day="SAT" why="Higher-energy food cluster" combo={sat} />
        ) : null}
        {sun ? (
          <TicketCard day="SUN" why="Café / soft recovery" combo={sun} />
        ) : null}
      </div>
    </section>
  );
}

function TicketCard({
  day,
  why,
  combo,
}: {
  day: "SAT" | "SUN";
  why: string;
  combo: Combo;
}) {
  const photo = combo.stops.find((stop) => stop.photoUrl)?.photoUrl ?? null;
  const math = comboDayMath(combo);

  return (
    <Link
      href={`/combo/${combo.id}`}
      className="surface relative block aspect-[3/4] overflow-hidden rounded-[18px]"
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span
          className="absolute inset-0"
          style={{ background: combo.posterTones[0] ?? "#3a2f2c" }}
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-[#1a1614] via-[#1a1614]/55 to-[#1a1614]/15" />
      <div className="absolute inset-0 flex flex-col justify-between p-2.5">
        <span className="glass-pill w-fit rounded-full px-2 py-[3px] text-[10px] font-semibold tracking-[0.14em] text-cream">
          {day}
        </span>
        <div>
          <p className="text-[15px] font-semibold leading-snug tracking-[-0.02em] text-cream">
            {combo.title}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-cream/70">{why}</p>
          <p className="mt-1 text-[10px] leading-snug text-cream/50">{math.line}</p>
          <p className="mt-2 text-[11px] font-semibold text-coral">Open path →</p>
        </div>
      </div>
    </Link>
  );
}
