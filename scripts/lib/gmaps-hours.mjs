const OSM = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const DAY_INDEX = {
  mo: 0,
  mon: 0,
  monday: 0,
  senin: 0,
  tu: 1,
  tue: 1,
  tues: 1,
  tuesday: 1,
  selasa: 1,
  we: 2,
  wed: 2,
  wednesday: 2,
  rabu: 2,
  th: 3,
  thu: 3,
  thur: 3,
  thurs: 3,
  thursday: 3,
  kamis: 3,
  fr: 4,
  fri: 4,
  friday: 4,
  jumat: 4,
  "jum'at": 4,
  sa: 5,
  sat: 5,
  saturday: 5,
  sabtu: 5,
  su: 6,
  sun: 6,
  sunday: 6,
  minggu: 6,
};

const TIME_RANGE =
  /(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\s*(?:-|–|—|to)+\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?/i;

const OSM_SPEC =
  /^(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?(?:,(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?)* \d{2}:\d{2}-\d{2}:\d{2}(?:; (?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?(?:,(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?)* \d{2}:\d{2}-\d{2}:\d{2})*$/;

function pad(value) {
  return String(value).padStart(2, "0");
}

function clock(hourText, minuteText, meridiem) {
  let hour = Number(hourText);
  const minute = minuteText ? Number(minuteText) : 0;
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || minute > 59) return null;
  const marker = meridiem?.toLowerCase();
  if (marker === "pm" && hour < 12) hour += 12;
  if (marker === "am" && hour === 12) hour = 0;
  if (hour === 24 && minute === 0) return "24:00";
  if (hour > 23) return null;
  return `${pad(hour)}:${pad(minute)}`;
}

function findTimeRange(text) {
  const match = String(text).match(TIME_RANGE);
  if (!match) return null;
  const start = clock(match[1], match[2], match[3]);
  const end = clock(match[4], match[5], match[6]);
  if (!start || !end) return null;
  return `${start}-${end}`;
}

function dayToken(token) {
  const cleaned = token.trim().toLowerCase().replace(/\./g, "");
  if (!cleaned) return [];
  if (/daily|setiap hari|every day|24 hours|24 jam/.test(cleaned)) {
    return [0, 1, 2, 3, 4, 5, 6];
  }
  if (cleaned.includes("-")) {
    const [startName, endName] = cleaned.split("-").map((part) => part.trim());
    const start = DAY_INDEX[startName];
    const end = DAY_INDEX[endName];
    if (start === undefined || end === undefined) return [];
    const days = [];
    let cursor = start;
    for (let step = 0; step < 7; step += 1) {
      days.push(cursor);
      if (cursor === end) break;
      cursor = (cursor + 1) % 7;
    }
    return days;
  }
  const day = DAY_INDEX[cleaned];
  return day === undefined ? [] : [day];
}

function parseDayList(text) {
  const days = [];
  for (const token of String(text).split(/[,&/]+/)) {
    days.push(...dayToken(token));
  }
  return [...new Set(days)];
}

function formatDays(days) {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  if (sorted.length === 0) return "";
  if (sorted.length === 7) return "Mo-Su";
  const runs = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let index = 1; index <= sorted.length; index += 1) {
    const day = sorted[index];
    if (day === prev + 1) {
      prev = day;
      continue;
    }
    runs.push(start === prev ? OSM[start] : `${OSM[start]}-${OSM[prev]}`);
    start = day;
    prev = day;
  }
  return runs.join(",");
}

function splitRules(text) {
  const chunks = String(text).split(/\s*;\s*|\n+/);
  const rules = [];
  for (const chunk of chunks) {
    const parts = chunk.split(
      /,\s*(?=(?:mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun|mo|tu|we|th|fr|sa|su|senin|selasa|rabu|kamis|jumat|sabtu|minggu)\b)/i,
    );
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed) rules.push(trimmed);
    }
  }
  return rules;
}

function fromRules(text) {
  const byRange = new Map();
  for (const rule of splitRules(text)) {
    if (/closed|tutup|libur/i.test(rule) && !findTimeRange(rule)) continue;
    const range = findTimeRange(rule);
    if (!range) continue;
    const dayText = rule.replace(TIME_RANGE, " ");
    const days = parseDayList(dayText);
    if (days.length === 0) continue;
    if (!byRange.has(range)) byRange.set(range, new Set());
    for (const day of days) byRange.get(range).add(day);
  }
  if (byRange.size === 0) return null;
  return [...byRange.entries()]
    .map(([range, days]) => `${formatDays([...days])} ${range}`)
    .join("; ");
}

function fromDayMap(value) {
  const rules = [];
  for (const [key, hours] of Object.entries(value)) {
    if (typeof hours === "string") {
      rules.push(`${key} ${hours}`);
      continue;
    }
    if (!hours || typeof hours !== "object") continue;
    const open = hours.open ?? hours.from ?? hours.start;
    const close = hours.close ?? hours.to ?? hours.end;
    if (open && close) rules.push(`${key} ${open}-${close}`);
  }
  if (rules.length === 0) return null;
  return fromRules(rules.join("; "));
}

export function toOsmOpeningHours(input) {
  if (input == null) return null;
  if (typeof input === "object") return fromDayMap(input);
  const text = String(input).replace(/\s+/g, " ").trim();
  if (!text) return null;
  if (OSM_SPEC.test(text)) return text;
  if (/open 24 hours|buka 24 jam/i.test(text)) return "Mo-Su 00:00-24:00";
  if (/^(daily|setiap hari|every day)\b/i.test(text)) {
    const range = findTimeRange(text);
    return range ? `Mo-Su ${range}` : null;
  }
  return fromRules(text);
}
