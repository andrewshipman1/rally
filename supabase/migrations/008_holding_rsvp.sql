-- ============================================================
-- 008_holding_rsvp.sql
-- Replace the legacy 'maybe' RSVP status with 'holding' to
-- match the chassis vocabulary (lexicon §5.10). Postgres does
-- not support dropping individual enum values, so we recreate
-- the type.
--
-- After this migration:
--   rsvp_status = 'in' | 'holding' | 'out' | 'pending'
--   No rows contain 'maybe'.
-- ============================================================

BEGIN;

-- 1. Drop the column default (it references the old enum type).
ALTER TABLE trip_members ALTER COLUMN rsvp DROP DEFAULT;

-- 2. Rename the old type so we can create a new one with the same name.
ALTER TYPE rsvp_status RENAME TO rsvp_status_old;

-- 3. Create the new enum without 'maybe', with 'holding' instead.
CREATE TYPE rsvp_status AS ENUM ('in', 'holding', 'out', 'pending');

-- 4. Migrate the column, converting 'maybe' → 'holding' in-flight.
ALTER TABLE trip_members
  ALTER COLUMN rsvp TYPE rsvp_status
  USING (
    CASE
      WHEN rsvp::text = 'maybe' THEN 'holding'::rsvp_status
      ELSE rsvp::text::rsvp_status
    END
  );

-- 5. Re-add the default with the new type.
ALTER TABLE trip_members ALTER COLUMN rsvp SET DEFAULT 'pending'::rsvp_status;

-- 6. Drop the old type.
DROP TYPE rsvp_status_old;

COMMIT;
