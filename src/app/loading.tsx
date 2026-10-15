export default function HubLoading() {
  return (
    <main className="phone-shell" aria-busy="true" aria-label="Loading weekend strolls">
      <div className="h-8 w-40 animate-pulse rounded-full bg-cream/10" />
      <div className="mt-3 h-11 w-full animate-pulse rounded-full bg-cream/10" />
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <div className="aspect-[3/4] animate-pulse rounded-[18px] bg-cream/10" />
        <div className="aspect-[3/4] animate-pulse rounded-[18px] bg-cream/10" />
      </div>
      <div className="mt-5 h-[280px] animate-pulse rounded-[20px] bg-cream/10" />
    </main>
  );
}
