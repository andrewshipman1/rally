-- Session 12A (Lock-A): commitments table + transactional fire_lock RPC.
--
-- Two scope items packaged together because the RPC depends on
-- columns introduced by 028–031 PLUS the commitments table created
-- here, and the brief calls for a single-transaction lock fire.
-- Supabase migrations run in alphanumeric order, so 032 sits AFTER
-- 028–031 and the function body's column references resolve cleanly.
--
-- Why not split fire_lock into a 6th migration: it's a logical pair
-- with the commitments shape (both ARE the lock-phase mechanic) and
-- splitting forces a cross-file dependency comment. Keeping them
-- co-located keeps the lock-A unit reviewable as one file.
--
-- ─── (a) commitments table ────────────────────────────────────────────
-- One row per attendee per trip records the moment the attendee
-- tapped "i'm in" on Module A's aggregate-share commitment surface
-- (Lock-D will INSERT here; Lock-A creates the empty table).
--
-- Shape locked by Cowork session 2 (2026-05-03):
--   attendee_user_id  uuid REFERENCES users(id) — the committing user
--   trip_id           uuid REFERENCES trips(id) ON DELETE CASCADE
--   committed_at      timestamptz NOT NULL DEFAULT now()
--   UNIQUE (attendee_user_id, trip_id) — one commitment per user per trip
--
-- No "uncommit" path in v0: the strategy doc locks "no disagree
-- button. Silence (never tapping) is the only refusal path." Append-
-- only by RLS policy.

CREATE TABLE IF NOT EXISTS public.commitments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_user_id  uuid NOT NULL REFERENCES public.users(id),
  trip_id           uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  committed_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attendee_user_id, trip_id)
);

CREATE INDEX IF NOT EXISTS idx_commitments_trip ON public.commitments(trip_id);
CREATE INDEX IF NOT EXISTS idx_commitments_user ON public.commitments(attendee_user_id);

ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;

-- RLS mirrors the existing lodging_votes pattern (002:421-423):
-- public read, authenticated insert scoped to the caller's own row.
-- DROP-then-CREATE so re-applying the migration rebinds the policies
-- (CREATE POLICY has no OR REPLACE).
DROP POLICY IF EXISTS "Commitments viewable"        ON public.commitments;
DROP POLICY IF EXISTS "Users can commit themselves" ON public.commitments;

CREATE POLICY "Commitments viewable"
  ON public.commitments FOR SELECT
  USING (true);

CREATE POLICY "Users can commit themselves"
  ON public.commitments FOR INSERT
  WITH CHECK (auth.uid() = attendee_user_id);

-- No UPDATE or DELETE policy: append-only in v0. Reverts / corrections
-- are out of scope for the lock-phase commitment ceremony.

COMMENT ON TABLE public.commitments IS
  'Lock-phase aggregate commitment record. One row per attendee per '
  'trip, INSERTed by Lock-D when the attendee taps "i''m in" on '
  'Module A''s shared-cost commitment surface. Append-only in v0.';

-- ═════════════════════════════════════════════════════════════════════
-- (b) fire_lock RPC — transactional sell → lock state transition.
-- ═════════════════════════════════════════════════════════════════════
--
-- Called from src/app/actions/fire-lock.ts via supabase.rpc('fire_lock',
-- { p_trip_id, p_lodging_id, p_allocations, p_lock_deadline,
--   p_payment_handles }). The body is a single PL/pgSQL function and
-- therefore runs in one Postgres transaction — partial-state lock is
-- impossible. Any RAISE EXCEPTION rolls back ALL prior writes in the
-- function call.
--
-- Returns:
--   on success: { ok: true,  lockedAt: ISO_TIMESTAMP }
--   on logical error (no writes): { ok: false, error: 'already_locked' |
--     'not_organizer' | 'not_authenticated' | 'trip_not_found' }
--   on validation error (rolled back): RAISES 'invalid_allocation_mode' |
--     'missing_actual_cost_for_organizer_books' |
--     'headliner_item_id_mismatch' | 'unknown_item_type' |
--     'concurrent_lock_attempt' — server action surfaces these as
--     { ok: false, error: <code> }.
--
-- ─── Param shape ──────────────────────────────────────────────────────
--   p_trip_id          uuid           — trip being locked
--   p_lodging_id       uuid (nullable) — vote-winner override; if non-null,
--                                       sets is_selected = (id = p_lodging_id)
--                                       across this trip's lodging rows
--   p_allocations      jsonb          — array of allocation objects:
--     [
--       { "itemType":   "lodging" | "transport" | "headliner",
--         "itemId":     uuid (for headliner: pass the trip_id),
--         "mode":       "organizer_books" | "individual_books",
--         "actualCost": number (dollars; required when mode=organizer_books)
--       }, ...
--     ]
--     Note: for headliner items, actualCost is dollars and gets
--     converted to cents internally (matching headliner_actual_cost_cents
--     from migration 030 which follows the headliner_cost_cents
--     convention from migration 017).
--   p_lock_deadline    timestamptz    — booking deadline (drives Lock-G)
--   p_payment_handles  jsonb (nullable) — { venmo?, zelle?, cashapp? }
--                                         applied via COALESCE so missing
--                                         keys preserve existing values
--
-- ─── Auth model ───────────────────────────────────────────────────────
-- SECURITY DEFINER + auth.uid() = trips.organizer_id check. The
-- function bypasses RLS for writes (DEFINER runs as the function
-- owner, typically postgres/supabase_admin) but pins authorization
-- to the caller's JWT identity via auth.uid(). The server action's
-- own auth check is defense-in-depth + a faster error path.
--
-- ─── Multi-trip safety ────────────────────────────────────────────────
-- Every UPDATE is scoped to `WHERE trip_id = p_trip_id` (or, for
-- trips/users tables that don't have a trip_id, scoped by the explicit
-- target row id). Mirrors migration 027's per-trip cleanup discipline.
-- Holding → out auto-bump touches ONLY this trip's trip_members rows.
-- Payment-handle update touches ONLY the organizer's users row.

CREATE OR REPLACE FUNCTION public.fire_lock(
  p_trip_id          uuid,
  p_lodging_id       uuid,
  p_allocations      jsonb,
  p_lock_deadline    timestamptz,
  p_payment_handles  jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller       uuid := auth.uid();
  v_phase        trip_phase;
  v_organizer    uuid;
  v_alloc        jsonb;
  v_item_type    text;
  v_item_id      uuid;
  v_mode         text;
  v_cost_text    text;
  v_now          timestamptz := now();
BEGIN
  -- ─── (1) Auth + trip existence ──────────────────────────────────────
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT phase, organizer_id
    INTO v_phase, v_organizer
    FROM public.trips
   WHERE id = p_trip_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'trip_not_found');
  END IF;

  IF v_caller <> v_organizer THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_organizer');
  END IF;

  -- ─── (2) Idempotent guard: already locked (or beyond) → no-op ───────
  -- Returns BEFORE any UPDATE runs, so DB state is unchanged.
  IF v_phase <> 'sell' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_locked');
  END IF;

  -- ─── (3) Lodging vote winner ────────────────────────────────────────
  -- Wizard's confirm-or-override step. Sets is_selected = true on the
  -- chosen lodging and false on every other lodging row for this trip.
  -- Skipped when p_lodging_id IS NULL (trip has no lodging items).
  IF p_lodging_id IS NOT NULL THEN
    UPDATE public.lodging
       SET is_selected = (id = p_lodging_id)
     WHERE trip_id = p_trip_id;
  END IF;

  -- ─── (4) Allocations loop ───────────────────────────────────────────
  -- Iterates the JSONB array; writes allocation_owner +
  -- allocation_individual + (when organizer-books) actual_cost +
  -- cost_finalized_at on each item table per item type.
  IF p_allocations IS NOT NULL THEN
    FOR v_alloc IN SELECT * FROM jsonb_array_elements(p_allocations)
    LOOP
      v_item_type := v_alloc->>'itemType';
      v_item_id   := (v_alloc->>'itemId')::uuid;
      v_mode      := v_alloc->>'mode';
      v_cost_text := v_alloc->>'actualCost';

      IF v_mode NOT IN ('organizer_books', 'individual_books') THEN
        RAISE EXCEPTION 'invalid_allocation_mode: %', v_mode;
      END IF;

      IF v_mode = 'organizer_books' AND v_cost_text IS NULL THEN
        RAISE EXCEPTION 'missing_actual_cost_for_organizer_books';
      END IF;

      IF v_item_type = 'lodging' THEN
        IF v_mode = 'organizer_books' THEN
          UPDATE public.lodging
             SET allocation_owner      = v_caller,
                 allocation_individual = false,
                 actual_cost           = v_cost_text::numeric(10,2),
                 cost_finalized_at     = v_now
           WHERE id = v_item_id AND trip_id = p_trip_id;
        ELSE
          UPDATE public.lodging
             SET allocation_owner      = NULL,
                 allocation_individual = true
           WHERE id = v_item_id AND trip_id = p_trip_id;
        END IF;

      ELSIF v_item_type = 'transport' THEN
        IF v_mode = 'organizer_books' THEN
          UPDATE public.transport
             SET allocation_owner      = v_caller,
                 allocation_individual = false,
                 actual_cost           = v_cost_text::numeric(10,2),
                 cost_finalized_at     = v_now
           WHERE id = v_item_id AND trip_id = p_trip_id;
        ELSE
          UPDATE public.transport
             SET allocation_owner      = NULL,
                 allocation_individual = true
           WHERE id = v_item_id AND trip_id = p_trip_id;
        END IF;

      ELSIF v_item_type = 'headliner' THEN
        -- Headliner is a singular trip-level concept — its "item id"
        -- collapses to the trip id. Guard against client-side
        -- confusion (passing some other UUID by mistake).
        IF v_item_id <> p_trip_id THEN
          RAISE EXCEPTION 'headliner_item_id_mismatch';
        END IF;
        IF v_mode = 'organizer_books' THEN
          -- actualCost is dollars; convert to cents to match the
          -- headliner_*_cents convention from migration 017/030.
          UPDATE public.trips
             SET headliner_allocation_owner       = v_caller,
                 headliner_allocation_individual  = false,
                 headliner_actual_cost_cents      = (v_cost_text::numeric * 100)::integer,
                 headliner_cost_finalized_at      = v_now
           WHERE id = p_trip_id;
        ELSE
          UPDATE public.trips
             SET headliner_allocation_owner       = NULL,
                 headliner_allocation_individual  = true
           WHERE id = p_trip_id;
        END IF;

      ELSE
        RAISE EXCEPTION 'unknown_item_type: %', v_item_type;
      END IF;
    END LOOP;
  END IF;

  -- ─── (5) Holding → out auto-bump (multi-trip safe) ──────────────────
  -- Scoped to THIS trip via trip_id = p_trip_id. The user's holdings on
  -- OTHER trips are untouched. Mirrors migration 027's per-trip
  -- discipline.
  UPDATE public.trip_members
     SET rsvp = 'out'::rsvp_status
   WHERE trip_id = p_trip_id
     AND rsvp = 'holding'::rsvp_status;

  -- ─── (6) Phase flip + lock_deadline ─────────────────────────────────
  -- CAS guard via WHERE phase = 'sell' catches a concurrent fire by
  -- another organizer session: if a parallel call already flipped the
  -- phase to lock, the row count is 0 and we abort the entire
  -- transaction (rolling back the allocation writes above too).
  UPDATE public.trips
     SET phase = 'lock'::trip_phase,
         lock_deadline = p_lock_deadline
   WHERE id = p_trip_id
     AND phase = 'sell'::trip_phase;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'concurrent_lock_attempt';
  END IF;

  -- ─── (7) Payment handles (organizer's user record only) ─────────────
  -- COALESCE preserves existing values for keys not present in the
  -- jsonb (or NULL-valued); empty strings DO overwrite (lets the user
  -- explicitly clear a handle by passing ""). Scoped to id = v_caller
  -- so only the organizer's row is touched.
  IF p_payment_handles IS NOT NULL THEN
    UPDATE public.users
       SET venmo_handle   = COALESCE(p_payment_handles->>'venmo',   venmo_handle),
           zelle_handle   = COALESCE(p_payment_handles->>'zelle',   zelle_handle),
           cashapp_handle = COALESCE(p_payment_handles->>'cashapp', cashapp_handle)
     WHERE id = v_caller;
  END IF;

  RETURN jsonb_build_object('ok', true, 'lockedAt', v_now);
END;
$$;

REVOKE ALL ON FUNCTION public.fire_lock(uuid, uuid, jsonb, timestamptz, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fire_lock(uuid, uuid, jsonb, timestamptz, jsonb) TO authenticated;

COMMENT ON FUNCTION public.fire_lock(uuid, uuid, jsonb, timestamptz, jsonb) IS
  'Lock-A transactional sell→lock state transition. Validates organizer '
  'auth, idempotent on already-locked trips (returns error code without '
  'writes), applies allocations + actual_cost across lodging/transport/'
  'headliner, bumps holding→out (per-trip), flips phase, sets '
  'lock_deadline, optionally saves payment handles. Single PG '
  'transaction — RAISE EXCEPTION rolls back ALL writes.';

-- ─── Idempotency ──────────────────────────────────────────────────────
-- - CREATE TABLE IF NOT EXISTS for the commitments table.
-- - CREATE INDEX IF NOT EXISTS for both indexes.
-- - DROP POLICY IF EXISTS + CREATE POLICY for the two RLS policies
--   (CREATE POLICY has no OR REPLACE).
-- - CREATE OR REPLACE FUNCTION for fire_lock.
-- Re-applying after a successful apply rebinds policies + the function
-- body to the (unchanged) definitions; no schema change beyond catalog
-- refresh.

-- ─── Rollback ─────────────────────────────────────────────────────────
-- Supabase migrations are forward-only. To roll back, run in Studio:
--   DROP FUNCTION IF EXISTS public.fire_lock(uuid, uuid, jsonb, timestamptz, jsonb);
--   DROP POLICY IF EXISTS "Users can commit themselves" ON public.commitments;
--   DROP POLICY IF EXISTS "Commitments viewable"        ON public.commitments;
--   DROP TABLE IF EXISTS public.commitments;
