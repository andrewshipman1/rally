-- Session 12A (Lock-A): Payment-handle columns on public.users.
--
-- Strategy reference: rally-lock-phase-strategy-v0.md "Cowork session 2 —
-- additional locked decisions" + Session 12A brief in rally-fix-plan-v1.md.
--
-- Why three columns and not jsonb. A user's payment handles are a tiny
-- fixed set of nullable strings, surfaced as discrete affordances in
-- Module A (Lock-D) — "Send Andrew $X via Venmo / Zelle / Cashapp →".
-- Three text columns mirror how `users.phone` and `users.email` are
-- stored, are trivially indexable if needed, and avoid jsonb-shape
-- decisions for what is fundamentally three independent strings.
--
-- venmo_handle already exists (added in 001_initial_schema.sql:20 and
-- preserved in 002_typed_components.sql:18) — re-asserted with
-- IF NOT EXISTS so this migration is safe on every env. Adds
-- zelle_handle and cashapp_handle as the actual delta.
--
-- These fields are READ by Module A's payment-deep-link affordance
-- (Lock-D) and WRITTEN just-in-time during the Lock-B wizard if the
-- organizer fires lock with no handle set. Passport-page editing is a
-- future polish (per Session 12A hard constraints — DO NOT add a UI
-- form for these in this session).

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS venmo_handle   text,
  ADD COLUMN IF NOT EXISTS zelle_handle   text,
  ADD COLUMN IF NOT EXISTS cashapp_handle text;

COMMENT ON COLUMN public.users.venmo_handle   IS 'Venmo @-handle (no leading @). Surfaced in Lock phase Module A as a Send-via-Venmo deep link. Captured just-in-time during Lock-B wizard if unset.';
COMMENT ON COLUMN public.users.zelle_handle   IS 'Zelle handle — phone or email the user receives Zelle at. Surfaced in Lock phase Module A. Captured just-in-time during Lock-B wizard if unset.';
COMMENT ON COLUMN public.users.cashapp_handle IS 'Cash App $cashtag (no leading $). Surfaced in Lock phase Module A. Captured just-in-time during Lock-B wizard if unset.';

-- ─── Idempotency ──────────────────────────────────────────────────────
-- All three ALTERs use ADD COLUMN IF NOT EXISTS, so re-running this
-- migration after a successful apply is a no-op apart from re-attaching
-- the column comments (PG accepts COMMENT ON for existing columns
-- silently — no error, no schema change beyond the catalog refresh).

-- ─── Rollback ─────────────────────────────────────────────────────────
-- Supabase migrations are forward-only. To roll back, run in Studio:
--   ALTER TABLE public.users DROP COLUMN IF EXISTS cashapp_handle;
--   ALTER TABLE public.users DROP COLUMN IF EXISTS zelle_handle;
--   -- venmo_handle predates this migration; do NOT drop on rollback.
