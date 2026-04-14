-- Session 8J: Add "the headliner" as six nullable trip-level columns.
-- Singular per trip, optional. "Headliner present" = headliner_description IS NOT NULL.
-- RLS: no new policies needed — existing trips-row policies cover these columns.

DO $$ BEGIN
  CREATE TYPE headliner_cost_unit AS ENUM ('per_person', 'total');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS headliner_description  text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS headliner_cost_cents   integer;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS headliner_cost_unit    headliner_cost_unit;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS headliner_link_url     text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS headliner_image_url    text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS headliner_source_title text;
