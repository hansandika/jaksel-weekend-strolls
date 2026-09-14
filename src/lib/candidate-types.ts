export type CandidateStatus = "new" | "approved" | "rejected" | "need_tiktok";

export type Candidate = {
  id: string;
  status: CandidateStatus;
  name: string;
  area_label: string | null;
  area_key: string | null;
  source: string;
  source_id: string | null;
  lat: number | null;
  lng: number | null;
  osm_type: string | null;
  tags: string[];
  place_types: string[];
  draft_why: string | null;
  draft_tip: string | null;
  tiktok_candidates: unknown;
  tiktok_urls: string[];
  raw: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CandidateCounts = {
  new: number;
  approved: number;
  need_tiktok: number;
  rejected: number;
};

export type DiscoveryRun = {
  id: string;
  status: "running" | "succeeded" | "failed";
  areas: string[];
  place_types: string[];
  found_count: number;
  inserted_count: number;
  skipped_count: number;
  error: string | null;
  summary: Record<string, unknown> | null;
  created_at: string;
  finished_at: string | null;
};

export type QueueFilter = "all" | "cafe" | "food" | "mall" | "out";
