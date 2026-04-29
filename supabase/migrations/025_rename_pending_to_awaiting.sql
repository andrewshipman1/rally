-- Session 10A: Rename rsvp_status enum value 'pending' -> 'awaiting'.
-- Strategy doc §Dimension 1 (rally-attendee-strategy-v0.md) locked the
-- rename to better signal "no response received" rather than "system
-- default." The four states stay: in / holding / out / awaiting. No new
-- columns, no schema split, no data migration -- Postgres handles
-- `alter type ... rename value` in-place and existing rows automatically
-- follow the rename.
--
-- The `set default` is belt-and-suspenders. Postgres typically tracks
-- the rename through column defaults, but the explicit reset eliminates
-- ambiguity for any future reader of the table definition.
--
-- Run note: hand-applied via the Supabase SQL editor (no-Docker flow,
-- same pattern as 019 / 021 / 022 / 023 / 024). File committed for
-- local history; ledger drift between this directory and Supabase's
-- migrations history table is the established project pattern.
--
-- Verify after apply:
--   select unnest(enum_range(null::rsvp_status));
--   -- expected 4 values: in, holding, out, awaiting (no 'pending')
--
--   select rsvp, count(*) from trip_members group by rsvp;
--   -- expected: previously-'pending' rows now appear as 'awaiting'
--
--   select column_default from information_schema.columns
--    where table_name = 'trip_members' and column_name = 'rsvp';
--   -- expected: 'awaiting'::rsvp_status

alter type rsvp_status rename value 'pending' to 'awaiting';

alter table trip_members
  alter column rsvp set default 'awaiting'::rsvp_status;
