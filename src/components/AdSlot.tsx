import { getAdMobConfig } from '@/lib/config';

interface AdSlotProps {
  format: 'banner' | 'app-open';
  hidden?: boolean;
}

/**
 * AdMob banner / app-open ad placement scaffold.
 *
 * In a native Capacitor build this container would mount the
 * @capacitor-community/admob Banner view. In the web build it renders a
 * labelled placeholder so ad placement is visible and reviewable.
 */
export default function AdSlot({ format, hidden }: AdSlotProps) {
  if (hidden) return null;
  const cfg = getAdMobConfig();

  return (
    <div className="w-full">
      <div className="relative h-[56px] w-full overflow-hidden rounded-lg border border-white/10 bg-panel/60 backdrop-blur-md">
        <div className="absolute inset-0 shimmer-bg animate-shimmer" />
        <div className="relative flex h-full items-center justify-center gap-2 px-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">
            Ad
          </span>
          <span className="font-mono text-[10px] text-neon-cyan/50">
            {format === 'banner' ? cfg.banner : cfg.appOpen}
          </span>
        </div>
      </div>
    </div>
  );
}
