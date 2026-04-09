-- ============================================================
-- 009_session3_columns.sql
-- Add columns needed by Session 3 features:
--   - trips.chassis_theme_id — chassis theme identifier (distinct
--     from the legacy theme_id FK). Written by commitTripTheme.
--   - trip_members.invite_opened_at — set on first authed load of
--     the invitee page. Drives crew row subtext (§5.25).
--   - trip_members.decline_reason — free-text decline reason.
--   - trip_members.plus_one_name — named +1 (replaces anon boolean).
-- ============================================================

ALTER TABLE trips
  ADD COLUMN chassis_theme_id text;

ALTER TABLE trip_members
  ADD COLUMN invite_opened_at timestamptz;

ALTER TABLE trip_members
  ADD COLUMN decline_reason text;

ALTER TABLE trip_members
  ADD COLUMN plus_one_name text;
