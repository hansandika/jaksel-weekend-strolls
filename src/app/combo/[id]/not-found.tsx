import Link from "next/link";

export default function ComboNotFound() {
  return (
    <main className="phone-shell">
      <p className="text-[13px] text-cream/55">Jaksel</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.03em]">
        Combo not in this pack
      </h1>
      <p className="mt-2 text-[14px] text-cream/55">
        W38 is live with four combos. Pick one from the hub.
      </p>
      <Link
        href="/"
        className="mt-5 flex h-11 items-center justify-center rounded-[12px] bg-coral text-[15px] font-semibold text-ink"
      >
        Back to hub
      </Link>
    </main>
  );
}
