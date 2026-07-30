import { useState } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import Logo from '@/components/Logo';

interface SplashScreenProps {
  onEnter: () => void;
}

/**
 * Screen 1 — The Cosmic Launcher.
 * Splash + onboarding with a pulsing holographic core and the brand logo.
 */
export default function SplashScreen({ onEnter }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    // The interstitial ad is triggered by the parent (App) after this callback.
    setTimeout(onEnter, 600);
  };

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-obsidian px-6 py-12 transition-all duration-500 ${
        exiting ? 'opacity-0 translate-x-[-100%]' : 'opacity-100'
      }`}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-neon-purple/20 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full bg-neon-cyan/15 blur-3xl animate-float" />
      </div>

      {/* Logo top */}
      <div className="z-10 mt-6 animate-rise">
        <Logo size={140} />
      </div>

      {/* Holographic core */}
      <div className="z-10 flex flex-1 items-center justify-center">
        <HolographicCore />
      </div>

      {/* CTA */}
      <div className="z-10 w-full max-w-sm animate-rise" style={{ animationDelay: '0.2s' }}>
        <p className="mb-6 text-center font-body text-sm leading-relaxed text-white/50">
          The AI engine that mints viral video blueprints from a single thought.
          Psychological hooks, production scripts, captions — all generated.
        </p>
        <button
          onClick={handleEnter}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl gradient-neon py-4 font-display text-base font-bold text-obsidian transition active:scale-[0.98]"
          style={{ boxShadow: '0 0 30px rgba(163,46,255,0.5)' }}
        >
          <Sparkles size={18} className="transition group-hover:rotate-12" />
          ENTER CREATOR UNIVERSE
          <ChevronRight size={18} className="transition group-hover:translate-x-1" />
        </button>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-white/30">
          An interstitial may play before entry
        </p>
      </div>
    </div>
  );
}

/** Animated 3D CSS holographic wireframe visualizer core. */
function HolographicCore() {
  return (
    <div className="relative h-64 w-64">
      {/* Outer orbit */}
      <div className="absolute inset-0 rounded-full border border-neon-purple/30 animate-spin-slow">
        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-neon-purple shadow-[0_0_12px_#A32EFF]" />
      </div>
      {/* Mid orbit */}
      <div className="absolute inset-8 rounded-full border border-neon-cyan/30 animate-spin-rev">
        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-neon-cyan shadow-[0_0_12px_#00F0FF]" />
      </div>
      {/* Inner orbit */}
      <div className="absolute inset-16 rounded-full border border-white/20 animate-spin-slow" />
      {/* Core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full gradient-neon blur-md animate-pulse-glow" />
          <div className="absolute inset-0 rounded-full gradient-neon opacity-80" />
          <div className="absolute inset-2 rounded-full bg-obsidian/60 backdrop-blur-sm" />
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold text-white neon-cyan-text">
            AI
          </div>
        </div>
      </div>
      {/* Wireframe lines */}
      <svg viewBox="0 0 256 256" className="absolute inset-0 opacity-20">
        <line x1="128" y1="0" x2="128" y2="256" stroke="#A32EFF" strokeWidth="0.5" />
        <line x1="0" y1="128" x2="256" y2="128" stroke="#00F0FF" strokeWidth="0.5" />
        <circle cx="128" cy="128" r="100" fill="none" stroke="#A32EFF" strokeWidth="0.5" strokeDasharray="4 8" />
      </svg>
    </div>
  );
}
