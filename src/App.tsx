import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import AdOverlay from '@/components/AdOverlay';
import AdSlot from '@/components/AdSlot';
import ErrorBoundary from '@/components/ErrorBoundary';
import { supabase } from '@/lib/supabase';
import { isPremium } from '@/lib/ads';
import { trackEvent, trackScreenView, identifyUser } from '@/lib/firebase';
import type { UserProfile, LiveTrend, ScriptBlueprint } from '@/lib/types';

const SplashScreen = lazy(() => import('@/screens/SplashScreen'));
const DashboardScreen = lazy(() => import('@/screens/DashboardScreen'));
const OutputScreen = lazy(() => import('@/screens/OutputScreen'));
const AnalyticsScreen = lazy(() => import('@/screens/AnalyticsScreen'));

type Screen = 'splash' | 'dashboard' | 'output' | 'analytics';

function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-neon-purple/30 border-t-neon-purple" />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [trends, setTrends] = useState<LiveTrend[]>([]);
  const [blueprint, setBlueprint] = useState<ScriptBlueprint | null>(null);
  const [showAppOpenAd, setShowAppOpenAd] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShowAppOpenAd(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: userData, error: userErr } = await supabase
          .from('users')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (userErr) throw userErr;
        const { data: trendData, error: trendErr } = await supabase
          .from('global_live_trends')
          .select('*')
          .order('updated_at', { ascending: false });
        if (trendErr) throw trendErr;
        if (cancelled) return;
        setUser(userData as UserProfile);
        setTrends((trendData as LiveTrend[]) ?? []);
        if (userData) {
          identifyUser((userData as UserProfile).id, {
            entitlement: (userData as UserProfile).entitlement_status,
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    trackScreenView(screen);
  }, [screen]);

  const premium = user ? isPremium(user.entitlement_status) : false;

  const handleEnterUniverse = useCallback(() => {
    trackEvent('enter_universe_clicked');
    if (premium) {
      setScreen('dashboard');
      return;
    }
    setShowInterstitial(true);
  }, [premium]);

  const onInterstitialClose = useCallback(() => {
    setShowInterstitial(false);
    trackEvent('ad_shown', { format: 'interstitial' });
    setScreen('dashboard');
  }, []);

  const onAppOpenClose = useCallback(() => {
    setShowAppOpenAd(false);
    trackEvent('ad_shown', { format: 'app_open' });
  }, []);

  const handleSubscribe = useCallback(
    async (plan: 'monthly' | 'yearly') => {
      if (!user) return;
      trackEvent('subscribe_clicked', { plan });
      const updated: UserProfile = {
        ...user,
        entitlement_status: 'premium_pro',
        subscription_plan: plan,
        updated_at: new Date().toISOString(),
      };
      setUser(updated);
      await supabase
        .from('users')
        .update({
          entitlement_status: 'premium_pro',
          subscription_plan: plan,
          updated_at: updated.updated_at,
        })
        .eq('id', user.id);
    },
    [user],
  );

  const handleRestore = useCallback(async () => {
    if (!user) return;
    trackEvent('restore_clicked');
  }, [user]);

  const handleReRoll = useCallback(() => {
    setBlueprint(null);
    setScreen('dashboard');
  }, []);

  const logAnalyticsEvent = useCallback((eventType: string, metadata?: Record<string, unknown>) => {
    trackEvent(eventType, metadata);
    supabase.from('analytics_events').insert({ event_type: eventType, event_metadata: metadata ?? {} }).then();
  }, []);

  if (loading) return <Fallback />;

  if (error || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-obsidian px-6 text-center">
        <p className="font-display text-lg font-bold text-white">Something went wrong</p>
        <p className="font-body text-sm text-white/50">{error || 'No user profile found.'}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<Fallback />}>
        {screen === 'splash' && <SplashScreen onEnter={handleEnterUniverse} />}

        {screen === 'dashboard' && (
          <DashboardScreen
            user={user}
            trends={trends}
            onUserUpdate={setUser}
            onBlueprintReady={(bp) => {
              setBlueprint(bp);
              logAnalyticsEvent('blueprint_minted', { platform: bp.platform });
              setScreen('output');
            }}
            onSubscribe={handleSubscribe}
            onRestore={handleRestore}
            onNavigateAnalytics={() => setScreen('analytics')}
          />
        )}

        {screen === 'output' && blueprint && (
          <OutputScreen
            blueprint={blueprint}
            user={user}
            onBack={() => setScreen('dashboard')}
            onReRoll={handleReRoll}
            onSaved={() => logAnalyticsEvent('blueprint_saved')}
          />
        )}

        {screen === 'analytics' && <AnalyticsScreen onBack={() => setScreen('dashboard')} />}

        {!premium && (
          <>
            <AdOverlay open={showAppOpenAd} format="interstitial" onClose={onAppOpenClose} />
            <AdOverlay open={showInterstitial} format="interstitial" onClose={onInterstitialClose} />
          </>
        )}

        {screen === 'splash' && !premium && (
          <div className="fixed bottom-4 left-0 right-0 z-10 px-4">
            <AdSlot format="app-open" />
          </div>
        )}
      </Suspense>
    </ErrorBoundary>
  );
}
