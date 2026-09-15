"use client";

import { useFormStatus } from "react-dom";
import { enrichPhotos, startDiscovery } from "@/app/admin/actions";
import {
  DISCOVERY_AREAS,
  DISCOVERY_PLACE_TYPES,
} from "@/lib/discovery-areas";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center rounded-[12px] bg-coral text-[15px] font-semibold text-ink disabled:opacity-60"
    >
      {pending ? "Querying OpenStreetMap…" : "Run OSM discovery"}
    </button>
  );
}

export function DiscoverForm() {
  return (
    <form action={startDiscovery} className="mt-5 space-y-5">
      <fieldset>
        <legend className="text-[13px] font-semibold text-cream">Areas</legend>
        <div className="mt-2 space-y-2">
          {DISCOVERY_AREAS.map((area) => (
            <label
              key={area.key}
              className="flex items-center gap-3 rounded-[14px] bg-card px-3.5 py-3 text-[14px] text-cream"
            >
              <input
                type="checkbox"
                name="areas"
                value={area.key}
                defaultChecked={area.defaultOn}
                className="h-[18px] w-[18px] accent-[#ff5a3c]"
              />
              <span className="flex-1">{area.label}</span>
              {area.outOfJaksel ? (
                <span className="text-[11px] text-coral">out of Jaksel</span>
              ) : null}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[13px] font-semibold text-cream">
          Place types
        </legend>
        <div className="mt-2 space-y-2">
          {DISCOVERY_PLACE_TYPES.map((type) => (
            <label
              key={type.key}
              className="flex items-center gap-3 rounded-[14px] bg-card px-3.5 py-3 text-[14px] text-cream"
            >
              <input
                type="checkbox"
                name="place_types"
                value={type.key}
                defaultChecked={type.defaultOn}
                className="h-[18px] w-[18px] accent-[#ff5a3c]"
              />
              {type.label}
            </label>
          ))}
        </div>
      </fieldset>

      <p className="text-[12px] leading-relaxed text-cream/45">
        Dedupes on OSM type/id across Overpass, Geofabrik, and HOT (same
        <code> source_id</code> is skipped). Existing approved/rejected rows are
        never overwritten. No Google Maps, no TikTok scrape, no auto-publish.
      </p>
      <SubmitButton />
    </form>
  );
}

export function PhotoEnrichForm({
  tokenConfigured,
}: {
  tokenConfigured: boolean;
}) {
  return (
    <form action={enrichPhotos} className="mt-3">
      <PhotoSubmit tokenConfigured={tokenConfigured} />
    </form>
  );
}

function PhotoSubmit({ tokenConfigured }: { tokenConfigured: boolean }) {
  const { pending } = useFormStatus();
  const disabled = pending || !tokenConfigured;
  return (
    <button
      type="submit"
      disabled={disabled}
      title={
        tokenConfigured
          ? undefined
          : "MAPILLARY_ACCESS_TOKEN is not injected in this app yet"
      }
      className="flex h-11 w-full items-center justify-center rounded-[12px] border border-cream/15 text-[15px] font-semibold text-cream disabled:opacity-60"
    >
      {pending
        ? "Looking up Mapillary…"
        : tokenConfigured
          ? "Enrich Mapillary photos (40)"
          : "Mapillary token not injected"}
    </button>
  );
}
