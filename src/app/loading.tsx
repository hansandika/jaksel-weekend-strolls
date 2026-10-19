export default function HubLoading() {
  return (
    <main className="phone-shell" aria-busy="true" aria-label="Loading weekend strolls">
      <div className="h-8 w-40 animate-pulse rounded-full bg-cream/10" />
      <div className="mt-3 h-11 w-full animate-pulse rounded-full bg-cream/10" />
      <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-[minmax(0,1.6fr)_minmax(240px,0.8fr)]">
        <div className="aspect-[3/4] animate-pulse rounded-[18px] bg-cream/10 lg:aspect-[5/3]" />
        <div className="aspect-[3/4] animate-pulse rounded-[18px] bg-cream/10 lg:aspect-[5/3]" />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="h-[280px] animate-pulse rounded-[20px] bg-cream/10 md:aspect-[3/4] md:h-auto" />
        <div className="hidden h-[280px] animate-pulse rounded-[20px] bg-cream/10 md:block md:aspect-[3/4] md:h-auto" />
        <div className="hidden aspect-[3/4] animate-pulse rounded-[20px] bg-cream/10 lg:block" />
        <div className="hidden aspect-[3/4] animate-pulse rounded-[20px] bg-cream/10 xl:block" />
      </div>
    </main>
  );
}
