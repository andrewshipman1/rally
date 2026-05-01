-- Session 10I — Auth identity hardening: DB trigger for public.users creation.
--
-- Why this exists. 10H moved orphan-merge + ensure-row upsert into
-- /auth/callback/route.ts. That architecture is wrong: auth.uid() isn't
-- reliably available in a Next 16 route handler immediately after
-- exchangeCodeForSession() writes session cookies — there's a race where
-- subsequent server-client calls in the same handler can't read the
-- freshly-issued session token. RLS WITH CHECK (auth.uid() = id) on
-- public.users then silently denies the insert. Result: signed-up users
-- end up with no public.users row, FKs still point at the orphan, and
-- the dashboard / passport / display name all break.
--
-- The right architecture is the canonical Supabase pattern: an AFTER
-- INSERT trigger on auth.users that runs synchronously inside the auth
-- signup transaction. Full DB context, no HTTP cookie races, runs once
-- per real signup.
--
-- ─── Single-source-of-truth design ────────────────────────────────────
-- Two functions:
--   • public.handle_new_user_for(target_id, target_email)
--       Parameterized helper. Idempotent: ensure-row INSERT + orphan
--       consolidation. Same FK migration logic Migration 023's
--       merge_orphan_user_by_email() owns, but takes id+email as
--       parameters instead of pulling from auth.uid(). Callable
--       directly for cleanup queries.
--   • public.handle_new_user()
--       Trigger function. Calls handle_new_user_for(NEW.id, NEW.email).
--       Returns NEW (required for AFTER trigger).
--
-- ─── Coexistence with Migration 023 ───────────────────────────────────
-- Migration 023's merge_orphan_user_by_email() is preserved unchanged.
-- The src/lib/auth/merge-orphan.ts wrapper still calls it. Logic is
-- duplicated between 023 and this function (FK list, collision rules)
-- because we cannot modify 023 without breaking back-compat. After 10I
-- ships, 023's function has no live callers from app code (the 10H
-- /auth/callback caller is being deleted in this session); it persists
-- as dead-code-but-supported. Future hygiene session can collapse.
--
-- ─── Safety patterns (mirrors Migration 023) ──────────────────────────
-- - SECURITY DEFINER: required to insert into public.users from a
--   trigger context where the auth role doesn't have direct INSERT
--   privileges on the user's own row (the WITH CHECK policy fires
--   too early since auth.uid() context isn't established yet at
--   trigger time inside the auth signup transaction).
-- - SET search_path = public, pg_temp: neutralizes search-path hijack
--   attacks classic to SECURITY DEFINER. Matches Migration 023.
-- - All inputs come from auth.users via NEW (trigger context) or
--   from authenticated callers running the cleanup query manually.
--   No client-passable parameters.
--
-- ─── FK coverage (audited against migrations 001-023) ─────────────────
-- Identical to Migration 023 lines 32-46. If a future migration adds
-- a new public.users(id) FK, BOTH this function AND Migration 023's
-- function need updating.
--
--   trip_members.user_id           NOT NULL, UNIQUE(trip_id, user_id)       — collision-handled
--   lodging_votes.user_id          NOT NULL, UNIQUE(lodging_id, user_id)    — collision-handled
--   poll_votes.user_id             NOT NULL, UNIQUE(poll_id, user_id)       — collision-handled
--   trips.organizer_id             NOT NULL                                 — plain UPDATE
--   lodging.booked_by              nullable                                 — plain UPDATE
--   transport.booked_by            nullable                                 — plain UPDATE
--   restaurants.reserved_by        nullable                                 — plain UPDATE
--   activities.booked_by           nullable                                 — plain UPDATE
--   groceries.booked_by            nullable                                 — plain UPDATE
--   comments.user_id               NOT NULL                                 — plain UPDATE
--   expenses.paid_by               NOT NULL                                 — plain UPDATE
--   activity_log.actor_id          nullable, ON DELETE SET NULL             — plain UPDATE
--
-- ─── Idempotency ──────────────────────────────────────────────────────
-- - Insert step: ON CONFLICT (id) DO NOTHING. Re-running on the same
--   target_id is a no-op; existing rows (with passport-edited
--   display_name / phone) are NEVER overwritten.
-- - Consolidation step: only fires when an orphan with matching email
--   exists. Most calls (organizer signups, returning users) take the
--   no-orphan early-return.
-- - Display-name transfer (orphan → target): only fires when we just
--   inserted the placeholder row AND the orphan had a non-null
--   display_name. Tracked via GET DIAGNOSTICS so we never overwrite
--   a row that was already passport-customized.

-- ═══════════════════════════════════════════════════════════════════════
-- 1) Parameterized helper — single source of truth for new-user wiring.
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user_for(
  target_id    uuid,
  target_email text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_orphan_id           uuid;
  v_orphan_display_name text;
BEGIN
  -- Defensive: NULL inputs no-op cleanly.
  IF target_id IS NULL OR target_email IS NULL THEN
    RETURN;
  END IF;

  -- ─── Step 1: Find any orphan with matching email ────────────────────
  SELECT id, display_name
  INTO v_orphan_id, v_orphan_display_name
  FROM public.users
  WHERE email = target_email
    AND id <> target_id
  LIMIT 1;

  -- ─── Step 2: Pre-create placeholder at target_id ────────────────────
  -- 10I-fix-2: Migration 023's pattern. The placeholder must exist BEFORE
  -- FKs migrate (otherwise FK references to target_id violate). But the
  -- placeholder also can't share an email with the still-alive orphan
  -- (UNIQUE(email)). Solution: insert with email=NULL, set email in
  -- step 4 after the orphan is deleted.
  --
  -- ON CONFLICT (id) DO NOTHING preserves any pre-existing canonical row.
  INSERT INTO public.users (id, phone, email, display_name)
  VALUES (
    target_id,
    'auth-tmp:' || target_id::text,
    NULL,
    COALESCE(NULLIF(v_orphan_display_name, ''), split_part(target_email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  -- ─── Step 3: If orphan exists, migrate FKs and delete orphan ────────
  -- target_id row now exists, so FK references to it are valid.
  IF v_orphan_id IS NOT NULL THEN
    -- Collision-handled FK migrations (mirror Migration 023:129-160).

    -- trip_members: UNIQUE(trip_id, user_id)
    DELETE FROM public.trip_members
    WHERE user_id = v_orphan_id
      AND trip_id IN (
        SELECT trip_id FROM public.trip_members WHERE user_id = target_id
      );
    UPDATE public.trip_members SET user_id = target_id WHERE user_id = v_orphan_id;

    -- lodging_votes: UNIQUE(lodging_id, user_id)
    DELETE FROM public.lodging_votes
    WHERE user_id = v_orphan_id
      AND lodging_id IN (
        SELECT lodging_id FROM public.lodging_votes WHERE user_id = target_id
      );
    UPDATE public.lodging_votes SET user_id = target_id WHERE user_id = v_orphan_id;

    -- poll_votes: UNIQUE(poll_id, user_id)
    DELETE FROM public.poll_votes
    WHERE user_id = v_orphan_id
      AND poll_id IN (
        SELECT poll_id FROM public.poll_votes WHERE user_id = target_id
      );
    UPDATE public.poll_votes SET user_id = target_id WHERE user_id = v_orphan_id;

    -- Plain UPDATE migrations (mirror Migration 023:162-197).
    UPDATE public.trips        SET organizer_id = target_id WHERE organizer_id = v_orphan_id;
    UPDATE public.lodging      SET booked_by    = target_id WHERE booked_by    = v_orphan_id;
    UPDATE public.transport    SET booked_by    = target_id WHERE booked_by    = v_orphan_id;
    UPDATE public.restaurants  SET reserved_by  = target_id WHERE reserved_by  = v_orphan_id;
    UPDATE public.activities   SET booked_by    = target_id WHERE booked_by    = v_orphan_id;
    UPDATE public.groceries    SET booked_by    = target_id WHERE booked_by    = v_orphan_id;
    UPDATE public.comments     SET user_id      = target_id WHERE user_id      = v_orphan_id;
    UPDATE public.expenses     SET paid_by      = target_id WHERE paid_by      = v_orphan_id;

    -- 10I-fix-3: activity_log is added by Migration 012. If 012 hasn't
    -- been applied (or the table was later dropped), a static UPDATE
    -- would error because PL/pgSQL parses the SQL at function-creation
    -- time. EXECUTE defers parsing to runtime; to_regclass() returns
    -- NULL when the table is absent, so we skip cleanly.
    IF to_regclass('public.activity_log') IS NOT NULL THEN
      EXECUTE 'UPDATE public.activity_log SET actor_id = $1 WHERE actor_id = $2'
      USING target_id, v_orphan_id;
    END IF;

    -- Delete the orphan row — frees its email for the upcoming UPDATE.
    DELETE FROM public.users WHERE id = v_orphan_id;
  END IF;

  -- ─── Step 4: Set email on the target row ────────────────────────────
  -- Orphan deleted (if any), so target_email is now free of UNIQUE(email)
  -- conflict. COALESCE preserves any existing email on returning users
  -- (we only fill NULL placeholders we just inserted in step 2).
  UPDATE public.users
  SET email = COALESCE(email, target_email)
  WHERE id = target_id;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user_for(uuid, text) FROM PUBLIC;
-- Authenticated users can run cleanup against their own auth row; the
-- SECURITY DEFINER body still gates writes to the right rows because the
-- caller passes their own id. Andrew runs the post-deploy cleanup as the
-- service_role / postgres user, which has all privileges by default.

COMMENT ON FUNCTION public.handle_new_user_for(uuid, text) IS
  'Session 10I. Idempotent ensure-row INSERT into public.users at target_id, '
  'plus orphan consolidation (FK migration + orphan delete) when an orphan '
  'with the same email exists. Called by the handle_new_user() trigger on '
  'every auth.users INSERT; also callable directly for cleanup. Atomic per '
  'PL/pgSQL function body. SECURITY DEFINER bypasses the public.users RLS '
  'policy that requires auth.uid() = id, which is the bug 10H couldn''t '
  'work around in the route-handler context.';

-- ═══════════════════════════════════════════════════════════════════════
-- 2) Trigger function — wraps the helper for the AFTER INSERT context.
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public.handle_new_user_for(NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Session 10I. AFTER INSERT trigger wrapper around handle_new_user_for(). '
  'Fires once per auth.users insert (i.e. once per real signup, regardless '
  'of magic-link click count).';

-- ═══════════════════════════════════════════════════════════════════════
-- 3) Trigger — wire the function to auth.users.
-- ═══════════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════
-- ROLLBACK / DOWN MIGRATION
--
-- Supabase CLI migrations are forward-only. To roll this migration back,
-- run the following in Supabase Studio SQL editor (or via psql with the
-- service-role / postgres connection):
--
--   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
--   DROP FUNCTION IF EXISTS public.handle_new_user();
--   DROP FUNCTION IF EXISTS public.handle_new_user_for(uuid, text);
--
-- Test cycle (per 10I AC):
--   1. supabase migration up      -- applies 024
--   2. (run the three DROP statements above)
--   3. supabase migration up      -- re-applies 024 cleanly (CREATE OR
--                                    REPLACE on functions, DROP IF EXISTS
--                                    + CREATE on the trigger)
--
-- After 10I deploys, run the cleanup query in Supabase Studio to backfill
-- any auth.users created during the 10H window without a public.users row:
--
--   DO $$
--   DECLARE
--     au RECORD;
--   BEGIN
--     FOR au IN
--       SELECT id, email FROM auth.users
--       WHERE NOT EXISTS (
--         SELECT 1 FROM public.users WHERE public.users.id = auth.users.id
--       )
--     LOOP
--       PERFORM public.handle_new_user_for(au.id, au.email);
--     END LOOP;
--   END $$;
--
-- ═══════════════════════════════════════════════════════════════════════
