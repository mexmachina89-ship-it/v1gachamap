interface CapsuleIconProps {
  size?: number;
  className?: string;
}

export default function CapsuleIcon({ size = 32, className = "" }: CapsuleIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {/* Shadow */}
      <ellipse cx="50" cy="92" rx="24" ry="6" fill="rgba(0,0,0,0.12)" />

      {/* Bottom half */}
      <path d="M 12,50 Q 12,88 50,88 Q 88,88 88,50 Z" fill="#f5f0ff" />
      <path d="M 12,50 A 38,38 0 0 0 88,50 Z" fill="#f5f0ff" />

      {/* Top half */}
      <path d="M 12,50 Q 12,12 50,12 Q 88,12 88,50 Z" fill="#ff4da6" />
      <path d="M 12,50 A 38,38 0 0 1 88,50 Z" fill="#ff4da6" />

      {/* Top gradient */}
      <path d="M 12,50 Q 12,12 50,12 Q 88,12 88,50 Z" fill="url(#cTopG)" />
      <path d="M 12,50 A 38,38 0 0 1 88,50 Z" fill="url(#cTopG)" />

      {/* Bottom gradient */}
      <path d="M 12,50 Q 12,88 50,88 Q 88,88 88,50 Z" fill="url(#cBotG)" />

      {/* Seam */}
      <rect x="12" y="47" width="76" height="6" fill="white" opacity="0.25" rx="1" />
      <line x1="12" y1="48" x2="88" y2="48" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
      <line x1="12" y1="52" x2="88" y2="52" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />

      {/* Shine highlight */}
      <ellipse cx="38" cy="29" rx="14" ry="9" fill="white" opacity="0.35" transform="rotate(-20,38,29)" />

      {/* Bottom texture dots */}
      <circle cx="38" cy="66" r="2.5" fill="rgba(160,130,210,0.4)" />
      <circle cx="50" cy="72" r="2" fill="rgba(160,130,210,0.3)" />
      <circle cx="62" cy="66" r="2.5" fill="rgba(160,130,210,0.4)" />

      <defs>
        <linearGradient id="cTopG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff80c0" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#cc0066" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="cBotG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8deff" stopOpacity="0" />
          <stop offset="100%" stopColor="#c9b8f0" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
