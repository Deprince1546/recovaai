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
      <path
        d="M16 1.5 29.5 9v14L16 30.5 2.5 23V9L16 1.5Z"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.3"
      />
      <path
        d="M11.5 22V10h5.2a3.9 3.9 0 0 1 .6 7.75L21 22h-3.1l-3.3-4.1h-.6V22h-2.5Zm2.5-6.3h2.5a1.85 1.85 0 0 0 0-3.7H14v3.7Z"
        fill="currentColor"
      />
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
