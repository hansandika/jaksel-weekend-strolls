const SMALL_WORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "for",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
]);

const ACRONYMS = new Set(["ac", "jdw", "mrt", "ok", "pi"]);

function formatWord(word: string, index: number, sentenceStyle: boolean): string {
  const lower = word.toLowerCase();
  if (ACRONYMS.has(lower)) return lower.toUpperCase();
  if (/[A-Z]/.test(word.slice(1))) return word;
  if (sentenceStyle) {
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return lower;
  }
  if (index > 0 && SMALL_WORDS.has(lower)) return lower;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/** Display casing for slug-ish pack fields. Does not lowercase the source string globally. */
export function displayLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const isSlug = /[-_]/.test(trimmed) && !/\s/.test(trimmed);
  const parts = trimmed.split(/[-_\s]+/).filter(Boolean);
  return parts.map((word, index) => formatWord(word, index, isSlug)).join(" ");
}
