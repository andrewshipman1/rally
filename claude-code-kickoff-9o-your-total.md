# Claude Code — Session 9O kickoff (Your Total redesign + cross-page math audit)

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Part 3 applies. Single-module discipline is critical here — the
audit half will surface temptations to "fix" upstream modules.
Don't. Escalate instead.

## Turbopack cache warning (BB-5)

Before starting the dev server:
```
pkill -9 node
lsof -iTCP:3000 -sTCP:LISTEN   # must be empty
lsof -iTCP:3001 -sTCP:LISTEN   # must be empty
cd ~/Desktop/claude/rally
rm -rf .next node_modules/.cache
npm run dev
# WAIT 30-60s after "Ready in Xs"
```

Repeat if the cache wedges mid-session.

## Then read the brief

```
rally-fix-plan-v1.md → ### Session 9O: "Your Total — redesign +
                        cross-page math audit"
                     → also: 9B-2 Actuals (CostBreakdown's last rebuild)
                     → also: 9J Actuals (lodging leading-vote math)
                     → also: 9L Actuals (everything-else wiring)
                     → also: 9M Actuals (module-section pattern precedent)
                     → also: BB-5 (Turbopack workaround)
```

## Canonical design reference — READ BEFORE WRITING CODE

```
rally-9o-cost-summary-sell-mockup.html   ← Path C + math audit table
```

The mockup's `<style>` block has implementation-ready CSS for every
new `.cost-breakdown-*` class. Path C frames (row 4) are the shape
spec. The "Math audit — what each row represents" table in the
annotations is the spec for the audit half — use it as your
implementation checklist.

**Theme audit result baked in:** hero block uses `var(--surface)` +
`var(--on-surface)` tokens, NOT `var(--ink)` / `var(--bg)`. This
gives a consistent dark hero across all 17 themes (including the
3 dark-canvas themes — boys-trip, city-weekend, festival-run —
where `--ink` would render the hero LIGHT on a DARK page, inverted
from the intent).

## Canonical code references

```
/trip/sjtIcYZB     (Coachella sell — signed-in invitee view; primary QA target)

src/components/trip/CostBreakdown.tsx             (REBUILD — shell + rows + footer)
src/app/globals.css                               (REPLACE .chassis .cost-breakdown-* block at ~5295-5410)
src/lib/copy/surfaces/trip-page-shared.ts         (ADD 4 new lexicon keys)

src/app/trip/[slug]/page.tsx                      (CALL SITE — should need no changes)
src/types/index.ts                                (REFERENCE ONLY — TripCostSummary + calculateTripCost; do not modify)
src/components/ui/GlassCard.tsx                   (REFERENCE ONLY — file stays; just not imported anymore)
```

## TL;DR

Two halves, combined in one session:

1. **Visual redesign (Path C).** Bordered `.module-section`
   container wraps a dark hero block at the top
   (`var(--surface)` + `var(--on-surface)`). Hero amount 42-46px
   Georgia italic. Rows: icon · label · value grid — no progress
   bars. Line labels mirror what the organizer entered in each
   module ("the headliner · Coachella Valley Music & Arts
   Festival", "lodging · Cap Juluca (so far)"). Subtle footer
   row with shared/yours split replacing the current pill stack.

2. **Math audit — walk each row's source.** Use the mockup's
   audit table as your checklist. Known pre-audit findings to
   verify and act on:
   - **Provisions + Other rows MISSING** from current render.
     If `cost.provisions_per_person` / `cost.other_per_person`
     exist in `TripCostSummary`, add the rows. If not, escalate.
   - **Meals row should be REMOVED** — restaurants are go-phase
     data per skill rules; shouldn't appear in sketch/sell rollup.
     Render-only removal, not a data-model change.
   - **Per-viewer total double-count check** — verify
     `cost.per_person_total` doesn't already include viewer's
     arrival; if it does, escalate (math bug, don't fix).
   - **Shared/yours split verification** — lodging+headliner =
     shared, arrival+individual-transport+activities-etc = yours.
     If mismatched with current `cost.per_person_shared` /
     `cost.individual_total`, escalate.

## Principle locked (Andrew, 2026-04-22)

**Path C threads the needle.** CostBreakdown IS a sell module
(bordered, in the rhythm) AND IS the financial anchor (dark hero
draws attention to the number). Path A gave up too much weight;
Path B stayed outside the sibling pattern. Path C is both.

**Labels mirror what the organizer entered.** Don't trim. The
rollup IS a summary — the summary should name what it's
summarizing. Redundancy with the module above is intentional,
not a bug.

**`--surface` / `--on-surface` tokens for the hero block.** Not
`--ink` / `--bg`. Every theme guarantees the former pair as
dark/light regardless of page canvas — this is the one choice
that makes Path C ship across all 17 themes without per-theme
overrides.

**Audit don't fix.** If the math walk surfaces a bug in
`cost.per_person_total`, `cost.per_person_shared`,
`cost.individual_total`, or any other server-computed field —
STOP and escalate. 9O is UI-layer. Math fixes are a separate
session because they require server-side changes + database
re-verification on existing trips.

## Hard don'ts

- Do NOT create any new routes.
- Do NOT touch any other module. No headliner, no spot, no
  getting-here, no transport, no everything-else, no crew, no
  aux, no header/hero chrome. Single-module discipline.
- Do NOT change cost math formulas in `src/types/index.ts`
  `calculateTripCost` or any server-side computation. Audit
  findings escalate, never auto-fix.
- Do NOT modify `trip.restaurants` data model or any
  restaurants-related code beyond removing the render call in
  CostBreakdown.tsx. The data stays; the render goes.
- Do NOT delete `sharedBadge` / `bookYoursBadge` lexicon keys.
  They're deprecated but stay for the dead-key sweep.
- Do NOT modify `GlassCard.tsx` or its consumers elsewhere.
  Check before assuming it's only used here.
- Do NOT add any organizer edit affordance on sell. Read-only
  for every viewer role.
- Do NOT change the per-viewer vs group-fallback branching
  (`viewerArrival !== null` check). Both states must continue
  to render correctly.
- Do NOT introduce strings not in `rally-microcopy-lexicon-v0.md`.
  Cross-reference the 4 new proposed keys; mismatch escalates.
- Do NOT change data model, types, or schema.
- Mobile-first at 375px. Long labels ellipsis-clip cleanly.

## Likely escalation triggers

1. **Missing `cost.provisions_per_person` / `cost.other_per_person`
   fields in `TripCostSummary`.** If they don't exist, adding
   them is a data-layer change (out of scope). Render only
   existing fields; log in Known Issues for follow-up. Andrew
   decides the separate session.

2. **Meals row has live dollar contribution on Coachella.**
   Removing the render drops that from the rollup total. Hero
   number shrinks. That's correct behavior per skill rules, but
   flag the pre-session vs post-session delta in release notes
   so Cowork QA knows the number change is expected.

3. **Per-viewer total double-count.** If inspection reveals
   `cost.per_person_total` already includes the viewer's
   arrival (from 9B-2 wiring), the existing `+
   (viewerArrival.cost_cents / 100)` would double-count.
   STOP — escalate for Andrew's decision.

4. **Shared/yours split math mismatch.** If `cost.per_person_shared`
   + `cost.individual_total` don't equal the expected split
   (per brief's definition), escalate. The fields are server-
   computed; don't patch client-side.

5. **Festival-run contrast edge case.** Hot pink accent
   (`#ff3a8c`) on deep purple surface (`#2a1540`) for
   `.emphasize` text. If genuinely unreadable, flag in Known
   Issues and propose (a) `--accent2` for emphasis on that
   theme, (b) festival-run surface adjustment, or (c) per-
   theme override. Don't block the session — document and
   ship.

6. **Eyebrow copy approval.** `"firming up"` / `"looking solid"`
   are proposals. Cross-reference the lexicon; if approved
   copy differs, use the lexicon's. If no entry, escalate for
   Andrew's sign-off.

7. **GlassCard.tsx orphaning.** If CostBreakdown was GlassCard's
   only consumer, the file becomes orphaned. DON'T delete it —
   log as a follow-up dead-file sweep. If it has other
   consumers, leave as-is.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9O — Release Notes` using the standard format
(What was built / What changed from the brief / What to test /
Known issues).

Expect Cowork QA to be substantial — this is the biggest session
since 9K. 27 ACs across shape / math / hygiene / regression.
Plan for a multi-step live QA pass + code-level grep batch.
