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
  photos,
}: {
  urls: string[];
  tones: string[];
  photos?: Array<string | null>;
}) {
  const tiles = urls.slice(0, 3);

  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-t-[20px]">
      {tiles.map((url, index) => {
        const photo = photos?.[index] ?? null;
        return (
          <div
            key={url}
            className="relative flex h-[96px] items-center justify-center overflow-hidden"
            style={{ background: tones[index] ?? tones[0] ?? "#3a2f2c" }}
          >
            {photo ? (
              // Street-level still from Mapillary; gradient fallback if the proxy 404s.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <span className="absolute inset-0 bg-[#1a1614]/35" />
            <span className="relative">
              <PlayGlyph />
            </span>
          </div>
        );
      })}
    </div>
  );
}
