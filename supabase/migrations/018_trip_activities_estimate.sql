-- Session 8K: Activities module collapses to a single per-person estimate.
-- Stored as a nullable integer column on trips (whole dollars × 100 = cents).
-- The existing `activities` table is intentionally retained — it will be
-- repurposed for the sell/lock activity mechanic in a future session.
-- RLS: no new policies needed — existing trips-row policies cover this column.

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS activities_estimate_per_person_cents integer;
