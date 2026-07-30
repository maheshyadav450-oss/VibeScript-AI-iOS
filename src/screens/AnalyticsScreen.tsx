import { useEffect, useState } from 'react';
import { ArrowLeft, BarChart3, TrendingUp, Award, Zap, Calendar, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { CalendarEntry } from '@/lib/types';

interface AnalyticsScreenProps {
  onBack: () => void;
}

interface EventCount {
  event_type: string;
  count: number;
}

export default function AnalyticsScreen({ onBack }: AnalyticsScreenProps) {
  const [events, setEvents] = useState<EventCount[]>([]);
  const [calendar, setCalendar] = useState<CalendarEntry[]>([]);
  const [newEvent, setNewEvent] = useState('');
  const [newPlatform, setNewPlatform] = useState('TikTok');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [evRes, calRes] = await Promise.all([
      supabase.from('analytics_events').select('event_type').order('created_at', { ascending: false }).limit(500),
      supabase.from('content_calendar').select('*').order('scheduled_date', { ascending: true }),
    ]);
    if (evRes.data) {
      const counts = evRes.data.reduce<Record<string, number>>((acc, row) => {
        const t = (row as { event_type: string }).event_type;
        acc[t] = (acc[t] ?? 0) + 1;
        return acc;
      }, {});
      setEvents(Object.entries(counts).map(([event_type, count]) => ({ event_type, count })));
    }
    if (calRes.data) setCalendar(calRes.data as CalendarEntry[]);
    setLoading(false);
  };

  const addEntry = async () => {
    if (!newEvent.trim()) return;
    const { data } = await supabase
      .from('content_calendar')
      .insert({ title: newEvent, platform: newPlatform, scheduled_date: newDate })
      .select()
      .single();
    if (data) {
      setCalendar((c) => [...c, data as CalendarEntry].sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date)));
      setNewEvent('');
    }
  };

  const deleteEntry = async (id: string) => {
    await supabase.from('content_calendar').delete().eq('entry_id', id);
    setCalendar((c) => c.filter((e) => e.entry_id !== id));
  };

  const cycleStatus = async (entry: CalendarEntry) => {
    const next = entry.status === 'idea' ? 'draft' : entry.status === 'draft' ? 'published' : 'idea';
    await supabase.from('content_calendar').update({ status: next }).eq('entry_id', entry.entry_id);
    setCalendar((c) => c.map((e) => (e.entry_id === entry.entry_id ? { ...e, status: next } : e)));
  };

  const totalEvents = events.reduce((s, e) => s + e.count, 0);
  const maxCount = Math.max(...events.map((e) => e.count), 1);

  const EVENT_META: Record<string, { label: string; icon: typeof BarChart3; color: string }> = {
    screen_view: { label: 'Screen Views', icon: BarChart3, color: 'text-neon-cyan' },
    blueprint_minted: { label: 'Blueprints Minted', icon: Zap, color: 'text-neon-purple' },
    blueprint_saved: { label: 'Saved to Vault', icon: Award, color: 'text-green-400' },
    ad_shown: { label: 'Ads Shown', icon: TrendingUp, color: 'text-yellow-400' },
    paywall_opened: { label: 'Paywall Opens', icon: TrendingUp, color: 'text-orange-400' },
    subscribe_clicked: { label: 'Subscribe Taps', icon: Zap, color: 'text-pink-400' },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-obsidian pb-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 right-0 h-40 w-60 rounded-full bg-neon-cyan/10 blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-4 pt-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-panel/60 p-2.5 backdrop-blur-md transition hover:border-neon-purple/40 active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft size={18} className="text-neon-cyan neon-cyan-text" />
        </button>
        <h2 className="font-display text-sm font-bold gradient-text">Creator Analytics</h2>
        <div className="w-10" />
      </header>

      <div className="relative z-10 mx-auto mt-6 max-w-md space-y-5 px-4">
        {/* Summary */}
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
            <BarChart3 size={12} /> Lifetime Activity
          </h3>
          {loading ? (
            <div className="h-20 animate-pulse rounded-xl bg-white/5" />
          ) : totalEvents === 0 ? (
            <p className="font-body text-sm text-white/40">No activity yet. Start minting blueprints!</p>
          ) : (
            <div className="space-y-2.5">
              {events.map((e) => {
                const meta = EVENT_META[e.event_type];
                const Icon = meta?.icon ?? BarChart3;
                return (
                  <div key={e.event_type} className="flex items-center gap-3">
                    <Icon size={14} className={meta?.color ?? 'text-white/50'} />
                    <span className="flex-1 font-body text-sm text-white/70">
                      {meta?.label ?? e.event_type}
                    </span>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full gradient-neon transition-all"
                        style={{ width: `${(e.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-xs text-white/60">{e.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Content Calendar */}
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
            <Calendar size={12} /> Content Calendar
          </h3>

          {/* Add entry */}
          <div className="mb-4 space-y-2">
            <input
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
              placeholder="New content idea…"
              className="w-full rounded-xl border border-white/10 bg-obsidian/50 p-3 font-body text-sm text-white placeholder-white/30 outline-none focus:border-neon-purple/50"
            />
            <div className="flex gap-2">
              <select
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                className="flex-1 appearance-none rounded-xl border border-white/10 bg-obsidian/50 p-2.5 font-mono text-xs text-white outline-none"
              >
                {['TikTok', 'YouTube Shorts', 'Instagram Reels', 'X / Twitter'].map((p) => (
                  <option key={p} value={p} className="bg-obsidian">{p}</option>
                ))}
              </select>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-obsidian/50 p-2.5 font-mono text-xs text-white outline-none"
              />
              <button
                onClick={addEntry}
                className="flex items-center justify-center rounded-xl gradient-neon px-3 transition active:scale-95"
                aria-label="Add entry"
              >
                <Plus size={16} className="text-obsidian" />
              </button>
            </div>
          </div>

          {/* Entries */}
          {calendar.length === 0 ? (
            <p className="font-body text-sm text-white/40">No scheduled content yet.</p>
          ) : (
            <div className="space-y-2">
              {calendar.map((entry) => (
                <div
                  key={entry.entry_id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <button
                    onClick={() => cycleStatus(entry)}
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider transition ${
                      entry.status === 'idea'
                        ? 'bg-yellow-400/10 text-yellow-400'
                        : entry.status === 'draft'
                          ? 'bg-neon-cyan/10 text-neon-cyan'
                          : 'bg-green-400/10 text-green-400'
                    }`}
                  >
                    {entry.status}
                  </button>
                  <div className="flex-1">
                    <p className="font-body text-sm text-white/80">{entry.title}</p>
                    <p className="font-mono text-[10px] text-white/30">
                      {entry.scheduled_date} · {entry.platform}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.entry_id)}
                    className="text-white/30 transition hover:text-red-400"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
