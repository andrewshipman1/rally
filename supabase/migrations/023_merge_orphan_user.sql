-- Session 9S — invite-then-signup orphan merge flow.
--
-- Context. `api/invite/route.ts` creates a `public.users` row with a
-- random UUID id (not auth-linked) when an organizer invites someone
-- who hasn't signed up yet — the "orphan" row holds invite + RSVP
-- state. When the invitee later signs up via magic link, Supabase
-- Auth issues them a NEW id in `auth.users`. ProfileSetup then tries
-- to upsert a `public.users` row with that new id + the invitee's
-- email. The 9R `UNIQUE(email)` constraint catches the duplicate and
-- throws — user sees "Failed to save profile."
--
-- Fix. Before ProfileSetup's upsert runs, call this RPC. It locates
-- the orphan row by the caller's auth email, migrates every FK that
-- points at the orphan's id onto the auth user's id, then deletes
-- the orphan. The upsert downstream becomes a no-op.
--
-- Transaction semantics. A single PL/pgSQL function body runs
-- atomically — if any statement fails, every prior statement rolls
-- back. That's the "multi-table transaction" the brief required;
-- the Supabase JS client doesn't expose one directly.
--
-- Security. SECURITY DEFINER (runs with function-owner privileges so
-- it can touch cross-user FKs), but the email comes from `auth.uid()`
-- + a lookup in `auth.users` rather than a client-passed parameter.
-- An authenticated caller can only ever merge THEIR OWN orphan — the
-- id/email match is server-side and unforgeable. `search_path` is
-- pinned to `public, pg_temp` to neutralize search-path hijack
-- attacks that SECURITY DEFINER functions are classically vulnerable
-- to.
--
-- FK coverage (audited against migrations 001-022; confirmed with
-- grep `references (public\.)?users(id)`):
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
-- Collision resolution for the three unique-indexed tables: if the
-- auth user already has a row for the same composite key (trip,
-- lodging, or poll), the orphan's row is redundant and gets DELETED.
-- Otherwise the orphan's row is UPDATEd onto the auth user's id.
-- Rationale: the auth-linked row is canonical — it represents the
-- user's actual identity. Orphan data only exists as a placeholder.
--
-- Phone-only invites (email null) are NOT covered by this function.
-- `api/invite/route.ts:62-73` creates rows with `phone=X, email=null`
-- for phone-based invites; UNIQUE(email) doesn't constrain those
-- rows and they have no email to match against on signup. Logged as
-- a 9T follow-up.
--
-- Idempotent: running the migration against a DB that already has
-- the function is `CREATE OR REPLACE`. Running the function when no
-- orphan exists returns NULL with zero side effects.

CREATE OR REPLACE FUNCTION public.merge_orphan_user_by_email()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_target_id uuid := auth.uid();
  v_email     text;
  v_orphan_id uuid;
BEGIN
  -- Unauthenticated callers get nothing. Anonymous RPC invocations
  -- return null rather than raising — ProfileSetup should treat
  -- null as "nothing to merge, carry on."
  IF v_target_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Pull email from auth.users directly. Never trust a client-
  -- supplied email parameter; that would let an authenticated user
  -- trigger a merge for a DIFFERENT email.
  SELECT email INTO v_email FROM auth.users WHERE id = v_target_id;
  IF v_email IS NULL THEN
    RETURN NULL;
  END IF;

  -- Locate the orphan: same email, distinct id.
  SELECT id INTO v_orphan_id
  FROM public.users
  WHERE email = v_email
    AND id <> v_target_id
  LIMIT 1;

  IF v_orphan_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- ─── Pre-create target's placeholder row ─────────────────────
  -- FKs reference `public.users(id)` NOT NULL. Before we can point
  -- them at `v_target_id`, a row with that id must exist. Neither
  -- the invite flow nor ProfileSetup has run yet for this auth
  -- user, so the row is missing.
  --
  -- Create a bare placeholder now: email=NULL (avoids colliding
  -- with the orphan's email under 9R's UNIQUE(email)), phone set
  -- to a target-id-derived placeholder (satisfies NOT NULL UNIQUE
  -- on phone), display_name carried over from the orphan so the
  -- row looks sane in any read between this RPC and ProfileSetup's
  -- downstream upsert (which overwrites phone / email /
  -- display_name / bio / instagram_handle with whatever the user
  -- just typed).
  -- `ON CONFLICT (id) DO NOTHING` covers the edge case where the
  -- caller already has a `public.users` row from some other flow
  -- (unusual but defensible). In that case we skip the placeholder
  -- insert and go straight to FK migration.
  INSERT INTO public.users (id, phone, email, display_name)
  SELECT
    v_target_id,
    'merge-tmp:' || v_target_id::text,
    NULL,
    COALESCE(display_name, 'new rally member')
  FROM public.users
  WHERE id = v_orphan_id
  ON CONFLICT (id) DO NOTHING;

  -- ─── Collision-handled FK migrations ─────────────────────────
  -- trip_members: UNIQUE(trip_id, user_id). If the auth user
  -- already has a row for a trip the orphan is also a member of,
  -- drop the orphan's row (auth user's row is canonical).
  DELETE FROM public.trip_members
  WHERE user_id = v_orphan_id
    AND trip_id IN (
      SELECT trip_id FROM public.trip_members WHERE user_id = v_target_id
    );
  UPDATE public.trip_members
     SET user_id = v_target_id
   WHERE user_id = v_orphan_id;

  -- lodging_votes: UNIQUE(lodging_id, user_id).
  DELETE FROM public.lodging_votes
  WHERE user_id = v_orphan_id
    AND lodging_id IN (
      SELECT lodging_id FROM public.lodging_votes WHERE user_id = v_target_id
    );
  UPDATE public.lodging_votes
     SET user_id = v_target_id
   WHERE user_id = v_orphan_id;

  -- poll_votes: UNIQUE(poll_id, user_id).
  DELETE FROM public.poll_votes
  WHERE user_id = v_orphan_id
    AND poll_id IN (
      SELECT poll_id FROM public.poll_votes WHERE user_id = v_target_id
    );
  UPDATE public.poll_votes
     SET user_id = v_target_id
   WHERE user_id = v_orphan_id;

  -- ─── Plain UPDATE migrations (no unique constraints) ─────────
  UPDATE public.trips
     SET organizer_id = v_target_id
   WHERE organizer_id = v_orphan_id;

  UPDATE public.lodging
     SET booked_by = v_target_id
   WHERE booked_by = v_orphan_id;

  UPDATE public.transport
     SET booked_by = v_target_id
   WHERE booked_by = v_orphan_id;

  UPDATE public.restaurants
     SET reserved_by = v_target_id
   WHERE reserved_by = v_orphan_id;

  UPDATE public.activities
     SET booked_by = v_target_id
   WHERE booked_by = v_orphan_id;

  UPDATE public.groceries
     SET booked_by = v_target_id
   WHERE booked_by = v_orphan_id;

  UPDATE public.comments
     SET user_id = v_target_id
   WHERE user_id = v_orphan_id;

  UPDATE public.expenses
     SET paid_by = v_target_id
   WHERE paid_by = v_orphan_id;

  UPDATE public.activity_log
     SET actor_id = v_target_id
   WHERE actor_id = v_orphan_id;

  -- ─── Delete the orphan row last ──────────────────────────────
  -- All FKs have been migrated; the orphan is now truly dangling.
  -- DELETE would still fail if any FK column is missed above, so
  -- this doubles as an integrity check.
  DELETE FROM public.users WHERE id = v_orphan_id;

  RETURN v_orphan_id;
END;
$$;

-- Lock down the function: only authenticated users may call it.
-- SECURITY DEFINER means the runtime role is the function owner,
-- not the caller — restricting EXECUTE at the grant layer is what
-- keeps anonymous clients out.
REVOKE ALL ON FUNCTION public.merge_orphan_user_by_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.merge_orphan_user_by_email() TO authenticated;

COMMENT ON FUNCTION public.merge_orphan_user_by_email() IS
  'Session 9S. Merges an orphan public.users row (email-matched, id-distinct) '
  'into the calling auth user. Returns the orphan id on success, NULL if no '
  'orphan exists. Atomic (PL/pgSQL function body). Callable only by '
  'authenticated users; email is derived from auth.uid() server-side.';
