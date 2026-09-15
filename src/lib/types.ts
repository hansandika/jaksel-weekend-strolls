export type PackStatus = "live" | "draft";

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
  tiktokUrl: string | null;
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
  tip: string;
  rainNotes: string;
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
  combos: Combo[];
};
