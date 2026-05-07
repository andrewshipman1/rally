-- Session 12A (Lock-A): actual_cost + cost_finalized_at on shared-cost
-- item types — lodging, transport, and the headliner (trip-level
-- columns).
--
-- ─── Estimate vs. Actual ──────────────────────────────────────────────
-- Pre-lock, every cost surfaced in Rally is an ESTIMATE (per the
-- project rule: "All costs are estimates, labeled as such").
-- Existing estimate columns are preserved and continue to feed the
-- sell-phase cost summary:
--
--   lodging.cost_per_night, lodging.total_cost   — estimate (002)
--   transport.estimated_total                    — estimate (002, 8M)
--   trips.headliner_cost_cents                   — estimate (017)
--
-- Lock-phase introduces ACTUAL costs: the final number the organizer
-- confirms during the Lock-B wizard before charging their card. These
-- are what attendees owe back via Module A's commitment ceremony.
-- New columns in this migration:
--
--   lodging.actual_cost              numeric(10,2)
--   lodging.cost_finalized_at        timestamptz
--   transport.actual_cost            numeric(10,2)
--   transport.cost_finalized_at      timestamptz
--   trips.headliner_actual_cost_cents integer        ← cents per
--   trips.headliner_cost_finalized_at timestamptz   existing convention
--
-- Headliner naming note. headliner_* columns on trips use cents
-- (headliner_cost_cents integer) per the convention set in 017. We
-- match that convention with `headliner_actual_cost_cents integer`
-- rather than introducing a numeric(10,2) sibling. Mixing dollar
-- precision tiers under the same prefix is the kind of subtle mismatch
-- that produces math bugs at lock time. Lodging and transport already
-- store costs as `numeric(10,2)` (002), so their actuals follow that.
--
-- Estimate columns are NOT renamed, NOT dropped, NOT repurposed. They
-- continue to feed pre-lock cost-summary math; actuals overlay them
-- post-lock per the strategy doc's Module A flow ("Surfaces the existing
-- estimate as a prefilled value but treats it as 'needs confirmation'").

ALTER TABLE public.lodging
  ADD COLUMN IF NOT EXISTS actual_cost        numeric(10,2),
  ADD COLUMN IF NOT EXISTS cost_finalized_at  timestamptz;

ALTER TABLE public.transport
  ADD COLUMN IF NOT EXISTS actual_cost        numeric(10,2),
  ADD COLUMN IF NOT EXISTS cost_finalized_at  timestamptz;

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS headliner_actual_cost_cents integer,
  ADD COLUMN IF NOT EXISTS headliner_cost_finalized_at timestamptz;

COMMENT ON COLUMN public.lodging.actual_cost IS
  'Lock-phase actual cost (group total). Written by fireLock when the '
  'lodging item is allocated organizer-books. Distinct from total_cost '
  '(estimate) which remains the pre-lock figure. NULL pre-lock.';

COMMENT ON COLUMN public.lodging.cost_finalized_at IS
  'Timestamp when actual_cost was confirmed by the organizer in the '
  'lock wizard. NULL pre-lock; non-null pairs with non-null actual_cost.';

COMMENT ON COLUMN public.transport.actual_cost IS
  'Lock-phase actual cost (line-item total). Written by fireLock when '
  'this transport item is allocated organizer-books. Distinct from '
  'estimated_total (pre-lock estimate). NULL pre-lock.';

COMMENT ON COLUMN public.transport.cost_finalized_at IS
  'Timestamp when actual_cost was confirmed by the organizer in the '
  'lock wizard. NULL pre-lock; non-null pairs with non-null actual_cost.';

COMMENT ON COLUMN public.trips.headliner_actual_cost_cents IS
  'Lock-phase actual cost for the trip headliner (cents, matching the '
  'headliner_cost_cents convention from migration 017). Written by '
  'fireLock when the headliner is allocated organizer-books. Distinct '
  'from headliner_cost_cents (pre-lock estimate). NULL pre-lock.';

COMMENT ON COLUMN public.trips.headliner_cost_finalized_at IS
  'Timestamp when headliner_actual_cost_cents was confirmed by the '
  'organizer in the lock wizard. NULL pre-lock; non-null pairs with '
  'non-null headliner_actual_cost_cents.';

-- ─── Idempotency ──────────────────────────────────────────────────────
-- All ALTERs use ADD COLUMN IF NOT EXISTS. Re-applying after a
-- successful apply is a no-op apart from comment-catalog refresh.

-- ─── Rollback ─────────────────────────────────────────────────────────
-- Supabase migrations are forward-only. To roll back, run in Studio:
--   ALTER TABLE public.lodging   DROP COLUMN IF EXISTS cost_finalized_at;
--   ALTER TABLE public.lodging   DROP COLUMN IF EXISTS actual_cost;
--   ALTER TABLE public.transport DROP COLUMN IF EXISTS cost_finalized_at;
--   ALTER TABLE public.transport DROP COLUMN IF EXISTS actual_cost;
--   ALTER TABLE public.trips     DROP COLUMN IF EXISTS headliner_cost_finalized_at;
--   ALTER TABLE public.trips     DROP COLUMN IF EXISTS headliner_actual_cost_cents;
