export type PackStatus = "live" | "draft";

export type Stop = {
  name: string;
  area: string;
  role: string;
  note: string;
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
  kind: "event";
};

export type SuggestedPairing = {
  satComboId: string;
  sunComboId: string;
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
