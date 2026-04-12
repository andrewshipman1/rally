-- Session 8A: Add accommodation type and people_per_room to lodging table.

DO $$ BEGIN
  CREATE TYPE accommodation_type AS ENUM ('home_rental', 'hotel', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

ALTER TABLE lodging ADD COLUMN IF NOT EXISTS accommodation_type accommodation_type NOT NULL DEFAULT 'home_rental';
ALTER TABLE lodging ADD COLUMN IF NOT EXISTS people_per_room integer;
