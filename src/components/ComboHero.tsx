import type { ReactNode } from "react";

export function ComboHero({
  photoUrl,
  tone,
  children,
}: {
  photoUrl: string | null;
  tone: string;
  children: ReactNode;
}) {
  return (
    <div
      className="relative h-[184px] overflow-hidden bg-[#1f1b19]"
      style={{ background: tone }}
    >
      {photoUrl ? (
        // Mapillary still — local proxy, not Google photo CDN.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <span className="absolute inset-0 bg-gradient-to-t from-[#1a1614] via-[#1a1614]/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 px-3.5 pb-3 pt-8">
        {children}
      </div>
    </div>
  );
}
