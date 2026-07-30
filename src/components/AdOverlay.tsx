import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AdOverlayProps {
  open: boolean;
  format: 'interstitial' | 'rewarded';
  onClose: (completed: boolean) => void;
}

/**
 * Fullscreen ad overlay scaffold for interstitial and rewarded formats.
 * In a native build this would be replaced by the Capacitor AdMob plugin's
 * fullscreen ad activity. Web build: simulates the ad with a skip/close timer.
 */
export default function AdOverlay({ open, format, onClose }: AdOverlayProps) {
  const [countdown, setCountdown] = useState(format === 'interstitial' ? 5 : 8);
  const [canClose, setCanClose] = useState(format === 'interstitial');

  useEffect(() => {
    if (!open) return;
    setCountdown(format === 'interstitial' ? 5 : 8);
    setCanClose(format === 'interstitial');
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setCanClose(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, format]);

  if (!open) return null;

  const handleClose = () => {
    const completed = format === 'rewarded' ? true : true;
    onClose(completed);
  };

  return (
    <div className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-obsidian">
      {/* Simulated ad creative */}
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -left-20 top-10 h-60 w-60 rounded-full bg-neon-purple blur-3xl" />
          <div className="absolute right-0 bottom-20 h-60 w-60 rounded-full bg-neon-cyan blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 px-8 text-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
            {format === 'rewarded' ? 'Rewarded Video' : 'Interstitial'}
          </span>
          <p className="font-display text-2xl font-bold text-white">
            {format === 'rewarded' ? 'Watch to earn +3 Tokens' : 'Your blueprint is loading…'}
          </p>
          <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full gradient-neon transition-all duration-1000"
              style={{ width: `${((countdown === 0 ? 1 : 1 - countdown / (format === 'interstitial' ? 5 : 8)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Close / reward button */}
      <div className="absolute right-4 top-4 z-20">
        {canClose ? (
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-mono text-xs text-white backdrop-blur-md transition active:scale-95"
          >
            {format === 'rewarded' ? 'Claim +3' : 'Skip'} <X size={14} />
          </button>
        ) : (
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs text-white/40">
            {countdown}s
          </span>
        )}
      </div>
    </div>
  );
}
