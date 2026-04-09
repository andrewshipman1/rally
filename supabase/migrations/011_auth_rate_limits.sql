-- ============================================================
-- 011_auth_rate_limits.sql
-- Persistent rate-limit storage for the magic-link auth flow.
-- Replaces the in-memory Map that cannot survive multi-instance
-- deploys (Session 1 debt).
--
-- Two constraints enforced:
--   - 30-second cooldown between sends per email
--   - 5 sends per email per hour (then 1-hour lockout)
--
-- Schema stores individual send timestamps in a JSONB array so
-- the cooldown (most recent) and hourly limit (count within
-- window) can both be derived from one row.
-- ============================================================

CREATE TABLE auth_rate_limits (
  email            text PRIMARY KEY,
  send_timestamps  jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Index for cleanup queries (prune stale rows periodically).
CREATE INDEX idx_rate_limits_updated ON auth_rate_limits (updated_at);
