-- Session 9B-1 — Getting Here module data layer.
-- Adds per-member arrival fields to trip_members. Each invitee picks
-- their arrival mode + enters a rough cost; the UI renders only for
-- the current viewer. Existing tr_members_updated_at trigger keeps
-- updated_at fresh for the row as a whole; arrival_updated_at is set
-- explicitly from the server action on every arrival write.

DO $$ BEGIN
  CREATE TYPE arrival_mode AS ENUM ('flight', 'drive', 'train', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.trip_members
  ADD COLUMN IF NOT EXISTS arrival_mode       arrival_mode,
  ADD COLUMN IF NOT EXISTS arrival_cost_cents integer,
  ADD COLUMN IF NOT EXISTS arrival_updated_at timestamptz;
