-- Session 10C: Invite tokens + invite_sent_at on trip_members.
-- Strategy doc §Dimension 2 (rally-attendee-strategy-v0.md) locked the
-- invite-link URL shape as `/i/<token>`, with the token stored on the
-- trip_members row. This migration adds the two columns the publish-
-- time email fan-out + the new /i/[token] resolver route depend on.
--
--   invite_token uuid not null default gen_random_uuid()
--     One token per trip_members row, generated at insert time, valid
--     forever. UNIQUE so the resolver can use it as a primary lookup
--     key. Postgres backfills existing rows from the default at apply
--     time, so every row -- new or pre-existing -- has a token.
--
--   invite_sent_at timestamptz (nullable)
--     Set when the invite email is dispatched successfully (by the
--     transitionToSell fan-out OR the existing api/invite single-add
--     path). NULL = email never sent (sketch-queued or send-failed).
--     Used as the "skip already-sent" guard so re-publish events
--     don't double-fire emails.
--
-- Backwards-compatible: this migration only adds columns. Running prod
-- code without these columns continues to work because no existing
-- column is removed or retyped. New code reads them only after the
-- migration has been applied. Per the 10A regression lesson, this
-- means migration-first ordering is SAFE: Andrew can apply migration
-- 026 before CC's code deploys without breaking prod.
--
-- Run note: hand-applied via the Supabase SQL editor (no-Docker flow,
-- same pattern as 019 / 021 / 022 / 023 / 024 / 025). File committed
-- for local history; ledger drift between this directory and Supabase's
-- migrations history table is the established project pattern.
--
-- Verify after apply:
--   select column_name, data_type, is_nullable, column_default
--     from information_schema.columns
--    where table_name = 'trip_members'
--      and column_name in ('invite_token', 'invite_sent_at');
--   -- expected:
--   --   invite_token    | uuid        | NO  | gen_random_uuid()
--   --   invite_sent_at  | timestamptz | YES | (null)
--
--   select count(*) as total, count(invite_token) as with_token
--     from trip_members;
--   -- total should equal with_token (every existing row backfilled)
--
--   select count(*) from trip_members where invite_sent_at is not null;
--   -- expected 0 (no rows marked sent yet at apply time)

alter table trip_members
  add column invite_token uuid not null default gen_random_uuid(),
  add column invite_sent_at timestamptz;

alter table trip_members
  add constraint trip_members_invite_token_unique unique (invite_token);
