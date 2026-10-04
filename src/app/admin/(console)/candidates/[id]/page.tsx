import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminChrome } from "@/components/AdminChrome";
import { getCandidate } from "@/lib/admin-api";
import { CandidateEditor } from "./CandidateEditor";

export const dynamic = "force-dynamic";

type CandidatePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function CandidatePage({
  params,
  searchParams,
}: CandidatePageProps) {
  const { id } = await params;
  const { saved } = await searchParams;
  let candidate;
  try {
    candidate = await getCandidate(id);
  } catch {
    notFound();
  }

  return (
    <AdminChrome
      title={candidate.name}
      subtitle={`${candidate.area_label ?? "Unknown area"} · ${candidate.source}/${candidate.source_id}`}
    >
      <div className="mt-3">
        <Link href="/admin/queue" className="text-[13px] text-cream/70">
          ← Queue
        </Link>
      </div>
      {saved ? (
        <p className="mt-3 text-[13px] text-[#8dce9a]">Draft saved.</p>
      ) : null}
      <CandidateEditor candidate={candidate} />
    </AdminChrome>
  );
}
