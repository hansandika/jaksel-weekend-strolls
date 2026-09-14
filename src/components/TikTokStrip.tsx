export function PlayGlyph() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium tracking-wide text-cream/90">
      <svg
        width="9"
        height="10"
        viewBox="0 0 9 10"
        fill="currentColor"
        aria-hidden
      >
        <path d="M8.2 4.13a1 1 0 0 1 0 1.74L1.7 9.64A1 1 0 0 1 .2 8.77V1.23A1 1 0 0 1 1.7.36l6.5 3.77Z" />
      </svg>
      TikTok
    </span>
  );
}

export function TikTokStrip({
  urls,
  tones,
}: {
  urls: string[];
  tones: string[];
}) {
  const tiles = urls.slice(0, 3);

  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-t-[20px]">
      {tiles.map((url, index) => (
        <div
          key={url}
          className="flex h-[96px] items-center justify-center"
          style={{ background: tones[index] ?? tones[0] ?? "#3a2f2c" }}
        >
          <PlayGlyph />
        </div>
      ))}
    </div>
  );
}
