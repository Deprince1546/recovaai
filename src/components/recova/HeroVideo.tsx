import { useEffect, useRef } from "react";
const MP4_SRC = "/media/recova-hero.mp4";
const WEBM_SRC = "/media/recova-hero.webm";
const POSTER_SRC = "/media/recova-hero-poster.jpg";

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
        poster={POSTER_SRC}
      >
        <source src={WEBM_SRC} type="video/webm" />
        <source src={MP4_SRC} type="video/mp4" />
      </video>
    </div>
  );
}
