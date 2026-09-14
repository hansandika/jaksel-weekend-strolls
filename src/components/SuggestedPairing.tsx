import Link from "next/link";
import type { WeekendPack } from "@/lib/types";

export function SuggestedPairing({ pack }: { pack: WeekendPack }) {
  return (
    <section className="mt-5">
      <p className="text-[13px] font-semibold text-coral">Suggested pairing</p>
      <p className="mt-1.5 text-[14px] leading-relaxed text-cream/80">
        <Link
          href={`/combo/${pack.pairing.satComboId}`}
          className="hover:underline"
        >
          Sat → Blok M food flex
        </Link>
        <span className="text-cream/40"> · </span>
        <Link
          href={`/combo/${pack.pairing.sunComboId}`}
          className="hover:underline"
        >
          Sun → Café → mall → Vietnam coffee
        </Link>
      </p>
      <p className="mt-3 text-[13px] text-cream/40">Fresh pack every week</p>
    </section>
  );
}
