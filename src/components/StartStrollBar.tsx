import { MapsPin } from "./MapsPin";

export function StartStrollBar({ href }: { href: string }) {
  return (
    <div className="pointer-events-none fixed bottom-0 left-1/2 z-30 w-full max-w-[390px] -translate-x-1/2 bg-gradient-to-t from-ink via-ink/95 to-transparent px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-8">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="pointer-events-auto flex h-12 items-center justify-center gap-1.5 rounded-[14px] bg-coral text-[15px] font-semibold text-ink"
      >
        <MapsPin />
        Start this stroll
      </a>
    </div>
  );
}
