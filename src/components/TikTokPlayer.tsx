"use client";

import { useEffect, useRef } from "react";
import {
  TIKTOK_IFRAME_ALLOW,
  tiktokEmbedSrc,
  tiktokPlayerCommand,
} from "@/lib/tiktok";

export function TikTokPlayer({
  videoId,
  handle,
  autoplay,
  watchUrl,
  className,
  compact = false,
}: {
  videoId: string;
  handle: string;
  autoplay: boolean;
  watchUrl?: string;
  className?: string;
  compact?: boolean;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const href =
    watchUrl ?? `https://www.tiktok.com/@${handle}/video/${videoId}`;

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !autoplay) return;

    const send = (type: "mute" | "play" | "pause") => {
      frame.contentWindow?.postMessage(tiktokPlayerCommand(type), "*");
    };

    const onMessage = (event: MessageEvent) => {
      const data = event.data as {
        type?: string;
        value?: unknown;
        "x-tiktok-player"?: boolean;
      } | null;
      if (!data || data["x-tiktok-player"] !== true) return;
      if (data.type === "onPlayerReady") {
        send("mute");
        send("play");
      }
      if (data.type === "onPlayerError" || data.type === "onError") {
        send("mute");
        send("play");
      }
    };

    window.addEventListener("message", onMessage);
    return () => {
      send("pause");
      window.removeEventListener("message", onMessage);
    };
  }, [autoplay, videoId]);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <iframe
        ref={frameRef}
        src={tiktokEmbedSrc(videoId, {
          autoplay,
          muted: true,
          musicInfo: !compact,
          description: !compact,
        })}
        title={`TikTok @${handle}`}
        className="pointer-events-none absolute inset-0 h-full w-full border-0"
        allow={TIKTOK_IFRAME_ALLOW}
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        tabIndex={-1}
      />
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="absolute inset-0 z-10"
        aria-label={`Open @${handle} on TikTok`}
      />
    </div>
  );
}
