import { useRef, useState } from 'react';
import { ArrowLeft, Copy, Save, RefreshCw, Check, Hash, FileText, Tag, TrendingUp } from 'lucide-react';
import AdSlot from '@/components/AdSlot';
import { supabase } from '@/lib/supabase';
import { isPremium } from '@/lib/ads';
import { trackEvent } from '@/lib/firebase';
import { HOOK_ANGLES } from '@/lib/types';
import type { ScriptBlueprint, UserProfile } from '@/lib/types';

interface OutputScreenProps {
  blueprint: ScriptBlueprint;
  user: UserProfile;
  onBack: () => void;
  onReRoll: () => void;
  onSaved: () => void;
}

export default function OutputScreen({
  blueprint,
  user,
  onBack,
  onReRoll,
  onSaved,
}: OutputScreenProps) {
  const [activeHook, setActiveHook] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const scriptRef = useRef<HTMLDivElement>(null);

  const premium = isPremium(user.entitlement_status);

  const copyBlueprint = async () => {
    const text = [
      `🎬 ${blueprint.title}`,
      `Platform: ${blueprint.platform} | Slang: ${blueprint.slang} | Tone: ${blueprint.tone}`,
      '',
      'HOOKS:',
      ...HOOK_ANGLES.map((h, i) => `${i + 1}. [${h.label}] ${blueprint.hooks[h.key]}`),
      '',
      'SCRIPT:',
      blueprint.script_body,
      '',
      'CAPTION:',
      blueprint.caption,
      '',
      'KEYWORDS:',
      blueprint.keywords.join(', '),
      '',
      'HASHTAGS:',
      blueprint.hashtags.join(' '),
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const saveToVault = async () => {
    const { error } = await supabase.from('scripts_vault').insert({
      uid: user.id,
      title: blueprint.title,
      platform: blueprint.platform,
      slang: blueprint.slang,
      tone: blueprint.tone,
      hooks: blueprint.hooks,
      script_body: blueprint.script_body,
      caption: blueprint.caption,
      keywords: blueprint.keywords,
      hashtags: blueprint.hashtags,
      viral_score: blueprint.viral_score ?? null,
    });
    if (!error) {
      trackEvent('blueprint_saved', { platform: blueprint.platform });
      setSaved(true);
      onSaved();
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleHookSwipe = (dir: 'left' | 'right') => {
    if (dir === 'left') {
      setActiveHook((i) => (i + 1) % HOOK_ANGLES.length);
    } else {
      setActiveHook((i) => (i - 1 + HOOK_ANGLES.length) % HOOK_ANGLES.length);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 40) {
      handleHookSwipe(diff > 0 ? 'right' : 'left');
    }
    setTouchStart(null);
  };

  const activeAngle = HOOK_ANGLES[activeHook];
  const activeLine = blueprint.hooks[activeAngle.key];

  return (
    <div className="relative min-h-screen overflow-hidden bg-obsidian pb-32">
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 right-0 h-40 w-60 rounded-full bg-neon-cyan/15 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-panel/60 p-2.5 backdrop-blur-md transition hover:border-neon-purple/40 active:scale-95"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={18} className="text-neon-cyan neon-cyan-text" />
        </button>
        <h2 className="font-display text-sm font-bold gradient-text">Cognitive Revenue Output</h2>
        <div className="w-10" />
      </header>

      {/* Title */}
      <div className="relative z-10 mt-5 px-4">
        <h1 className="font-display text-2xl font-bold leading-tight text-white">
          {blueprint.title}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2">
          {[blueprint.platform, blueprint.slang, blueprint.tone].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-panel/60 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/50 backdrop-blur-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hook deck — 5-Angle Psychological Hook Matrix */}
      <section className="relative z-10 mt-6 px-4">
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/40">
          5-Angle Psychological Hook Matrix
        </h3>
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="relative overflow-hidden rounded-2xl"
        >
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${activeHook * 100}%)` }}
          >
            {HOOK_ANGLES.map((angle, i) => (
              <div key={angle.key} className="w-full shrink-0 px-1">
                <div className="glass min-h-[160px] rounded-2xl p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 rounded-full gradient-neon px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-obsidian">
                      <span>{angle.icon}</span>
                      {angle.label}
                    </span>
                    <span className="font-mono text-[10px] text-white/30">
                      {i + 1} / {HOOK_ANGLES.length}
                    </span>
                  </div>
                  <p className="font-body text-base leading-relaxed text-white/80">
                    {blueprint.hooks[angle.key] || '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Dots */}
        <div className="mt-3 flex justify-center gap-1.5">
          {HOOK_ANGLES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveHook(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === activeHook ? 'w-6 gradient-neon' : 'w-1.5 bg-white/20'
              }`}
              aria-label={`Hook ${i + 1}`}
            />
          ))}
        </div>
        <p className="mt-2 text-center font-mono text-[9px] text-white/30">
          {activeAngle.label}: {activeLine?.slice(0, 60)}{activeLine && activeLine.length > 60 ? '…' : ''}
        </p>
      </section>

      {/* Script body */}
      <section className="relative z-10 mt-6 px-4">
        <h3 className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
          <FileText size={12} /> Production Script
        </h3>
        <div
          ref={scriptRef}
          className="glass max-h-80 overflow-y-auto rounded-2xl p-5"
        >
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-white/70">
            {blueprint.script_body || 'No script body generated.'}
          </pre>
        </div>
      </section>

      {/* Viral Score */}
      {blueprint.viral_score && (
        <section className="relative z-10 mt-4 px-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
              <TrendingUp size={12} /> Viral Score Predictor
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="34" fill="none" stroke="url(#scoreGrad)" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(blueprint.viral_score.overall / 100) * 213.6} 213.6`}
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A32EFF" />
                      <stop offset="100%" stopColor="#00F0FF" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute font-display text-2xl font-bold text-white">
                  {blueprint.viral_score.overall}
                </span>
              </div>
              <div className="flex-1 space-y-1.5">
                {[
                  { label: 'Hook Strength', val: blueprint.viral_score.hook_strength },
                  { label: 'Trend Alignment', val: blueprint.viral_score.trend_alignment },
                  { label: 'Engagement', val: blueprint.viral_score.engagement_prediction },
                  { label: 'Audience Fit', val: blueprint.viral_score.audience_fit },
                  { label: 'Novelty', val: blueprint.viral_score.novelty },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-2">
                    <span className="w-24 font-mono text-[9px] uppercase text-white/40">{m.label}</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full gradient-neon" style={{ width: `${m.val}%` }} />
                    </div>
                    <span className="w-6 text-right font-mono text-[9px] text-white/60">{m.val}</span>
                  </div>
                ))}
              </div>
            </div>
            {blueprint.viral_score.insights.length > 0 && (
              <ul className="mt-4 space-y-1.5 border-t border-white/5 pt-3">
                {blueprint.viral_score.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 font-body text-xs text-white/60">
                    <span className="mt-0.5 text-neon-cyan">→</span>
                    {insight}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Caption + keywords + hashtags */}
      <section className="relative z-10 mt-4 px-4">
        <div className="glass rounded-2xl p-4">
          <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
            Caption
          </h3>
          <p className="font-body text-sm leading-relaxed text-white/70">{blueprint.caption}</p>

          {blueprint.keywords.length > 0 && (
            <>
              <h3 className="mb-2 mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/40">
                <Tag size={11} /> Keywords
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {blueprint.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full border border-neon-purple/20 bg-neon-purple/5 px-2.5 py-0.5 font-mono text-[10px] text-neon-purple/80"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </>
          )}

          {blueprint.hashtags.length > 0 && (
            <>
              <h3 className="mb-2 mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/40">
                <Hash size={11} /> Hashtags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {blueprint.hashtags.map((h) => (
                  <span
                    key={h}
                    className="rounded-full border border-neon-cyan/20 bg-neon-cyan/5 px-2.5 py-0.5 font-mono text-[10px] text-neon-cyan/80"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Sticky macro dock */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-3">
        <div className="glass flex items-center justify-around gap-2 rounded-2xl p-2">
          <DockButton
            icon={copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
            label={copied ? 'Copied' : 'Copy'}
            onClick={copyBlueprint}
          />
          <DockButton
            icon={saved ? <Check size={18} className="text-green-400" /> : <Save size={18} />}
            label={saved ? 'Saved' : 'Save'}
            onClick={saveToVault}
          />
          <DockButton
            icon={<RefreshCw size={18} />}
            label="Re-Roll"
            onClick={onReRoll}
          />
        </div>
      </div>

      {/* Banner ad below dock */}
      {!premium && (
        <div className="fixed bottom-[68px] left-0 right-0 z-20 px-4">
          <AdSlot format="banner" />
        </div>
      )}
    </div>
  );
}

function DockButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 transition active:scale-95 hover:bg-white/5"
    >
      {icon}
      <span className="font-mono text-[9px] uppercase tracking-wider text-white/50">{label}</span>
    </button>
  );
}
