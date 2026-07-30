interface LogoProps {
  size?: number;
  showText?: boolean;
}

/**
 * VibeScript AI brand mark — a CSS/SVG cyberpunk glyph.
 * Renders a holographic "VS" monogram inside a neon hex ring.
 */
export default function Logo({ size = 120, showText = true }: LogoProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer rotating hex ring */}
        <svg
          viewBox="0 0 120 120"
          className="absolute inset-0 animate-spin-slow"
          style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.5))' }}
        >
          <polygon
            points="60,6 108,33 108,87 60,114 12,87 12,33"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#A32EFF" />
              <stop offset="100%" stopColor="#00F0FF" />
            </linearGradient>
          </defs>
        </svg>
        {/* Inner counter-rotating ring */}
        <svg viewBox="0 0 120 120" className="absolute inset-0 animate-spin-rev">
          <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(163,46,255,0.35)" strokeWidth="1.5" strokeDasharray="6 10" />
        </svg>
        {/* Monogram */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-display font-bold gradient-text"
            style={{ fontSize: size * 0.32, letterSpacing: '-0.04em' }}
          >
            VS
          </span>
        </div>
        {/* Glow */}
        <div className="absolute inset-0 rounded-full bg-neon-purple/20 blur-2xl animate-pulse-glow" />
      </div>
      {showText && (
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight gradient-text">
            VibeScript AI
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan/70 neon-cyan-text">
            Viral Blueprint Engine
          </p>
        </div>
      )}
    </div>
  );
}
