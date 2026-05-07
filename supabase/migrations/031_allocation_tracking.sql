-- Session 12A (Lock-A): Allocation tracking on shared-cost items.
--
-- The lock-phase wizard (Lock-B) forces a binary per allocatable item:
-- *"Are you booking this on behalf of the group, or are the attendees
-- booking it independently?"* This migration adds the columns that
-- record the answer.
--
-- ─── Three-state encoding (locked, Cowork session 2, 2026-05-03) ──────
--
--   allocation_owner          allocation_individual    Meaning
--   ─────────────────────────  ──────────────────────  ──────────────────────
--   NULL                      false                    Unallocated (pre-lock)
--   <organizer user_id>       false                    "I'm booking" (organizer fronts cash)
--   NULL                      true                     "Each attendee books"
--
-- Why two columns and not a single enum or sentinel: a single
-- nullable uuid can't distinguish "unallocated" from "individual"
-- without a magic sentinel value (a fake UUID), which would silently
-- break any code that assumes uuids point to real users. The boolean
-- promotes "individual" to a first-class state. Trade-off: callers
-- must check both columns; the disjoint truth table above is the
-- contract enforced at write-time by fireLock.
--
-- Column scope:
--
--   lodging.allocation_owner       uuid references users(id)
--   lodging.allocation_individual  boolean default false
--   transport.allocation_owner     uuid references users(id)
--   transport.allocation_individual boolean default false
--   trips.headliner_allocation_owner       uuid references users(id)
--   trips.headliner_allocation_individual  boolean default false
--
-- Headliner allocation lives on `trips` (singular trip-level
-- columns, per migration 017's headliner_* shape). Lodging and
-- transport are per-row item tables.
--
-- ─── Multi-trip safety / ON DELETE behavior ───────────────────────────
-- allocation_owner FK is intentionally `ON DELETE NO ACTION` (the
-- default). If an organizer is deleted (rare; 027 handles MEMBER
-- removal, not org account deletion), the lock-phase allocation rows
-- become inconsistent and need explicit reconciliation — failing
-- loudly is better than silently nulling allocations that were the
-- source of truth for a settled trip's cost ledger.
--
-- DEFAULT false on the boolean: existing rows added pre-lock get
-- false automatically (= unallocated, matching the (NULL, false)
-- truth-table state). No backfill needed.

ALTER TABLE public.lodging
  ADD COLUMN IF NOT EXISTS allocation_owner       uuid REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS allocation_individual  boolean NOT NULL DEFAULT false;

ALTER TABLE public.transport
  ADD COLUMN IF NOT EXISTS allocation_owner       uuid REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS allocation_individual  boolean NOT NULL DEFAULT false;

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS headliner_allocation_owner       uuid REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS headliner_allocation_individual  boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.lodging.allocation_owner IS
  'Lock-phase allocation owner (user.id of the organizer when '
  'allocation_individual = false). NULL = unallocated OR individual '
  'depending on allocation_individual. Three-state: '
  '(NULL, false)=unallocated, (uuid, false)=organizer-books, '
  '(NULL, true)=individual-books.';
COMMENT ON COLUMN public.lodging.allocation_individual IS
  'Lock-phase allocation flag — true when the item is pushed to '
  'individual attendees. Disjoint from allocation_owner being non-null '
  '(both being set is invalid; fireLock writes them as a pair).';

COMMENT ON COLUMN public.transport.allocation_owner IS
  'Lock-phase allocation owner. See lodging.allocation_owner.';
COMMENT ON COLUMN public.transport.allocation_individual IS
  'Lock-phase allocation flag — true when this transport line is '
  'pushed to individual attendees. See lodging.allocation_individual.';

COMMENT ON COLUMN public.trips.headliner_allocation_owner IS
  'Lock-phase allocation owner for the trip headliner. See '
  'lodging.allocation_owner. NULL pre-lock or when individual.';
COMMENT ON COLUMN public.trips.headliner_allocation_individual IS
  'Lock-phase allocation flag for the headliner. See '
  'lodging.allocation_individual.';

-- ─── Idempotency ──────────────────────────────────────────────────────
-- All ALTERs use ADD COLUMN IF NOT EXISTS. Re-applying is a no-op.
-- The boolean default of false is set on the column at ADD time,
-- which Postgres handles in metadata only (no row rewrite) since
-- PG 11+.

-- ─── Rollback ─────────────────────────────────────────────────────────
-- Supabase migrations are forward-only. To roll back, run in Studio:
--   ALTER TABLE public.lodging   DROP COLUMN IF EXISTS allocation_individual;
--   ALTER TABLE public.lodging   DROP COLUMN IF EXISTS allocation_owner;
--   ALTER TABLE public.transport DROP COLUMN IF EXISTS allocation_individual;
--   ALTER TABLE public.transport DROP COLUMN IF EXISTS allocation_owner;
--   ALTER TABLE public.trips     DROP COLUMN IF EXISTS headliner_allocation_individual;
--   ALTER TABLE public.trips     DROP COLUMN IF EXISTS headliner_allocation_owner;
