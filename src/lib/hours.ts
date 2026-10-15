import type { Candidate } from "./candidate-types";

const DAY_INDEX: Record<string, number> = {
  su: 0,
  sun: 0,
  sunday: 0,
  mo: 1,
  mon: 1,
  monday: 1,
  tu: 2,
  tue: 2,
  tuesday: 2,
  we: 3,
  wed: 3,
  wednesday: 3,
  th: 4,
  thu: 4,
  thursday: 4,
  fr: 5,
  fri: 5,
  friday: 5,
  sa: 6,
  sat: 6,
  saturday: 6,
};

export type HoursHint = {
  spec: string;
  label: string;
  open: boolean | null;
};

function jakartaNow(date = new Date()): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Sun";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0",
  );
  const day = DAY_INDEX[weekday.slice(0, 3).toLowerCase()] ?? 0;
  return { day, minutes: hour * 60 + minute };
}

function parseClock(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function dayRange(token: string): number[] | null {
  const trimmed = token.trim().toLowerCase();
  if (!trimmed || trimmed === "ph") return null;
  if (trimmed.includes("-")) {
    const [startToken, endToken] = trimmed.split("-");
    const start = DAY_INDEX[startToken ?? ""];
    const end = DAY_INDEX[endToken ?? ""];
    if (start === undefined || end === undefined) return null;
    const days: number[] = [];
    let cursor = start;
    for (let step = 0; step < 7; step += 1) {
      days.push(cursor);
      if (cursor === end) break;
      cursor = (cursor + 1) % 7;
    }
    return days;
  }
  const day = DAY_INDEX[trimmed];
  return day === undefined ? null : [day];
}

function intervalOpen(
  start: number,
  end: number,
  minutes: number,
): boolean {
  if (end === start) return true;
  if (end > start) return minutes >= start && minutes < end;
  return minutes >= start || minutes < end;
}

function untilLabel(end: number): string {
  const hour = Math.floor(end / 60) % 24;
  const minute = end % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Pragmatic OSM opening_hours reader for common Jaksel tags (24/7, Mo-Su
 * ranges, split weekday/weekend). Not a full opening_hours library.
 */
export function hoursHintFromSpec(
  spec: string,
  now = new Date(),
): HoursHint {
  const trimmed = spec.trim();
  const { day, minutes } = jakartaNow(now);
  if (/^24\/7$/i.test(trimmed)) {
    return { spec: trimmed, label: "Open now · 24/7", open: true };
  }

  const rules = trimmed.split(";").map((rule) => rule.trim()).filter(Boolean);
  let matched = false;
  let open: boolean | null = null;
  let closesAt: number | null = null;

  for (const rule of rules) {
    if (/^off$/i.test(rule)) continue;
    const offMatch = rule.match(/^([A-Za-z]{2}(?:-[A-Za-z]{2})?(?:\s*,\s*[A-Za-z]{2}(?:-[A-Za-z]{2})?)*)\s+off$/i);
    if (offMatch) {
      const days = offMatch[1]
        .split(",")
        .flatMap((token) => dayRange(token) ?? []);
      if (days.includes(day)) {
        matched = true;
        open = false;
      }
      continue;
    }

    const match = rule.match(
      /^(?:([A-Za-z]{2}(?:-[A-Za-z]{2})?(?:\s*,\s*[A-Za-z]{2}(?:-[A-Za-z]{2})?)*)\s+)?(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/,
    );
    if (!match) continue;
    const days = match[1]
      ? match[1].split(",").flatMap((token) => dayRange(token) ?? [])
      : [0, 1, 2, 3, 4, 5, 6];
    if (!days.includes(day)) continue;
    const start = parseClock(match[2]);
    const end = parseClock(match[3]);
    if (start === null || end === null) continue;
    matched = true;
    if (intervalOpen(start, end, minutes)) {
      open = true;
      closesAt = end;
      break;
    }
    open = false;
  }

  if (!matched) {
    return {
      spec: trimmed,
      label: `Hours: ${trimmed}`,
      open: null,
    };
  }
  if (open) {
    return {
      spec: trimmed,
      label: closesAt !== null ? `Open now · until ${untilLabel(closesAt)}` : "Open now",
      open: true,
    };
  }
  return { spec: trimmed, label: "Closed now", open: false };
}

export function openingHoursFromRaw(
  raw: Record<string, unknown> | null | undefined,
): string | null {
  if (!raw) return null;
  const visit = (node: unknown, depth: number): string | null => {
    if (!node || depth > 6) return null;
    if (typeof node !== "object") return null;
    const record = node as Record<string, unknown>;
    const direct = record.opening_hours;
    if (typeof direct === "string" && direct.trim()) return direct.trim();
    for (const value of Object.values(record)) {
      const found = visit(value, depth + 1);
      if (found) return found;
    }
    return null;
  };
  return visit(raw, 0);
}

export function openingHoursFromCandidate(candidate: Candidate): string | null {
  const fromRaw = openingHoursFromRaw(candidate.raw);
  if (fromRaw) return fromRaw;
  const why = candidate.draft_why ?? "";
  const match = why.match(/Hours:\s*([^.]+)/i);
  return match?.[1]?.trim() || null;
}
