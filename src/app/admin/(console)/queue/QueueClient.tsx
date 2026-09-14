"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { bulkSetStatus } from "@/app/admin/actions";
import type {
  Candidate,
  CandidateCounts,
  QueueFilter,
} from "@/lib/candidate-types";

const FILTER_CHIPS: { key: QueueFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "cafe", label: "Café" },
  { key: "food", label: "Food" },
  { key: "mall", label: "Mall" },
  { key: "out", label: "Out of Jaksel" },
];

function statusLabel(status: Candidate["status"]): string {
  if (status === "need_tiktok") return "need TT";
  return status;
}

function StatusBadge({ status }: { status: Candidate["status"] }) {
  const styles: Record<Candidate["status"], string> = {
    new: "bg-coral text-cream",
    approved: "bg-[#3f7a4c] text-cream",
    need_tiktok: "bg-[#6a3d32] text-coral",
    rejected: "bg-[#3a3330] text-cream/50",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-[5px] text-[11px] font-semibold ${styles[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}

export function QueueClient({
  candidates,
  counts,
  filter,
  notice,
}: {
  candidates: Candidate[];
  counts: CandidateCounts;
  filter: QueueFilter;
  notice?: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        <CountPill label={`${counts.new} new`} tone="coral" />
        <CountPill label={`${counts.approved} approved`} tone="green" />
        <CountPill label={`${counts.need_tiktok} needTikTok`} tone="brown" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTER_CHIPS.map((chip) => {
          const active = filter === chip.key;
          return (
            <Link
              key={chip.key}
              href={chip.key === "all" ? "/admin/queue" : `/admin/queue?filter=${chip.key}`}
              className={`rounded-full px-3 py-1.5 text-[12px] ${
                active
                  ? "bg-coral font-semibold text-cream"
                  : "bg-[#2b2522] text-cream/70"
              }`}
            >
              {chip.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <form action={bulkSetStatus}>
          <input type="hidden" name="ids" value={selected.join(",")} />
          <input type="hidden" name="status" value="approved" />
          <button
            type="submit"
            disabled={selected.length === 0}
            className="rounded-full bg-coral px-4 py-2 text-[13px] font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Approve selected
          </button>
        </form>
        <form action={bulkSetStatus}>
          <input type="hidden" name="ids" value={selected.join(",")} />
          <input type="hidden" name="status" value="rejected" />
          <button
            type="submit"
            disabled={selected.length === 0}
            className="rounded-full border border-cream/15 px-4 py-2 text-[13px] font-semibold text-cream disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reject
          </button>
        </form>
        <Link
          href="/admin/discover"
          className="ml-auto rounded-full border border-cream/15 px-4 py-2 text-[13px] font-semibold text-cream"
        >
          Run discovery
        </Link>
      </div>

      {notice === "select" ? (
        <p className="mt-3 text-[13px] text-coral">Select at least one row.</p>
      ) : null}

      <div className="mt-4 space-y-2.5">
        {candidates.length === 0 ? (
          <p className="rounded-[18px] bg-card px-4 py-6 text-[14px] text-cream/55">
            No candidates yet. Run OSM discovery for Blok M + Cipete.
          </p>
        ) : (
          candidates.map((candidate) => (
            <article
              key={candidate.id}
              className="flex items-center gap-3 rounded-[18px] bg-card px-3.5 py-3.5"
            >
              <input
                type="checkbox"
                checked={selectedSet.has(candidate.id)}
                onChange={() => toggle(candidate.id)}
                aria-label={`Select ${candidate.name}`}
                className="h-[18px] w-[18px] shrink-0 accent-[#ff5a3c]"
              />
              <Link
                href={`/admin/candidates/${candidate.id}`}
                className="min-w-0 flex-1"
              >
                <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-cream">
                  {candidate.name}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-cream/45">
                  {candidate.area_label}
                  {candidate.place_types.length > 0
                    ? ` · ${candidate.place_types.join(", ")}`
                    : ""}
                </p>
              </Link>
              <StatusBadge status={candidate.status} />
            </article>
          ))
        )}
      </div>

      <p className="mt-5 text-[12px] text-cream/40">
        Tap row → detail · checkbox → bulk actions
      </p>
      <p className="mt-1 text-[11px] text-cream/30">
        Places from OpenStreetMap. Not Google Places.
      </p>
    </>
  );
}

function CountPill({
  label,
  tone,
}: {
  label: string;
  tone: "coral" | "green" | "brown";
}) {
  const cls =
    tone === "coral"
      ? "bg-coral text-cream"
      : tone === "green"
      ? "bg-[#3f7a4c] text-cream"
      : "bg-[#6a3d32] text-coral";
  return (
    <span className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}
