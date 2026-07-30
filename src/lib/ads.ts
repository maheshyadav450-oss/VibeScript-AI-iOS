import { getAdMobConfig, REVENUECAT_API_KEY } from './config';
import type { EntitlementStatus } from './types';

/**
 * AdMob + RevenueCat service layer.
 *
 * Native SDKs (Google Mobile Ads SDK, RevenueCat SDK) require Capacitor native
 * bridges and cannot run inside a web build. This module is the integration
 * scaffold: it exposes the exact ad unit IDs and a unified API surface
 * (showInterstitial, showRewarded, isPremium) that a native adapter would
 * implement. In the web build these calls resolve to simulated callbacks so
 * the full UX flow is exercisable end-to-end.
 */

export const adConfig = getAdMobConfig();

export function isPremium(status: EntitlementStatus): boolean {
  return status === 'premium_pro';
}

export interface AdResult {
  completed: boolean;
  reward?: number;
  error?: string;
}

/**
 * In a native build this would call
 *   @capacitor-community/admob → AdMob.prepareInterstitial({ adId, ... })
 * and resolve on dismissal. Web build: simulate after a short delay.
 */
export function showInterstitial(): Promise<AdResult> {
  return new Promise((resolve) => {
    // Integration point: Capacitor AdMobInterstitial.show()
    const id = adConfig.interstitial;
    void id;
    setTimeout(() => resolve({ completed: true }), 1200);
  });
}

/**
 * In a native build this would call
 *   @capacitor-community/admob → AdMob.prepareRewardedVideo({ adId, ... })
 * and resolve with the reward on completion. Web build: simulate reward of +3.
 */
export function showRewarded(): Promise<AdResult> {
  return new Promise((resolve) => {
    // Integration point: Capacitor AdMobRewarded.show()
    const id = adConfig.rewarded;
    void id;
    setTimeout(() => resolve({ completed: true, reward: 3 }), 1800);
  });
}

/**
 * RevenueCat entitlement check. Native build would call
 *   Purchases.getCustomerInfo() and inspect entitlements.
 * Web build: returns false (no native SDK).
 */
export async function checkRevenueCatEntitlement(): Promise<boolean> {
  void REVENUECAT_API_KEY;
  return false;
}
