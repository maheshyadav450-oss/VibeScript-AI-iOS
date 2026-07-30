/*
# VibeScript AI — Update scripts_vault hooks shape

1. Changes
- The `hooks` column on `scripts_vault` previously defaulted to an empty
  JSON array. The blueprint schema now uses a JSON object with 5 named
  psychological hook angles (fear_trap, curiosity_blindspot, ego_trigger,
  cheat_code, trend_ride). This migration updates the column default to
  an empty JSON object so new inserts align with the new shape.
- Also adds a `keywords` jsonb column to store the metadata.keywords array
  returned by the Gemini engine.

2. Security
- No policy changes. Existing RLS policies remain valid.

3. Notes
- The column type stays `jsonb` — only the default changes. Existing rows
  with array-shaped hooks are not modified; new inserts use the object shape.
*/

ALTER TABLE scripts_vault
  ALTER COLUMN hooks SET DEFAULT '{}'::jsonb;

ALTER TABLE scripts_vault
  ADD COLUMN IF NOT EXISTS keywords jsonb NOT NULL DEFAULT '[]'::jsonb;