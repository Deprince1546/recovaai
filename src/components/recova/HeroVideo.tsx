import { useEffect, useRef } from "react";
import mp4Asset from "@/assets/recova-hero.mp4.asset.json";
import webmAsset from "@/assets/recova-hero.webm.asset.json";
import posterAsset from "@/assets/recova-hero-poster.jpg.asset.json";

export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    const tryPlay = () => {
      void el.play().catch(() => undefined);
    };
    tryPlay();
    document.addEventListener("touchstart", tryPlay, { once: true });
    document.addEventListener("click", tryPlay, { once: true });
    return () => {
      document.removeEventListener("touchstart", tryPlay);
      document.removeEventListener("click", tryPlay);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <video
        ref={ref}
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={posterAsset.url}
      >
        <source src={webmAsset.url} type="video/webm" />
        <source src={mp4Asset.url} type="video/mp4" />
      </video>
    </div>
  );
}
