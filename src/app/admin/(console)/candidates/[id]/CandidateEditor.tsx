import { saveCandidateDraft, setOneStatus } from "@/app/admin/actions";
import type { Candidate } from "@/lib/candidate-types";
import { candidatePhotoSrc } from "@/lib/candidate-photo";
import { TikTokPlayer } from "@/components/TikTokPlayer";
import { isPlayableTikTokUrl, parseTikTokVideo } from "@/lib/tiktok";

function osmHref(candidate: Candidate): string | null {
  if (!candidate.source_id) return null;
  return `https://www.openstreetmap.org/${candidate.source_id}`;
}

function mapHref(candidate: Candidate): string | null {
  if (candidate.lat == null || candidate.lng == null) return null;
  return `https://www.openstreetmap.org/?mlat=${candidate.lat}&mlon=${candidate.lng}#map=18/${candidate.lat}/${candidate.lng}`;
}

export function CandidateEditor({ candidate }: { candidate: Candidate }) {
  const osm = osmHref(candidate);
  const map = mapHref(candidate);
  const photo = candidatePhotoSrc(candidate);
  const playableTikToks = (candidate.tiktok_urls ?? []).filter(isPlayableTikTokUrl);

  return (
    <div className="mt-4 space-y-3">
      {photo ? (
        <div className="overflow-hidden rounded-[16px] bg-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt={`Street photo near ${candidate.name}`}
            className="h-[180px] w-full object-cover"
          />
          <p className="px-4 py-2 text-[11px] text-cream/40">
            Mapillary street photo · CC-BY-SA
          </p>
        </div>
      ) : (
        <div
          className="flex h-[120px] items-center justify-center rounded-[16px] text-[12px] text-cream/45"
          style={{ background: "linear-gradient(160deg, #4A342C, #2f3f48)" }}
        >
          No Mapillary photo yet
        </div>
      )}
      <section className="rounded-[16px] bg-card px-4 py-3.5">
        <div className="flex flex-wrap gap-1.5">
          <Pill>{candidate.status.replaceAll("_", " ")}</Pill>
          {candidate.place_types.map((type) => (
            <Pill key={type}>{type}</Pill>
          ))}
          {candidate.tags.map((tag) => (
            <Pill key={tag}>{tag}</Pill>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-cream/55">
          {candidate.lat?.toFixed(5)}, {candidate.lng?.toFixed(5)}
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-[13px] text-coral">
          {osm ? (
            <a href={osm} target="_blank" rel="noreferrer">
              OpenStreetMap
            </a>
          ) : null}
          {map ? (
            <a href={map} target="_blank" rel="noreferrer">
              Map pin
            </a>
          ) : null}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <StatusButton id={candidate.id} status="approved" label="Approve" primary />
        <StatusButton id={candidate.id} status="need_tiktok" label="Need TikTok" />
        <StatusButton id={candidate.id} status="rejected" label="Reject" />
        <StatusButton id={candidate.id} status="new" label="Back to new" />
      </div>

      <form action={saveCandidateDraft} className="space-y-3">
        <input type="hidden" name="id" value={candidate.id} />
        <label className="block text-[12px] text-cream/50" htmlFor="draft_why">
          Draft why
        </label>
        <textarea
          id="draft_why"
          name="draft_why"
          defaultValue={candidate.draft_why ?? ""}
          rows={4}
          className="w-full rounded-[16px] bg-card px-4 py-3 text-[14px] leading-relaxed text-cream focus:outline-none"
        />
        <label className="block text-[12px] text-cream/50" htmlFor="draft_tip">
          Draft tip
        </label>
        <textarea
          id="draft_tip"
          name="draft_tip"
          defaultValue={candidate.draft_tip ?? ""}
          rows={3}
          className="w-full rounded-[16px] bg-card px-4 py-3 text-[14px] leading-relaxed text-cream focus:outline-none"
        />
        <label className="block text-[12px] text-cream/50" htmlFor="tiktok_urls">
          TikTok URLs (optional, one per line — no scrape in M2)
        </label>
        <textarea
          id="tiktok_urls"
          name="tiktok_urls"
          defaultValue={(candidate.tiktok_urls ?? []).join("\n")}
          rows={3}
          className="w-full rounded-[16px] bg-card px-4 py-3 text-[13px] text-cream focus:outline-none"
        />
        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center rounded-[12px] bg-coral text-[15px] font-semibold text-ink"
        >
          Save draft
        </button>
      </form>

      {playableTikToks.length > 0 ? (
        <section className="space-y-2">
          <p className="text-[12px] text-cream/50">TikTok embeds</p>
          <div className="flex gap-2 overflow-x-auto">
            {playableTikToks.slice(0, 1).map((url) => {
              const parsed = parseTikTokVideo(url);
              if (!parsed) return null;
              return (
                <TikTokPlayer
                  key={url}
                  videoId={parsed.videoId}
                  handle={parsed.handle}
                  watchUrl={parsed.url}
                  autoplay
                  className="h-[248px] w-[158px] shrink-0 rounded-[16px] bg-[#111]"
                />
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Pill({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-[#1f1b19] px-2.5 py-1 text-[11px] text-cream/70">
      {children}
    </span>
  );
}

function StatusButton({
  id,
  status,
  label,
  primary,
}: {
  id: string;
  status: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <form action={setOneStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={
          primary
            ? "rounded-full bg-coral px-4 py-2 text-[13px] font-semibold text-ink"
            : "rounded-full border border-cream/15 px-4 py-2 text-[13px] font-semibold text-cream"
        }
      >
        {label}
      </button>
    </form>
  );
}
