export type EntitlementStatus = 'free_ad_supported' | 'premium_pro';
export type SubscriptionPlan = 'none' | 'monthly' | 'yearly';

export interface UserProfile {
  id: string;
  email: string | null;
  current_tokens: number;
  entitlement_status: EntitlementStatus;
  subscription_plan: SubscriptionPlan;
  revenuecat_customer_id: string | null;
  updated_at: string;
}

export type HookAngle = 'fear_trap' | 'curiosity_blindspot' | 'ego_trigger' | 'cheat_code' | 'trend_ride';

export interface HookMatrix {
  fear_trap: string;
  curiosity_blindspot: string;
  ego_trigger: string;
  cheat_code: string;
  trend_ride: string;
}

export interface ViralScore {
  overall: number;
  hook_strength: number;
  trend_alignment: number;
  engagement_prediction: number;
  audience_fit: number;
  novelty: number;
  insights: string[];
}

export interface ScriptBlueprint {
  script_id?: string;
  uid?: string;
  title: string;
  platform: string;
  slang: string;
  tone: string;
  hooks: HookMatrix;
  script_body: string;
  caption: string;
  keywords: string[];
  hashtags: string[];
  viral_score?: ViralScore;
  created_at?: string;
}

export interface CalendarEntry {
  entry_id: string;
  uid: string;
  title: string;
  platform: string;
  scheduled_date: string;
  status: 'idea' | 'draft' | 'published';
  created_at: string;
}

export interface LiveTrend {
  trend_id: string;
  country_flag: string;
  trend_text: string;
  market: string;
  updated_at: string;
}

export interface GenerationInput {
  topic: string;
  platform: string;
  slang: string;
  tone: string;
}

export type Platform = 'TikTok' | 'YouTube Shorts' | 'Instagram Reels' | 'X / Twitter';
export type Slang = 'Standard' | 'Gen Z' | 'AAVE' | 'UK Roadman' | 'Corporate Bro' | 'Cringe Maximalist';
export type Tone = 'Hype' | 'Mysterious' | 'Educational' | 'Wholesome' | 'Dark Humor' | 'Luxury' | 'Urgent FOMO';

export const PLATFORMS: Platform[] = ['TikTok', 'YouTube Shorts', 'Instagram Reels', 'X / Twitter'];
export const SLANGS: Slang[] = ['Standard', 'Gen Z', 'AAVE', 'UK Roadman', 'Corporate Bro', 'Cringe Maximalist'];
export const TONES: Tone[] = ['Hype', 'Mysterious', 'Educational', 'Wholesome', 'Dark Humor', 'Luxury', 'Urgent FOMO'];

export const HOOK_ANGLES: { key: HookAngle; label: string; icon: string }[] = [
  { key: 'fear_trap', label: 'Fear Trap', icon: '⚠' },
  { key: 'curiosity_blindspot', label: 'Curiosity Blindspot', icon: '👁' },
  { key: 'ego_trigger', label: 'Ego Trigger', icon: '✦' },
  { key: 'cheat_code', label: 'Cheat Code', icon: '⚡' },
  { key: 'trend_ride', label: 'Trend Ride', icon: '📈' },
];
