interface NexusLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function NexusLogo({ size = 40, className = "", showText = true }: NexusLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        style={{ filter: "drop-shadow(0 2px 8px rgba(79,70,229,0.4))" }}
      >
        <defs>
          <linearGradient id="nx-bg" x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect width="180" height="180" rx="44" fill="url(#nx-bg)" />
        <line x1="46" y1="34" x2="46" y2="146" stroke="white" strokeWidth="26" strokeLinecap="round" />
        <line x1="134" y1="34" x2="134" y2="146" stroke="white" strokeWidth="26" strokeLinecap="round" />
        <line x1="46" y1="34" x2="134" y2="146" stroke="white" strokeWidth="26" strokeLinecap="round" />
        <circle cx="90" cy="90" r="9" fill="white" opacity="0.3" />
      </svg>
      {showText && (
        <span
          className="font-display font-bold tracking-tight text-foreground"
          style={{ fontSize: Math.round(size * 0.48) }}
        >
          Nexus
        </span>
      )}
    </div>
  );
}
