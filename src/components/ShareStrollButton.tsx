"use client";

export function ShareStrollButton({
  title,
  text,
  path,
  prominent = false,
}: {
  title: string;
  text: string;
  path: string;
  prominent?: boolean;
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
      className={`glass-pill hover-bright flex items-center rounded-full font-semibold text-cream ${
        prominent ? "h-11 flex-1 justify-center px-4 text-[13px]" : "h-8 px-2.5 text-[12px]"
      }`}
    >
      Share
    </button>
  );
}
