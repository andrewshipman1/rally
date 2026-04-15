-- Session 8Q: Add "the aux" OG enrichment + curator columns to trips.
-- Four nullable columns so old trips stay valid. No new table — playlist
-- is singular per trip. Curator name denormalized at save time so the
-- byline survives display-name changes (ephemeral "set by Sarah") and
-- avoids a join at read time.
-- RLS: no new policies — existing trips-row policies cover these columns.

ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS playlist_og_image     text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS playlist_og_title     text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS playlist_set_by_name  text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS playlist_set_at       timestamptz;
