/**
 * RECOVA mark — the two offset parallelograms from the brand artwork.
 * Rendered in currentColor so it stays crisp everywhere (no asset path to break).
 */
export function RecovaMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="RECOVA mark"
    >
      <path d="M6.6 6.4h11.1l9.7 10.2H16.3L6.6 6.4Z" fill="currentColor" />
      <path d="M5 17.1h11.1l9.7 10.2H14.7L5 17.1Z" fill="currentColor" />
    </svg>
  );
}

export function RecovaLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-foreground ${className}`}>
      <RecovaMark />
      <span className="text-[0.95rem] font-medium tracking-[0.24em] uppercase">Recova</span>
    </span>
  );
}
