"use client";

export function ShareStrollButton({
  title,
  text,
  path,
}: {
  title: string;
  text: string;
  path: string;
}) {
  const share = async () => {
    const url = `${window.location.origin}${path}`;
    const payload = { title, text, url };
    try {
      if (typeof navigator.share === "function") {
        const allowed =
          typeof navigator.canShare !== "function" || navigator.canShare(payload);
        if (allowed) {
          await navigator.share(payload);
          return;
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
    }
    const wa = `https://wa.me/?text=${encodeURIComponent(`${title}\n${text}\n${url}`)}`;
    window.open(wa, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-label={`Share ${title}`}
      className="glass-pill flex h-8 items-center rounded-full px-2.5 text-[12px] font-semibold text-cream"
    >
      Share
    </button>
  );
}
