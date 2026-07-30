import { useState } from 'react';
import { X, Check, Sparkles, RotateCw } from 'lucide-react';
import { SUBSCRIPTION_PLANS, REVENUECAT_API_KEY } from '@/lib/config';

interface PaywallProps {
  open: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'monthly' | 'yearly') => void;
  onRestore: () => void;
}

/**
 * RevenueCat subscription paywall.
 * In a native build, onSubscribe would call Purchases.purchasePackage()
 * and onRestore would call Purchases.restorePurchases().
 */
export default function Paywall({ open, onClose, onSubscribe, onRestore }: PaywallProps) {
  const [restoring, setRestoring] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);

  if (!open) return null;

  const handleRestore = () => {
    setRestoring(true);
    setRestoreMsg(null);
    // Integration point: RevenueCat Purchases.restorePurchases()
    void REVENUECAT_API_KEY;
    setTimeout(() => {
      setRestoring(false);
      setRestoreMsg('No active purchases found on this account.');
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-obsidian/80 backdrop-blur-md sm:items-center">
      <div className="glass animate-rise w-full max-w-md rounded-t-3xl p-6 sm:rounded-3xl">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-neon">
              <Sparkles size={18} className="text-obsidian" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold gradient-text">Unlock VibeScript Pro</h2>
              <p className="font-body text-sm text-white/50">Infinite blueprints. Zero ads. Priority AI.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Close paywall"
          >
            <X size={20} />
          </button>
        </div>

        {/* Plans */}
        <div className="space-y-3">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => onSubscribe(plan.id)}
              className={`relative w-full rounded-2xl border p-4 text-left transition active:scale-[0.98] ${
                plan.highlight
                  ? 'neon-border bg-neon-purple/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-neon-cyan px-3 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-obsidian whitespace-nowrap">
                  {plan.badge}
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-display font-semibold text-white">{plan.label}</span>
                  <p className="mt-0.5 font-mono text-[10px] text-white/40">
                    or {plan.priceSecondary}{plan.period}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl font-bold text-white">{plan.price}</span>
                  <span className="block font-mono text-[10px] text-white/40">{plan.period}</span>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm text-white/70">
                    <Check size={14} className="mt-0.5 shrink-0 text-neon-cyan" />
                    {perk}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Restore purchases */}
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <button
            onClick={handleRestore}
            disabled={restoring}
            className="flex items-center gap-1.5 font-body text-xs text-white/50 underline-offset-4 transition hover:text-white disabled:opacity-50"
          >
            {restoring ? (
              <>
                <RotateCw size={12} className="animate-spin" /> Restoring…
              </>
            ) : (
              <>
                <RotateCw size={12} /> Restore Purchases
              </>
            )}
          </button>
          {restoreMsg && (
            <p className="font-mono text-[10px] text-white/30">{restoreMsg}</p>
          )}
        </div>

        <p className="mt-3 text-center font-mono text-[10px] text-white/30">
          Cancel anytime · RevenueCat SDK
        </p>
      </div>
    </div>
  );
}
