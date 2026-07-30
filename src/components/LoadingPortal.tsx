import { useEffect, useState } from 'react';

const PHASES = [
  'Initializing quantum AI loop…',
  'Scanning global trend radar…',
  'Synthesizing psychological hooks…',
  'Minting viral blueprint…',
  'Finalizing production script…',
];

/**
 * Fullscreen loading portal shown while Gemini generates a blueprint.
 */
export default function LoadingPortal() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % PHASES.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-obsidian/95 backdrop-blur-xl">
      {/* Portal rings */}
      <div className="relative h-48 w-48">
        <div className="absolute inset-0 rounded-full border-2 border-neon-purple/40 animate-spin-slow" />
        <div className="absolute inset-4 rounded-full border-2 border-neon-cyan/40 animate-spin-rev" />
        <div className="absolute inset-8 rounded-full border border-white/20 animate-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full gradient-neon blur-md animate-pulse-glow" />
        </div>
      </div>
      <p className="mt-8 font-mono text-sm text-neon-cyan neon-cyan-text">
        {PHASES[phase]}
      </p>
      <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/2 gradient-neon animate-shimmer" />
      </div>
    </div>
  );
}
