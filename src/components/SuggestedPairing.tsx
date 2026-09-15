import Link from "next/link";
import type { Combo, WeekendPack } from "@/lib/types";

export function SuggestedPairing({ pack }: { pack: WeekendPack }) {
  const sat = pack.combos.find((combo) => combo.id === pack.pairing.satComboId);
  const sun = pack.combos.find((combo) => combo.id === pack.pairing.sunComboId);

  if (!sat && !sun) return null;

  return (
    <section className="mt-7">
      <div className="mb-3">
        <p className="text-[13px] font-semibold tracking-wide text-coral">
          Suggested pairing
        </p>
        <p className="mt-1 text-[13px] leading-snug text-cream/50">
          Sat high-energy food · Sun café / soft
        </p>
      </div>
      <div className="grid gap-3">
        {sat ? <PairCard day="Sat" combo={sat} accent="coral" /> : null}
        {sun ? <PairCard day="Sun" combo={sun} accent="soft" /> : null}
      </div>
    </section>
  );
}

function PairCard({
  day,
  combo,
  accent,
}: {
  day: "Sat" | "Sun";
  combo: Combo;
  accent: "coral" | "soft";
}) {
  const photo = combo.stops.find((stop) => stop.photoUrl)?.photoUrl ?? null;
  const shell =
    accent === "coral"
      ? "border-coral/35 bg-gradient-to-br from-[#3a221c] to-[#26211e]"
      : "border-cream/12 bg-gradient-to-br from-[#2a322e] to-[#26211e]";
  const pill =
    accent === "coral"
      ? "bg-coral text-ink"
      : "bg-cream/15 text-cream";

  return (
    <Link
      href={`/combo/${combo.id}`}
      className={`block overflow-hidden rounded-[20px] border ${shell}`}
    >
      <div className="flex min-h-[108px]">
        <div className="relative w-[92px] shrink-0 overflow-hidden bg-[#1f1b19]">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          <span className="absolute inset-0 bg-[#1a1614]/25" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center px-3.5 py-3">
          <span
            className={`w-fit rounded-full px-2 py-[3px] text-[10px] font-semibold tracking-wide ${pill}`}
          >
            {day}
          </span>
          <p className="mt-1.5 text-[16px] font-semibold leading-snug tracking-[-0.02em] text-cream">
            {combo.title}
          </p>
          <p className="mt-1 text-[12px] leading-snug text-cream/55">
            {combo.stops.length} stops · {combo.vibe} · {combo.area}
          </p>
        </div>
      </div>
    </Link>
  );
}
