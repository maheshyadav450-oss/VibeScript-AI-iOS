/**
 * VibeScript AI — service configuration.
 *
 * Secrets are read from Vite env vars (sourced from .env). They are never
 * hardcoded in source so they can be rotated without touching app code.
 *
 * AdMob + RevenueCat are native-only SDKs (Capacitor). In this web build they
 * are represented by integration scaffolding: the config below is the single
 * source of truth that a native build's adapters would consume.
 */

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
export const GEMINI_MODEL = 'gemini-1.5-flash';

export const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY as string;

export interface AdMobConfig {
  appId: string;
  appOpen: string;
  banner: string;
  interstitial: string;
  rewarded: string;
}

export const ADMOB_ANDROID: AdMobConfig = {
  appId: import.meta.env.VITE_ADMOB_ANDROID_APP_ID as string,
  appOpen: import.meta.env.VITE_ADMOB_ANDROID_APP_OPEN as string,
  banner: import.meta.env.VITE_ADMOB_ANDROID_BANNER as string,
  interstitial: import.meta.env.VITE_ADMOB_ANDROID_INTERSTITIAL as string,
  rewarded: import.meta.env.VITE_ADMOB_ANDROID_REWARDED as string,
};

export const ADMOB_IOS: AdMobConfig = {
  appId: import.meta.env.VITE_ADMOB_IOS_APP_ID as string,
  appOpen: import.meta.env.VITE_ADMOB_IOS_APP_OPEN as string,
  banner: import.meta.env.VITE_ADMOB_IOS_BANNER as string,
  interstitial: import.meta.env.VITE_ADMOB_IOS_INTERSTITIAL as string,
  rewarded: import.meta.env.VITE_ADMOB_IOS_REWARDED as string,
};

export function detectPlatform(): 'android' | 'ios' | 'web' {
  if (typeof navigator === 'undefined') return 'web';
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  return 'web';
}

export function getAdMobConfig(): AdMobConfig {
  return detectPlatform() === 'ios' ? ADMOB_IOS : ADMOB_ANDROID;
}

export interface SubscriptionPlanConfig {
  id: 'monthly' | 'yearly';
  label: string;
  price: string;
  priceSecondary: string;
  period: string;
  perks: string[];
  highlight?: boolean;
  badge?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanConfig[] = [
  {
    id: 'monthly',
    label: 'VibeScript Monthly',
    price: '$4.99',
    priceSecondary: '₹399',
    period: '/ month',
    perks: [
      'Infinite Viral Blueprint Generation',
      'Complete Advanced Slangs Matrix access',
      'No Interstitial or Banner Ads',
      'Priority AI Processing Speed',
    ],
  },
  {
    id: 'yearly',
    label: 'VibeScript Yearly',
    price: '$39.99',
    priceSecondary: '₹2999',
    period: '/ year',
    perks: [
      'All Monthly features unlocked forever',
      'Exclusive priority access to 2026 Predictive AI Global Trend Engines',
      'Save over 30% vs monthly',
    ],
    highlight: true,
    badge: 'BEST VALUE · SAVE 30%',
  },
];
