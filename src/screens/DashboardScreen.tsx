import { useEffect, useRef, useState } from 'react';
import {
  Zap,
  Mic,
  MicOff,
  Rocket,
  Flame,
  ChevronDown,
  User,
  BarChart3,
} from 'lucide-react';
import Logo from '@/components/Logo';
import AdSlot from '@/components/AdSlot';
import Paywall from '@/components/Paywall';
import AdOverlay from '@/components/AdOverlay';
import LoadingPortal from '@/components/LoadingPortal';
import { supabase } from '@/lib/supabase';
import { generateBlueprint } from '@/lib/gemini';
import { isPremium } from '@/lib/ads';
import {
  PLATFORMS,
  SLANGS,
  TONES,
  type Platform,
  type Slang,
  type Tone,
  type UserProfile,
  type LiveTrend,
  type ScriptBlueprint,
} from '@/lib/types';

interface DashboardScreenProps {
  user: UserProfile;
  trends: LiveTrend[];
  onUserUpdate: (u: UserProfile) => void;
  onBlueprintReady: (bp: ScriptBlueprint) => void;
  onSubscribe: (plan: 'monthly' | 'yearly') => void;
  onRestore: () => void;
  onNavigateAnalytics: () => void;
}

export default function DashboardScreen({
  user,
  trends,
  onUserUpdate,
  onBlueprintReady,
  onSubscribe,
  onRestore,
  onNavigateAnalytics,
}: DashboardScreenProps) {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>('TikTok');
  const [slang, setSlang] = useState<Slang>('Standard');
  const [tone, setTone] = useState<Tone>('Hype');
  const [listening, setListening] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showRewarded, setShowRewarded] = useState(false);
  const [countryFlag, setCountryFlag] = useState('🌍');

  const recognitionRef = useRef<any>(null);

  const premium = isPremium(user.entitlement_status);

  // Detect country flag via locale
  useEffect(() => {
    const locale = navigator.language || 'en-US';
    const region = locale.split('-')[1] || 'US';
    const flag = regionToFlag(region);
    setCountryFlag(flag);
  }, []);

  // Web Speech API voice-to-text
  const toggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice input not supported in this browser.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = navigator.language || 'en-US';
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setTopic(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const rechargeTokens = async () => {
    if (premium) return;
    setShowRewarded(true);
  };

  const onRewardedClose = async (completed: boolean) => {
    setShowRewarded(false);
    if (!completed) return;
    const newTokens = user.current_tokens + 3;
    const { data, error: dbError } = await supabase
      .from('users')
      .update({ current_tokens: newTokens, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();
    if (!dbError && data) {
      onUserUpdate(data as UserProfile);
    }
  };

  const mintBlueprint = async () => {
    setError(null);
    if (!topic.trim()) {
      setError('Enter a topic or use voice input first.');
      return;
    }
    if (user.current_tokens <= 0 && !premium) {
      setShowPaywall(true);
      return;
    }

    // Deduct 1 token if free user
    if (!premium) {
      const newTokens = user.current_tokens - 1;
      const { error: deductErr } = await supabase
        .from('users')
        .update({ current_tokens: newTokens, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (deductErr) {
        setError('Failed to deduct token. Try again.');
        return;
      }
      onUserUpdate({ ...user, current_tokens: newTokens });
    }

    setGenerating(true);
    try {
      const bp = await generateBlueprint({ topic, platform, slang, tone });
      onBlueprintReady(bp);
    } catch (e: any) {
      setError(e.message || 'Generation failed. Try again.');
      // Refund token on failure
      if (!premium) {
        const refund = user.current_tokens;
        await supabase
          .from('users')
          .update({ current_tokens: refund, updated_at: new Date().toISOString() })
          .eq('id', user.id);
        onUserUpdate({ ...user, current_tokens: refund });
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-obsidian pb-20">
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-neon-purple/15 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-neon-purple/50">
            <div className="flex h-full w-full items-center justify-center bg-panel">
              <User size={18} className="text-neon-cyan" />
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Creator</p>
            <p className="font-display text-sm font-semibold text-white">{user.email || 'Guest'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateAnalytics}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-panel/60 backdrop-blur-md transition hover:border-neon-cyan/40 active:scale-95"
            aria-label="Analytics"
          >
            <BarChart3 size={18} className="text-neon-cyan" />
          </button>
          <Logo size={36} showText={false} />
        </div>
      </header>

      {/* Token + flag badge */}
      <div className="relative z-10 mt-4 flex items-center justify-center gap-3 px-4">
        <span className="rounded-full border border-white/10 bg-panel/60 px-3 py-1 font-mono text-xs text-white/60 backdrop-blur-md">
          {countryFlag}
        </span>
        <div
          className="flex items-center gap-2 rounded-full border border-neon-purple/40 bg-neon-purple/10 px-4 py-1.5 backdrop-blur-md"
          style={{ boxShadow: '0 0 16px rgba(163,46,255,0.3)' }}
        >
          <span className="text-sm">🔋</span>
          <span className="font-display text-sm font-bold text-white">
            ENERGY TOKENS: {user.current_tokens}
          </span>
        </div>
      </div>

      {/* Recharge button */}
      {!premium && (
        <div className="relative z-10 mt-3 flex justify-center px-4">
          <button
            onClick={rechargeTokens}
            className="flex items-center gap-2 rounded-full border border-neon-cyan/40 bg-neon-cyan/10 px-4 py-2 font-display text-xs font-bold text-neon-cyan neon-cyan-text transition active:scale-95"
          >
            <Zap size={14} />
            RECHARGE +3 TOKENS FREE
          </button>
        </div>
      )}

      {/* Live trend ticker */}
      <div className="relative z-10 mt-5 overflow-hidden border-y border-white/5 bg-panel/40 py-2">
        <div className="flex w-max animate-ticker gap-8 whitespace-nowrap">
          {[...trends, ...trends].map((t, i) => (
            <span key={i} className="flex items-center gap-2 font-mono text-[11px] text-white/50">
              <Flame size={12} className="text-neon-purple" />
              {t.country_flag} {t.trend_text}
            </span>
          ))}
        </div>
      </div>

      {/* Main input core */}
      <main className="relative z-10 mx-auto mt-6 max-w-md space-y-4 px-4">
        {/* Topic input + voice */}
        <div className="glass rounded-2xl p-4">
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-white/40">
            Cosmic Input Core
          </label>
          <div className="flex items-end gap-2">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Describe your video idea…"
              rows={3}
              className="flex-1 resize-none rounded-xl border border-white/10 bg-obsidian/50 p-3 font-body text-sm text-white placeholder-white/30 outline-none focus:border-neon-purple/50"
            />
            <button
              onClick={toggleVoice}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition active:scale-95 ${
                listening
                  ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
              }`}
              aria-label="Voice input"
            >
              {listening ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
          </div>
        </div>

        {/* Platform grid */}
        <div className="glass rounded-2xl p-4">
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-white/40">
            Algorithm Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`rounded-xl border px-3 py-2.5 font-display text-xs font-semibold transition active:scale-95 ${
                  platform === p
                    ? 'neon-border bg-neon-purple/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Slang + Tone dropdowns */}
        <div className="grid grid-cols-2 gap-3">
          <Dropdown label="Slang" value={slang} options={SLANGS} onChange={(v) => setSlang(v as Slang)} />
          <Dropdown label="Tone" value={tone} options={TONES} onChange={(v) => setTone(v as Tone)} />
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 font-body text-xs text-red-300">
            {error}
          </p>
        )}

        {/* Mint button */}
        <button
          onClick={mintBlueprint}
          disabled={generating}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl gradient-neon py-4 font-display text-base font-bold text-obsidian transition active:scale-[0.98] disabled:opacity-50"
          style={{ boxShadow: '0 0 30px rgba(163,46,255,0.4)' }}
        >
          <Rocket size={18} className="transition group-hover:-rotate-12" />
          MINT VIRAL BLUEPRINT
        </button>
        <p className="text-center font-mono text-[10px] text-white/30">
          {premium ? 'Premium · unlimited mints' : `Costs 1 token · ${user.current_tokens} available`}
        </p>
      </main>

      {/* Persistent banner ad */}
      {!premium && (
        <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-3 pt-2">
          <AdSlot format="banner" />
        </div>
      )}

      {/* Overlays */}
      {generating && <LoadingPortal />}
      <AdOverlay open={showRewarded} format="rewarded" onClose={onRewardedClose} />
      <Paywall
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={(plan) => {
          setShowPaywall(false);
          onSubscribe(plan);
        }}
        onRestore={onRestore}
      />
    </div>
  );
}

function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="glass rounded-2xl p-3">
      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-white/40">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-white/10 bg-obsidian/50 px-3 py-2.5 font-display text-sm font-semibold text-white outline-none focus:border-neon-purple/50"
        >
          {options.map((o) => (
            <option key={o} value={o} className="bg-obsidian text-white">
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
        />
      </div>
    </div>
  );
}

function regionToFlag(region: string): string {
  if (region.length !== 2) return '🌍';
  const codePoints = region
    .toUpperCase()
    .split('')
    .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}
