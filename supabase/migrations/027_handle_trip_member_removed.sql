-- Session bug-fix — Member-removal cascade cleanup.
--
-- Why this exists. `DELETE /api/invite/route.ts:185-218` removes a
-- single `trip_members` row when an organizer kicks a member. Every
-- other piece of trip-scoped data attributed to that user — lodging
-- votes, poll votes, lodging/transport/restaurants/activities/groceries
-- booking attributions — is left in place. Symptom seen in QA: on the
-- Coachella 2026!!! test trip, the Cap Juluca property's vote tally
-- kept counting a removed member's vote even though the member was
-- gone from the crew section. Silent data corruption — wrong tally →
-- wrong property wins → product decision on bad data, undetected.
--
-- Fix. A BEFORE DELETE trigger on `public.trip_members` that fans the
-- cleanup out at the database layer. Lives below the API handler so
-- neither future API changes nor direct-SQL deletions can leak orphan
-- attributions.
--
-- ─── Per-table behavior (locked by Andrew, 2026-05-03) ────────────────
--
--   lodging_votes              CASCADE DELETE   close the original bug
--   poll_votes                 CASCADE DELETE   same logic
--   lodging.booked_by          SET NULL         keep the booking record;
--                                               drop the attribution
--   transport.booked_by        SET NULL         same
--   restaurants.reserved_by    SET NULL         same
--   activities.booked_by       SET NULL         same
--   groceries.booked_by        SET NULL         same
--   comments                   PRESERVE         history is sacrosanct;
--                                               UI may render "former
--                                               member" later (separate
--                                               follow-up)
--   activity_log               PRESERVE         audit trail integrity
--   expenses.paid_by           DEFERRED         NOT NULL per
--                                               001_initial_schema.sql:219;
--                                               go-phase data not active
--                                               in v0; the go-phase arc
--                                               will decide the right
--                                               behavior + drop NOT NULL
--                                               if needed
--
-- ─── Coexistence with Migrations 023 / 024 ────────────────────────────
-- Migration 023 (`merge_orphan_user_by_email`) and Migration 024
-- (`handle_new_user_for` / `handle_new_user`) handle SIGNUP-time
-- orphan consolidation when an invitee returns to claim their
-- placeholder row. Both are preserved unchanged. This migration owns
-- DELETE-time cleanup, which the prior identity arc never addressed.
-- Three functions, three different lifecycle hooks; no overlap.
--
-- ─── Safety patterns (mirror Migrations 023 / 024) ────────────────────
-- - SECURITY DEFINER: BEFORE-DELETE triggers run in the caller's role,
--   which is the API's admin/anon client by the time it fires. DEFINER
--   makes write privileges deterministic and matches the rest of the
--   identity-arc trigger functions.
-- - SET search_path = public, pg_temp: neutralizes the classic
--   search-path hijack that SECURITY DEFINER functions are vulnerable
--   to. Identical to 023:68 and 024:92.
-- - Multi-trip safety: every cleanup statement is scoped to
--   `OLD.trip_id`. A user who's a member of two trips and gets
--   removed from one keeps their data in the OTHER trip intact —
--   essential, since `trip_members` has a UNIQUE(trip_id, user_id)
--   join shape rather than a global membership notion.
--
-- ─── Idempotency ──────────────────────────────────────────────────────
-- - `CREATE OR REPLACE FUNCTION` for the function body.
-- - `DROP TRIGGER IF EXISTS ... CREATE TRIGGER` for the trigger
--   binding (Postgres has no CREATE OR REPLACE TRIGGER pre-14 in
--   the form we need).
-- - Re-running the migration against a DB that already has it is a
--   no-op apart from rebinding the trigger to the (unchanged)
--   function body.
--
-- ─── Schema-drift guards ──────────────────────────────────────────────
-- - `polls` is guarded with `to_regclass + EXECUTE`. PL/pgSQL parses
--   static SQL at function-creation time, so a literal
--   `DELETE FROM public.poll_votes ... SELECT FROM public.polls`
--   would error on envs without the table. The `EXECUTE` defers
--   parsing to runtime; `to_regclass()` returns NULL when the table
--   is absent and we skip cleanly. Same pattern as 024:172-175 for
--   `activity_log`. (`poll_votes` follows `polls` — the FK is
--   `ON DELETE CASCADE` to polls — so guarding `polls` covers both.)
-- - The five booking-attribution tables (`lodging`, `transport`,
--   `restaurants`, `activities`, `groceries`) are core schema and
--   not guarded; if any is absent, applying earlier migrations is
--   the prerequisite, not making this trigger conditional on them.

-- ═══════════════════════════════════════════════════════════════════════
-- 1) Trigger function — fans the cleanup out across per-trip tables.
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_trip_member_removed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- ─── (a) lodging_votes — CASCADE DELETE ─────────────────────────────
  -- lodging_votes has no trip_id; scope through lodging.trip_id so
  -- only this trip's votes are removed (multi-trip safety).
  DELETE FROM public.lodging_votes
   WHERE user_id = OLD.user_id
     AND lodging_id IN (
       SELECT id FROM public.lodging WHERE trip_id = OLD.trip_id
     );

  -- ─── (b) poll_votes — CASCADE DELETE (guarded) ──────────────────────
  -- Same join shape via polls.trip_id. Guarded because polls may not
  -- exist on every env — see header note. EXECUTE defers parsing.
  IF to_regclass('public.polls') IS NOT NULL THEN
    EXECUTE
      'DELETE FROM public.poll_votes
        WHERE user_id = $1
          AND poll_id IN (
            SELECT id FROM public.polls WHERE trip_id = $2
          )'
    USING OLD.user_id, OLD.trip_id;
  END IF;

  -- ─── (c) NULL booking attributions — SET NULL ───────────────────────
  -- Preserve the booking record itself; drop only the attribution.
  -- Each statement scoped to OLD.trip_id so the user's bookings on
  -- other trips are untouched.
  UPDATE public.lodging
     SET booked_by = NULL
   WHERE trip_id = OLD.trip_id AND booked_by = OLD.user_id;

  UPDATE public.transport
     SET booked_by = NULL
   WHERE trip_id = OLD.trip_id AND booked_by = OLD.user_id;

  UPDATE public.restaurants
     SET reserved_by = NULL
   WHERE trip_id = OLD.trip_id AND reserved_by = OLD.user_id;

  UPDATE public.activities
     SET booked_by = NULL
   WHERE trip_id = OLD.trip_id AND booked_by = OLD.user_id;

  UPDATE public.groceries
     SET booked_by = NULL
   WHERE trip_id = OLD.trip_id AND booked_by = OLD.user_id;

  -- ─── (d) expenses.paid_by — INTENTIONALLY SKIPPED ───────────────────
  -- `paid_by` is NOT NULL per 001_initial_schema.sql:219. Setting it
  -- NULL would violate; deleting the expense would lose go-phase
  -- history. Go-phase data is not active in v0, so the cleanup
  -- question naturally lives with go-phase scoping (it'll decide the
  -- right semantics + drop the NOT NULL if appropriate). No statement
  -- here on purpose — this comment is the audit trail.

  -- ─── (e) comments + activity_log — PRESERVED ────────────────────────
  -- No statements. Removed-member comments stay with their original
  -- user_id; UI may render them as "former member" later (separate
  -- follow-up session). activity_log is the audit trail and never
  -- gets retroactively rewritten on member removal.

  -- BEFORE DELETE triggers must return OLD to allow the delete to
  -- proceed; returning NULL would cancel it.
  RETURN OLD;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_trip_member_removed() FROM PUBLIC;

COMMENT ON FUNCTION public.handle_trip_member_removed() IS
  'Member-removal cascade cleanup. BEFORE DELETE trigger function on '
  'public.trip_members. Deletes the removed member''s lodging_votes '
  'and poll_votes for the trip; nulls booked_by / reserved_by on the '
  'trip''s lodging, transport, restaurants, activities, groceries. '
  'Preserves comments and activity_log. Skips expenses.paid_by '
  '(NOT NULL constraint; go-phase scope). All cleanup scoped to '
  'OLD.trip_id for multi-trip safety. SECURITY DEFINER, pinned '
  'search_path. Idempotent re-apply.';

-- ═══════════════════════════════════════════════════════════════════════
-- 2) Trigger — wire the function to public.trip_members.
-- ═══════════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS on_trip_member_deleted ON public.trip_members;

CREATE TRIGGER on_trip_member_deleted
  BEFORE DELETE ON public.trip_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_trip_member_removed();

-- ═══════════════════════════════════════════════════════════════════════
-- ROLLBACK / DOWN MIGRATION
--
-- Supabase CLI migrations are forward-only. To roll this migration back,
-- run the following in Supabase Studio SQL editor (or via psql with the
-- service-role / postgres connection):
--
--   DROP TRIGGER IF EXISTS on_trip_member_deleted ON public.trip_members;
--   DROP FUNCTION IF EXISTS public.handle_trip_member_removed();
--
-- Idempotency test cycle:
--   1. supabase migration up      -- applies 027
--   2. (run the two DROP statements above)
--   3. supabase migration up      -- re-applies cleanly (CREATE OR
--                                    REPLACE on the function, DROP IF
--                                    EXISTS + CREATE on the trigger)
--
-- ═══════════════════════════════════════════════════════════════════════
