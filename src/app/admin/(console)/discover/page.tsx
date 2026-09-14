import { AdminChrome } from "@/components/AdminChrome";
import { listDiscoveryRuns } from "@/lib/admin-api";
import { DiscoverForm } from "./DiscoverForm";

export const dynamic = "force-dynamic";

type DiscoverPageProps = {
  searchParams: Promise<{
    ok?: string;
    inserted?: string;
    found?: string;
    skipped?: string;
    error?: string;
  }>;
};

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const params = await searchParams;
  const runs = await listDiscoveryRuns().catch(() => []);

  return (
    <AdminChrome
      title="Run discovery"
      subtitle="Free OpenStreetMap Overpass — no Google Places key."
    >
      {params.ok ? (
        <p className="mt-4 rounded-[16px] bg-card px-4 py-3 text-[14px] text-[#8dce9a]">
          OSM pass finished. Found {params.found ?? "0"}, inserted{" "}
          {params.inserted ?? "0"}, skipped {params.skipped ?? "0"} already in
          the queue.
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-4 rounded-[16px] bg-card px-4 py-3 text-[14px] text-coral">
          {params.error}
        </p>
      ) : null}

      <DiscoverForm />

      <section className="mt-6">
        <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-cream">
          Recent runs
        </h2>
        <div className="mt-3 space-y-2.5">
          {runs.length === 0 ? (
            <p className="text-[13px] text-cream/45">No runs yet.</p>
          ) : (
            runs.map((run) => (
              <article
                key={run.id}
                className="rounded-[16px] bg-card px-4 py-3.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[14px] font-semibold text-cream">
                    {run.areas.join(", ") || "areas"}
                  </p>
                  <span
                    className={`text-[11px] font-semibold ${
                      run.status === "succeeded"
                        ? "text-[#8dce9a]"
                        : run.status === "failed"
                        ? "text-coral"
                        : "text-cream/50"
                    }`}
                  >
                    {run.status}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-cream/45">
                  found {run.found_count} · inserted {run.inserted_count} · skipped{" "}
                  {run.skipped_count}
                </p>
                {run.error ? (
                  <p className="mt-1 text-[12px] text-coral">{run.error}</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </AdminChrome>
  );
}
