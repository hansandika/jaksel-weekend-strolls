export type PackStatus = "live" | "draft";

export type HoursHint = {
  spec: string;
  label: string;
  open: boolean | null;
};

export type Stop = {
  candidateId?: string;
  name: string;
  area: string;
  role: string;
  note: string;
  lat?: number | null;
  lng?: number | null;
  googleMapsUrl: string;
  photoUrl: string | null;
  photoCredit?: string | null;
  tiktokUrl: string | null;
  hoursHint?: HoursHint | null;
};

export type Combo = {
  id: string;
  title: string;
  subtitle: string;
  vibe: string;
  duration: string;
  area: string;
  budget: string;
  tags: string[];
  tiktokUrls: string[];
  posterTones: string[];
  stops: Stop[];
  format: string;
  tip: string;
  rainNotes: string;
  rainSwapId?: string | null;
  rainSwapTitle?: string | null;
};

export type WeekendEvent = {
  name: string;
  endsOn: string;
  endsLabel: string;
  note: string;
  kind: "event" | "live";
};

export type SuggestedPairing = {
  satComboId: string;
  sunComboId: string;
  satLabel: string;
  sunLabel: string;
  label: string;
};

export type WeekendPack = {
  isoWeek: string;
  weekLabel: string;
  status: PackStatus;
  brand: string;
  title: string;
  tagline: string;
  event: WeekendEvent;
  askPlaceholder: string;
  askChips: string[];
  askHint: string;
  pairing: SuggestedPairing;
  featuredIds: string[];
  combos: Combo[];
};
