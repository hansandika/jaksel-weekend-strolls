import Link from "next/link";

export default function CandidateMissing() {
  return (
    <main className="phone-shell">
      <p className="text-[13px] font-medium text-coral">Editor</p>
      <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.03em] text-cream">
        Candidate missing
      </h1>
      <p className="mt-2 text-[14px] text-cream/55">
        That row is not in the queue.
      </p>
      <Link
        href="/admin/queue"
        className="mt-5 flex h-11 items-center justify-center rounded-[12px] bg-coral text-[15px] font-semibold text-ink"
      >
        Back to queue
      </Link>
    </main>
  );
}
