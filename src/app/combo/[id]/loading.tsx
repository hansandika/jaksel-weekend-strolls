export default function ComboLoading() {
  return (
    <main className="phone-shell" aria-busy="true" aria-label="Loading stroll">
      <div className="h-5 w-16 animate-pulse rounded-full bg-cream/10" />
      <div className="mt-4 h-8 w-3/4 animate-pulse rounded-full bg-cream/10" />
      <div className="mt-3 h-10 w-full animate-pulse rounded-[14px] bg-cream/10" />
      <div className="mt-4 aspect-[9/16] w-full animate-pulse rounded-[16px] bg-cream/10" />
    </main>
  );
}
