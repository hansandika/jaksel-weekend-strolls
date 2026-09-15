import { MapsPin } from "./MapsPin";

export function StartStrollBar({ href }: { href: string }) {
  return (
    <div className="sticky bottom-0 z-30 -mx-4 mt-5 bg-gradient-to-t from-ink via-ink/95 to-ink/0 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-8">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="flex h-12 items-center justify-center gap-1.5 rounded-[14px] bg-coral text-[15px] font-semibold text-ink"
      >
        <MapsPin />
        Start this stroll
      </a>
    </div>
  );
}
