export default function ComboLoading() {
  return (
    <main className="phone-shell combo-page" aria-busy="true" aria-label="Loading stroll">
      <div className="combo-layout">
        <div>
          <div className="h-5 w-16 animate-pulse rounded-full bg-cream/10" />
          <div className="mt-4 h-8 w-3/4 animate-pulse rounded-full bg-cream/10" />
          <div className="mt-3 h-10 w-full animate-pulse rounded-[14px] bg-cream/10 lg:hidden" />
          <div className="mt-4 aspect-[9/16] w-full animate-pulse rounded-[16px] bg-cream/10 md:aspect-auto md:h-[500px] md:w-[281px] xl:h-[540px] xl:w-[304px]" />
        </div>
        <div className="stroll-route">
          <div className="h-80 animate-pulse rounded-[20px] bg-cream/10" />
        </div>
      </div>
    </main>
  );
}
