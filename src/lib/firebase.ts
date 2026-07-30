import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
  type Analytics,
} from 'firebase/analytics';

/**
 * Firebase Analytics integration.
 *
 * Config is read from Vite env vars. If they are absent (e.g. local dev
 * without Firebase configured), the module degrades gracefully — calls
 * become no-ops instead of crashing. This lets the app run in any
 * environment without hard-failing on analytics.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string,
};

const enabled = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;

if (enabled) {
  try {
    app = initializeApp(firebaseConfig);
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
  } catch {
    app = null;
    analytics = null;
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!analytics) return;
  try {
    logEvent(analytics, name, params);
  } catch {
    /* no-op */
  }
}

export function trackScreenView(screenName: string): void {
  trackEvent('screen_view', { firebase_screen: screenName, firebase_screen_class: screenName });
}

export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (!analytics) return;
  try {
    setUserId(analytics, userId);
    if (properties) setUserProperties(analytics, properties);
  } catch {
    /* no-op */
  }
}

export { enabled as firebaseEnabled };
