/*
# VibeScript AI — Core Schema

1. Overview
VibeScript AI is a single-tenant creator tool (no sign-in screen) that generates
viral video scripts using Google Gemini. This migration creates three tables:
the user profile (tokens + entitlement), the saved scripts vault, and a set of
global live trends shown in a ticker.

2. New Tables
- `users`
  - `id` (uuid, primary key) — singleton row identifies the current user.
  - `email` (text) — optional display email.
  - `current_tokens` (integer, default 5) — energy tokens used to mint scripts.
  - `entitlement_status` (text, default 'free_ad_supported') — 'free_ad_supported' | 'premium_pro'.
  - `subscription_plan` (text, default 'none') — 'none' | 'monthly' | 'yearly'.
  - `revenuecat_customer_id` (text) — RevenueCat customer id (native build).
  - `updated_at` (timestamptz, default now()).
- `scripts_vault`
  - `script_id` (uuid, primary key).
  - `uid` (uuid) — owner reference to users.id.
  - `title` (text).
  - `platform` (text) — e.g. TikTok, YouTube Shorts, Instagram Reels.
  - `slang` (text) — selected slang style.
  - `tone` (text) — selected tone.
  - `hooks` (jsonb) — array of 5 psychological hook angles.
  - `script_body` (text) — full production script with timestamps/cues.
  - `caption` (text) — generated caption.
  - `hashtags` (jsonb) — array of hashtag strings.
  - `created_at` (timestamptz, default now()).
- `global_live_trends`
  - `trend_id` (uuid, primary key).
  - `country_flag` (text) — emoji flag.
  - `trend_text` (text) — the trend description.
  - `market` (text) — market/region label.
  - `updated_at` (timestamptz, default now()).

3. Security
- All tables are single-tenant / no-auth. RLS enabled on every table.
- Policies use `TO anon, authenticated` because the app has no sign-in screen
  and runs entirely as the anon-key client. Data is intentionally shared/public
  within this single-tenant app.

4. Seed Data
- Inserts a singleton user row with 5 starting tokens.
- Inserts a starter set of global live trends.
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  current_tokens integer NOT NULL DEFAULT 5,
  entitlement_status text NOT NULL DEFAULT 'free_ad_supported',
  subscription_plan text NOT NULL DEFAULT 'none',
  revenuecat_customer_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_users" ON users;
CREATE POLICY "anon_select_users" ON users FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_users" ON users;
CREATE POLICY "anon_insert_users" ON users FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_users" ON users;
CREATE POLICY "anon_update_users" ON users FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_users" ON users;
CREATE POLICY "anon_delete_users" ON users FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS scripts_vault (
  script_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Blueprint',
  platform text NOT NULL DEFAULT 'TikTok',
  slang text NOT NULL DEFAULT 'Standard',
  tone text NOT NULL DEFAULT 'Hype',
  hooks jsonb NOT NULL DEFAULT '[]'::jsonb,
  script_body text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  hashtags jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scripts_vault ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_scripts" ON scripts_vault;
CREATE POLICY "anon_select_scripts" ON scripts_vault FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scripts" ON scripts_vault;
CREATE POLICY "anon_insert_scripts" ON scripts_vault FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_scripts" ON scripts_vault;
CREATE POLICY "anon_update_scripts" ON scripts_vault FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scripts" ON scripts_vault;
CREATE POLICY "anon_delete_scripts" ON scripts_vault FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS global_live_trends (
  trend_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_flag text NOT NULL DEFAULT '🌍',
  trend_text text NOT NULL DEFAULT '',
  market text NOT NULL DEFAULT 'Global',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE global_live_trends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_trends" ON global_live_trends;
CREATE POLICY "anon_select_trends" ON global_live_trends FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_trends" ON global_live_trends;
CREATE POLICY "anon_insert_trends" ON global_live_trends FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_trends" ON global_live_trends;
CREATE POLICY "anon_update_trends" ON global_live_trends FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_trends" ON global_live_trends;
CREATE POLICY "anon_delete_trends" ON global_live_trends FOR DELETE
  TO anon, authenticated USING (true);

-- Seed singleton user (only if none exists)
INSERT INTO users (id, email, current_tokens, entitlement_status, subscription_plan)
SELECT gen_random_uuid(), 'creator@vibescript.ai', 5, 'free_ad_supported', 'none'
WHERE NOT EXISTS (SELECT 1 FROM users);

-- Seed starter trends (only if none exist)
INSERT INTO global_live_trends (country_flag, trend_text, market) VALUES
  ('🇺🇸', 'AI faceless channels hitting 1M views in 7 days', 'US'),
  ('🇬🇧', 'Day-in-the-life vlog cuts with lo-fi beats', 'UK'),
  ('🇧🇷', 'POV trend: "when the algorithm finally gets you"', 'BR'),
  ('🇮🇳', '60-second educational hooks about money', 'IN'),
  ('🇯🇵', 'Cinematic transitions with neon city night walks', 'JP'),
  ('🇩🇪', 'Silent reaction overlays with dramatic pauses', 'DE'),
  ('🇳🇬', 'Storytime with text-on-screen countdown format', 'NG'),
  ('🇨🇦', 'Before/after glow-up with beat drop sync', 'CA')
ON CONFLICT DO NOTHING;