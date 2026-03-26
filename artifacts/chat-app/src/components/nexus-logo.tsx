interface FlareLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

const SPARKS = [
  { cx: 90,  cy: 14,  r: 3,   color: "#14B8A6", delay: "0s"    },
  { cx: 152, cy: 38,  r: 2.5, color: "#06B6D4", delay: "0.3s"  },
  { cx: 166, cy: 90,  r: 2,   color: "#fff",    delay: "0.6s"  },
  { cx: 152, cy: 142, r: 2.5, color: "#14B8A6", delay: "0.9s"  },
  { cx: 90,  cy: 166, r: 3,   color: "#06B6D4", delay: "1.2s"  },
  { cx: 28,  cy: 142, r: 2,   color: "#fff",    delay: "1.5s"  },
  { cx: 14,  cy: 90,  r: 2.5, color: "#14B8A6", delay: "1.8s"  },
  { cx: 28,  cy: 38,  r: 2,   color: "#06B6D4", delay: "2.1s"  },
];

export function NexusLogo({ size = 40, className = "", showText = true, animated = false }: FlareLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0${animated ? " flare-bolt-animated" : ""}`}
        style={{ filter: "drop-shadow(0 2px 8px rgba(20,184,166,0.45))", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="fl-bg" x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="fl-spark" x1="90" y1="20" x2="90" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <rect width="180" height="180" rx="44" fill="url(#fl-bg)" />
        <polygon points="100,22 58,98 86,98 78,158 122,82 94,82" fill="url(#fl-spark)" />

        {animated && SPARKS.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill={s.color}
            className="flare-spark-dot"
            style={{ animationDelay: s.delay }}
          />
        ))}
      </svg>

      {showText && (
        <span
          className="font-display font-bold tracking-tight text-foreground"
          style={{ fontSize: Math.round(size * 0.48) }}
        >
          Flare
        </span>
      )}
    </div>
  );
}
