-- Session 12A (Lock-A): trips.lock_deadline timestamptz.
--
-- Lock-phase analog of trips.commit_deadline. Distinct semantics:
--
--   commit_deadline (sell phase)  — soft RSVP-by date counted down by
--                                   the hero in sell. NOT a hard cutoff.
--   lock_deadline   (lock phase)  — booking deadline. Drives the
--                                   lock-phase urgency layer / drip
--                                   campaign cadence (Lock-G). NOT a
--                                   hard cliff — Lock → Go is a
--                                   separate manual organizer CTA.
--
-- Set during the Lock-B wizard (default UI prefill: date_start - 14
-- days). Configurable post-lock; the organizer can push it out without
-- rerunning the lock wizard (per strategy doc "Lock-phase deadline").
-- Nullable because pre-lock trips have no deadline yet.

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS lock_deadline timestamptz;

COMMENT ON COLUMN public.trips.lock_deadline IS
  'Lock-phase booking deadline (set when fireLock fires). Drives the '
  'lock-phase drip cadence (Lock-G) and surfaces in the post-lock '
  'condensed summary card. Distinct from commit_deadline (sell-phase '
  'RSVP-by). Nullable pre-lock; organizer-resettable post-lock.';

-- ─── Idempotency ──────────────────────────────────────────────────────
-- ADD COLUMN IF NOT EXISTS — re-applying after a successful apply is
-- a no-op.

-- ─── Rollback ─────────────────────────────────────────────────────────
-- Supabase migrations are forward-only. To roll back, run in Studio:
--   ALTER TABLE public.trips DROP COLUMN IF EXISTS lock_deadline;
