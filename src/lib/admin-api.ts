import type {
  Candidate,
  CandidateCounts,
  DiscoveryRun,
} from "./candidate-types";

const FUNCTIONS_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`;

function adminHeaders(): HeadersInit {
  const secret = process.env.ADMIN_SECRET;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!secret || !anon || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing ADMIN_SECRET or Supabase public env");
  }
  return {
    "Content-Type": "application/json",
    "x-admin-secret": secret,
    apikey: anon,
    Authorization: `Bearer ${anon}`,
  };
}

async function adminFetch<T>(
  fn: "discover" | "candidates",
  init?: RequestInit & { search?: string },
): Promise<T> {
  const url = `${FUNCTIONS_URL}/${fn}${init?.search ?? ""}`;
  const response = await fetch(url, {
    ...init,
    headers: { ...adminHeaders(), ...init?.headers },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload.error === "string" ? payload.error : `Edge ${fn} ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export async function listCandidates(search = ""): Promise<{
  candidates: Candidate[];
  counts: CandidateCounts;
}> {
  return adminFetch("candidates", { search });
}

export async function getCandidate(id: string): Promise<Candidate> {
  const payload = await adminFetch<{ candidate: Candidate }>("candidates", {
    search: `?id=${encodeURIComponent(id)}`,
  });
  return payload.candidate;
}

export async function setCandidateStatus(ids: string[], status: string) {
  return adminFetch<{ updated: number }>("candidates", {
    method: "POST",
    body: JSON.stringify({ action: "set_status", ids, status }),
  });
}

export async function updateCandidate(
  id: string,
  patch: {
    draft_why?: string;
    draft_tip?: string;
    status?: string;
    tiktok_urls?: string[];
  },
) {
  return adminFetch<{ candidate: Candidate }>("candidates", {
    method: "POST",
    body: JSON.stringify({ action: "update", id, ...patch }),
  });
}

export async function listDiscoveryRuns(): Promise<DiscoveryRun[]> {
  const payload = await adminFetch<{ runs: DiscoveryRun[] }>("discover");
  return payload.runs ?? [];
}

export async function runDiscovery(
  areas: string[],
  placeTypes: string[],
  elements?: unknown[],
) {
  return adminFetch<{
    run: DiscoveryRun;
    found: number;
    inserted: number;
    skipped: number;
    source: string;
  }>("discover", {
    method: "POST",
    body: JSON.stringify({
      areas,
      place_types: placeTypes,
      ...(elements ? { elements } : {}),
    }),
  });
}
