-- Session 9X: Drop NOT NULL on public.transport.subtype.
-- Hotfix. Every transport INSERT from addTransport (sketch-modules.ts:282)
-- has been failing with `null value in column "subtype" of relation
-- "transport" violates not-null constraint` across all phases, all users,
-- local + prod. Root cause: migration 019 added type_tag + description,
-- backfilled subtype for existing rows, and was supposed to relax the
-- NOT NULL constraint on subtype — but it omitted that final step. The
-- comment at sketch-modules.ts:239 documented the intended state ("stays
-- nullable") which never matched the actual schema.
--
-- This migration adds the missing `drop not null`. New rows written by
-- addTransport / updateTransport continue to leave subtype NULL (as they
-- have since 8M / migration 019); old rows keep their backfilled values
-- from 019's CASE expression. The legacy subtype column + enum are
-- intentionally retained and silently deprecated.
--
-- Run note: this file is committed for local history. Apply manually in
-- the hosted Supabase SQL editor — same pattern as 019, 021, 022 (Andrew's
-- no-local-Docker flow). Verify after apply:
--   select is_nullable from information_schema.columns
--   where table_name = 'transport' and column_name = 'subtype';
-- Expected: YES.

alter table public.transport
  alter column subtype drop not null;

comment on column public.transport.subtype is
  'Deprecated (Session 8M). Retained for backward compat on pre-8M rows; new rows leave this NULL. type_tag is the canonical discriminator.';
