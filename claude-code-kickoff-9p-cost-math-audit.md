# Claude Code — Session 9P kickoff (cost math audit follow-up — server-side reconciliation)

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Part 3 applies. This session touches **cost math that ripples across
every existing trip.** Extra caution on the preservation guardrail.
Validate every math change against live data before declaring
done — the brief's ACs explicitly include multi-trip regression
verification.

## Turbopack cache warning (BB-5)

Standard recovery before starting the dev server:
```
pkill -9 node
lsof -iTCP:3000 -sTCP:LISTEN   # must be empty
lsof -iTCP:3001 -sTCP:LISTEN   # must be empty
cd ~/Desktop/claude/rally
rm -rf .next node_modules/.cache
npm run dev
# WAIT 30-60s after "Ready in Xs"
```

## Then read the brief

```
rally-fix-plan-v1.md → ### Session 9P: "Cost math audit follow-up —
                        server-side reconciliation"
                     → also: 9O Actuals (premise — the 4 findings
                             that led to this session)
                     → also: 9J Actuals (lodging leading-vote math
                             — you'll sync the server to this)
                     → also: 9L Actuals (everything-else wiring —
                             provisions + other data path)
                     → also: BB-5 (Turbopack workaround)
```

## Canonical code references

```
src/types/index.ts                                 (PRIMARY FILE — TripCostSummary + calculateTripCost)
src/components/trip/CostBreakdown.tsx              (RENDER new provisions + other rows)
src/components/trip/builder/LodgingCard.tsx        (REFERENCE — pickLodgingForRollup function to sync)
src/app/trip/[slug]/page.tsx (lines 120-130)       (REFERENCE — existing provisions/other dollar derivation pattern)

/trip/sjtIcYZB                                     (Coachella — primary Cowork QA target; has provisions + other + lodging + no restaurants)
(need 2-3 more trips with restaurants for AC9/AC12 verification)
```

## TL;DR

9O's math audit escalated four findings to this session. Fix all
four in `src/types/index.ts` (primary) + render two new rows in
`CostBreakdown.tsx` (secondary). No schema changes, no migrations,
no upstream-module edits.

1. **Expose provisions + other on TripCostSummary.** Groceries-table
   rows named 'Provisions' / 'Other' are already summed into
   `sharedGroceries` server-side but never surfaced individually.
   Split them out; render as two new rows in CostBreakdown between
   activities and the footer.

2. **Reallocate shared/yours buckets.** Current `calculateTripCost`
   only puts (lodging + shared_transport + shared_groceries + shared_restaurants)
   into `shared_total` and (flights + ind_restaurants + ind_transport)
   into `individual_total`. Missing from the split: `headliner_per_person`,
   `activities_per_person`, viewer arrival, and the per-viewer/shared
   distribution of provisions + other. Result on Coachella: `$6,400
   shared + $0 yours = $6,400` ≠ `$8,100 hero`. **Redistribute** so
   that footer = hero.

3. **Sync server lodging selector to client's `pickLodgingForRollup`.**
   Client picks via 9J priority (locked → leading-vote → first-added);
   server uses `find(is_selected) || lodging[0]` (no leading-vote
   path). When spot costs differ and nothing's locked, the lodging
   row and the `per_person_shared` contribution disagree. Hidden on
   Coachella by coincidence. Extract the priority function to a
   shared util.

4. **Drop restaurants from `calculateTripCost` rollup.** Restaurants
   are go-phase data per skill rules — shouldn't contribute to
   sketch/sell hero. Remove `sharedRestaurants` + `indRestaurants`
   from the totals. Restaurants table + other code paths stay
   untouched.

## Principle locked (Andrew, 2026-04-22)

**Server math changes ripple across live trips.** Every existing
sell trip will have its numbers recomputed on the next page load
after 9P ships. Restaurants-containing trips specifically will
see hero totals DROP. That's the intended outcome per skill
rules — but it's a visible change to real users. Document every
delta in release notes.

**No schema changes, no migrations.** The data model stays
exactly as-is. Only the aggregation utility + type shape change.
If a fix you're considering would require a new column, new
table, or a migration — STOP and escalate. That's a different
session (probably 9Q).

**Audit via SQL + cross-check against multiple trips.** Don't
trust the math on Coachella alone. Load at least 3 existing
sell trips with different cost profiles (one with restaurants,
one with leading-vote lodging, one with pure group shares) and
verify the pre/post deltas match expectation for each.

**Semantic shared/yours mapping** (from the brief):
- **Shared**: lodging + headliner + shared transport + activities + provisions + other
- **Yours**: flights + individual transport + viewer arrival (when per-viewer)
- Footer sum must equal `per_person_total + arrivalDollars` exactly.

## Hard don'ts

- Do NOT change the database schema. No column adds/drops/renames.
  No migrations. `supabase/migrations/**` must remain untouched in
  the 9P commit.
- Do NOT change any server action, RPC, or API route. 9P is the
  math utility + type shape only.
- Do NOT touch any upstream module. No headliner, no spot, no
  getting-here, no transport, no everything-else, no crew, no
  aux, no cost-breakdown visual. CostBreakdown renders the two
  new rows; that's it.
- Do NOT change `divisor_used` logic. The divisor computation
  stays bit-exact.
- Do NOT create new routes.
- Do NOT add organizer edit affordances.
- Do NOT modify `restaurants` table, `restaurant` queries, or
  any restaurants-related code beyond removing the two
  `sharedRestaurants`/`indRestaurants` lines from the rollup.
  The restaurants data layer stays.
- Do NOT modify the 9O CSS block (`.chassis .cost-breakdown-*`).
  The two new rows use existing row classes; no new CSS needed.
- Do NOT change any existing `TripCostSummary` field name or
  type. Only ADD new fields (`provisions_per_person`,
  `other_per_person`). Existing consumers must not break.
- Every math change requires a regression trace on ≥3 existing
  trips before the release notes claim AC12 passes.

## Likely escalation triggers

1. **Groceries table row structure doesn't match expectation.**
   Brief assumes 'Provisions' and 'Other' are separate rows in
   the groceries table with identifiable `name` values. If the
   data shape is different (e.g., a single 'Extras' row, or a
   type column with enum values), adapt the aggregation
   accordingly. If fundamentally different, flag before coding.

2. **`pickLodgingForRollup` is client-only and can't be shared.**
   Per 9J, the function lives in `builder/LodgingCard.tsx`.
   Moving it to a shared util is the clean path; if that's
   non-trivial (e.g., imports React-only utilities), either
   duplicate the logic with a comment cross-referencing the
   source OR escalate.

3. **Restaurant removal drops hero on a trip Andrew cares about.**
   Before committing, query: `SELECT slug, name, (SELECT count(*)
   FROM restaurants WHERE trip_id = trips.id) as r FROM trips
   WHERE phase = 'sell' AND r > 0;`. If this returns real trips
   (Coachella doesn't have restaurants — verified in 9O),
   flag in release notes which trips will see dollar drops
   and by how much.

4. **Shared/yours allocation doesn't match semantic intent.**
   The brief's mapping (shared = lodging+headliner+shared_transport+
   activities+provisions+other; yours = flights+ind_transport+
   viewer_arrival) is the intent per 9O's mockup. If any row's
   cost-type enum actually conflicts with this (e.g., activities
   has a `cost_type` column set to 'individual'), flag before
   implementing. Don't silently re-map.

5. **Post-9P Coachella hero total changes unexpectedly.** Pre-9P:
   $8,100 (per_person_total $7,600 + arrival $500). Post-9P
   expectation: $8,100 stays (provisions + other were already
   in `shared_total` → now just visible as rows; no new
   contribution to the hero). If post-9P hero differs, diagnose
   before shipping.

6. **`TripCostSummary` type consumers break.** Adding new fields
   shouldn't break existing consumers, but grep for all
   destructuring usages of `TripCostSummary` and confirm the
   adds are purely additive.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9P — Release Notes` using the standard format
(What was built / What changed from the brief / What to test /
Known issues).

**Release notes must include:**
- A pre/post dollar delta table for ≥3 existing sell trips
  (trip slug, pre-9P hero, post-9P hero, reason for delta if any).
- SQL queries used to verify each AC math claim.
- Any trips where post-9P numbers surprise you (even if they're
  "correct").
