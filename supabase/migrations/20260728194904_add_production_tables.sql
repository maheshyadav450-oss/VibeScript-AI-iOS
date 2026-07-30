/*
# VibeScript AI — Production Analytics, Content Calendar & Viral Scores

1. New Tables
- `analytics_events`: tracks user interactions (screen views, button taps,
  blueprint mints, ad views, paywall opens) for product analytics. Each row
  is a single event with a type, optional metadata JSON, and timestamp.
- `content_calendar`: lets creators schedule and track their content ideas
  across dates. Each entry has a title, platform, scheduled date, and
  status (idea / draft / published).
- `viral_scores`: stores the AI-generated viral score breakdown for each
  saved blueprint so users can review and compare past scores.

2. Modified Tables
- `scripts_vault`: adds `viral_score` jsonb column to store the full
  ViralScore object returned by the Gemini engine alongside the blueprint.

3. Security
- This app has no sign-in screen — it uses the Supabase anon key for all
  reads and writes. Therefore all policies use `TO anon, authenticated`
  with `USING (true)` / `WITH CHECK (true)` because the data is
  intentionally shared across the single-tenant app instance.
- RLS is enabled on every new table.

4. Indexes
- `analytics_events` indexed on `event_type` and `created_at` for fast
  dashboard queries.
- `content_calendar` indexed on `scheduled_date` for calendar view queries.
- `viral_scores` indexed on `script_id` for lookup by blueprint.

5. Notes
- All tables are single-tenant (no user_id / auth.users FK) because this
  app does not have a sign-in screen. If auth is added later, these tables
  should be migrated to owner-scoped policies.
- The `scripts_vault` viral_score column is nullable so existing rows
  are unaffected.
*/

-- analytics_events
CREATE TABLE IF NOT EXISTS analytics_events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_analytics" ON analytics_events;
CREATE POLICY "anon_select_analytics" ON analytics_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_analytics" ON analytics_events;
CREATE POLICY "anon_insert_analytics" ON analytics_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_analytics" ON analytics_events;
CREATE POLICY "anon_delete_analytics" ON analytics_events FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events (created_at DESC);

-- content_calendar
CREATE TABLE IF NOT EXISTS content_calendar (
  entry_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  platform text NOT NULL DEFAULT 'TikTok',
  scheduled_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_calendar" ON content_calendar;
CREATE POLICY "anon_select_calendar" ON content_calendar FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_calendar" ON content_calendar;
CREATE POLICY "anon_insert_calendar" ON content_calendar FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_calendar" ON content_calendar;
CREATE POLICY "anon_update_calendar" ON content_calendar FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_calendar" ON content_calendar;
CREATE POLICY "anon_delete_calendar" ON content_calendar FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_calendar_date ON content_calendar (scheduled_date);

-- viral_scores
CREATE TABLE IF NOT EXISTS viral_scores (
  score_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id uuid REFERENCES scripts_vault(script_id) ON DELETE CASCADE,
  overall int NOT NULL DEFAULT 0,
  hook_strength int NOT NULL DEFAULT 0,
  trend_alignment int NOT NULL DEFAULT 0,
  engagement_prediction int NOT NULL DEFAULT 0,
  audience_fit int NOT NULL DEFAULT 0,
  novelty int NOT NULL DEFAULT 0,
  insights jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE viral_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_scores" ON viral_scores;
CREATE POLICY "anon_select_scores" ON viral_scores FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scores" ON viral_scores;
CREATE POLICY "anon_insert_scores" ON viral_scores FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scores" ON viral_scores;
CREATE POLICY "anon_delete_scores" ON viral_scores FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_viral_scores_script ON viral_scores (script_id);

-- scripts_vault: add viral_score column
ALTER TABLE scripts_vault
  ADD COLUMN IF NOT EXISTS viral_score jsonb;