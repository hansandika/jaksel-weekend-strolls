/** ISO week label for the public hub and admin chrome. Independent of pack JSON. */
export function isoWeekParts(date = new Date()): {
  isoWeek: string;
  weekLabel: string;
  year: number;
} {
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const year = utc.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  const ww = String(week).padStart(2, "0");
  return { isoWeek: `${year}-W${ww}`, weekLabel: `W${ww}`, year };
}
