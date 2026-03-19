interface NexusLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function NexusLogo({ size = 40, className = "", showText = true }: NexusLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 drop-shadow-lg">
        <rect width="180" height="180" rx="40" fill="url(#nexus-grad)"/>
        <defs>
          <linearGradient id="nexus-grad" x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1"/>
            <stop offset="100%" stopColor="#9333EA"/>
          </linearGradient>
        </defs>
        <circle cx="90" cy="32" r="10" fill="white" opacity="0.95"/>
        <circle cx="148" cy="65" r="8" fill="white" opacity="0.75"/>
        <circle cx="148" cy="115" r="8" fill="white" opacity="0.75"/>
        <circle cx="90" cy="148" r="10" fill="white" opacity="0.95"/>
        <circle cx="32" cy="115" r="8" fill="white" opacity="0.75"/>
        <circle cx="32" cy="65" r="8" fill="white" opacity="0.75"/>
        <circle cx="90" cy="90" r="16" fill="white" opacity="0.98"/>
        <line x1="90" y1="32" x2="90" y2="74" stroke="white" strokeWidth="3" opacity="0.55"/>
        <line x1="148" y1="65" x2="106" y2="80" stroke="white" strokeWidth="3" opacity="0.55"/>
        <line x1="148" y1="115" x2="106" y2="100" stroke="white" strokeWidth="3" opacity="0.55"/>
        <line x1="90" y1="148" x2="90" y2="106" stroke="white" strokeWidth="3" opacity="0.55"/>
        <line x1="32" y1="115" x2="74" y2="100" stroke="white" strokeWidth="3" opacity="0.55"/>
        <line x1="32" y1="65" x2="74" y2="80" stroke="white" strokeWidth="3" opacity="0.55"/>
      </svg>
      {showText && (
        <span className="font-display font-bold text-xl tracking-tight text-foreground">Nexus</span>
      )}
    </div>
  );
}
