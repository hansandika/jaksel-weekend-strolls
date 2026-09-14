import { AdminChrome } from "@/components/AdminChrome";
import { listCandidates } from "@/lib/admin-api";
import { getLivePack } from "@/lib/pack";
import { QueueClient } from "./QueueClient";
import type { QueueFilter } from "@/lib/candidate-types";

export const dynamic = "force-dynamic";

const FILTERS: QueueFilter[] = ["all", "cafe", "food", "mall", "out"];

function isFilter(value: string | undefined): value is QueueFilter {
  return FILTERS.includes(value as QueueFilter);
}

function areaSummary(
  candidates: { area_key: string | null }[],
): string {
  const keys = new Set(candidates.map((item) => item.area_key));
  const labels: string[] = [];
  if (keys.has("blok_m")) labels.push("Blok M");
  if (keys.has("cipete")) labels.push("Cipete");
  if (keys.has("tebet")) labels.push("Tebet");
  if (keys.has("fatmawati_pi")) labels.push("PI");
  if (keys.has("alam_sutera")) labels.push("Alam Sutera");
  return labels.length > 0 ? labels.join(" + ") : "run discovery";
}

type QueuePageProps = {
  searchParams: Promise<{ filter?: string; notice?: string }>;
};

export default async function QueuePage({ searchParams }: QueuePageProps) {
  const params = await searchParams;
  const filter = isFilter(params.filter) ? params.filter : "all";
  const pack = getLivePack();
  const { candidates, counts } = await listCandidates(
    filter === "all" ? "" : `?filter=${filter}`,
  );

  return (
    <AdminChrome
      title="Candidate Queue"
      subtitle={`Places discovery · ${pack.weekLabel} · ${areaSummary(candidates)}`}
    >
      <QueueClient
        candidates={candidates}
        counts={counts}
        filter={filter}
        notice={params.notice}
      />
    </AdminChrome>
  );
}
