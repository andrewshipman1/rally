# Claude Code — Session 9K kickoff (transport + flight cards: rebuild to compact sell shape)

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies. Pay particular attention
to the "Reuse before rebuild" rule, single-module discipline, and
the canonical module order in Part 1.

## Then read the brief

```
rally-fix-plan-v1.md → ### Session 9K: "Transport + Flight cards —
                        rebuild to compact sell shape"
                     → also: 9I Actuals (LodgingGallery → LodgingCard
                             consolidation precedent)
                     → also: 9B-2 Actuals (CostBreakdown token/lexicon
                             hygiene precedent)
                     → also: Bug Backlog items 6 and 7 (context on
                             the duplication comment and the dropped
                             confirmed badge)
                     → also: Session 10+ → "Organizer edit-on-sell
                             — back to sketch" (context on why 9K
                             stays strictly read-only on sell)
```

## Canonical design reference — READ BEFORE WRITING CODE

```
rally-9k-transport-sell-mockup.html   ← the mockup; every decision is here
rally-transportation-wireframe.html   ← 8M wireframe; the compact shape this ports to sell
```

The mockup specifies: card shape (grid `28px 1fr auto`), section
chrome (`.module-section` wrapper), interaction rules (tap →
booking_link when present; non-interactive otherwise), lexicon
keys, CSS class names, and design decisions (confirmed badge
dropped, FlightCard stays separate, organizer edit deferred).

If anything on screen contradicts the mockup, the mockup wins.
If anything in the brief contradicts the mockup, STOP and ask —
something is out of sync and shouldn't be resolved unilaterally.

## Canonical code references

```
/trip/sjtIcYZB                                   (Coachella sell — has flight + transport items)
/trip/TheVfl1-                                   (VEGAS BABY sketch — transport items in sketch shape)

src/components/trip/TransportCard.tsx             (REBUILD to compact shape)
src/components/trip/FlightCard.tsx                (REBUILD to compact shape)
src/components/trip/builder/TransportCard.tsx     (REFERENCE ONLY — 8M sketch card; DO NOT MODIFY)
src/app/trip/[slug]/page.tsx (lines 440–454)      (add .module-section wrapper around transport list)

src/lib/copy/surfaces/trip-page-shared.ts         (add tripPageShared.transport.* keys)
src/app/globals.css                               (add .chassis .transport-card* block)

src/components/trip/CostBreakdown.tsx             (DO NOT MODIFY — reads `trip.flights[]` separately; data-model collapse is future work)
src/types/index.ts                                (DO NOT MODIFY — Transport and Flight types stay as-is)
```

## TL;DR

The sell page still renders transport with the pre-8M hero-card
shape (64px icon tile, stacked body, booking CTA footer). 8M
replaced it in sketch with the compact single-line card but left
sell alone. 9K closes that gap by rebuilding `TransportCard.tsx`
and `FlightCard.tsx` to match the 8M compact shape on sell.

The cleanup (tokens, lexicon, CSS primitives) happens naturally as
a consequence of writing fresh code — it is not the goal, just a
side effect of doing the rebuild correctly.

1. **Rebuild TransportCard.tsx** to the compact shape from the
   mockup. Grid: 28px icon · 1fr body · auto link-chip. Read-only
   on sell. Whole card opens `booking_link` in a new tab when
   present; non-interactive when null. Icon from `type_tag` via
   the sketch emoji map. No hero elements.

2. **Rebuild FlightCard.tsx** to the same compact shape. ✈️ always.
   Title = `${departure} → ${arrival}`. Reads `trip.flights[]` —
   data-model collapse stays deferred.

3. **Intentional-duplication comment** at the top of both files
   (verbatim block from Scope item 3 in the brief). This is the
   primary drift guard and a REQUIREMENT.

4. **Wrap transport list in `.module-section`** in page.tsx
   (lines 440–454). Match the mockup's Row 1 sell frame —
   "transportation" title in lowercase Georgia italic + count pill.

5. **Lexicon keys** per the mockup's table. Cross-reference
   `rally-microcopy-lexicon-v0.md` before committing; escalate if
   anything doesn't match approved copy.

6. **CSS block** `.chassis .transport-card*` in globals.css. All
   colors via theme tokens. No raw hex, no `rgba()`, no
   `!important`.

## Principle locked (Andrew, 2026-04-22)

**Rebuild-to-shape over cleanup-in-place.** The legacy sell cards
aren't just visually drifted — they're on the wrong wireframe.
Putting tokens on a hero-card shape that never appeared in any
8I/8M wireframe would be lipstick on a pig. Rebuild to the compact
shape; cleanup follows.

**Reuse the sketch shape, not the sketch component.** Sell gets
its own file (`src/components/trip/TransportCard.tsx`), not
`builder/TransportCard.tsx` retrofitted with a mode prop. Reason:
the two files have different tap targets (drawer vs booking link),
different sections around them (add button vs none), and the
data-model collapse will eventually make a unified component
cleaner than a mode-prop one. Keep them separate for now, match
the shape.

**Read-only on sell for every viewer role.** Organizer edit-on-
sell ships in its own session later (back-to-sketch view toggle,
documented in Session 10+). 9K does NOT add any organizer-aware
rendering — no pencil icons, no drawer triggers, no conditional
edit affordances.

## Hard don'ts

- Do NOT create any new routes. Three-screen rule holds.
- Do NOT touch any other module. No headliner, no spot, no
  getting-here, no everything-else, no cost summary, no
  crew/buzz/aux, no header/hero/countdown/marquee/sticky-bar.
  Single-module discipline. If drift feels obvious in an
  unrelated file, log in Known Issues, move on.
- Do NOT modify `src/components/trip/builder/TransportCard.tsx`
  or `src/components/trip/builder/TransportAddForm.tsx`. Sketch
  behavior stays locked.
- Do NOT attempt the `trip.flights[]` → `transport[type_tag='flight']`
  data-model collapse. Do NOT unify TransportCard and FlightCard
  into one component. Do NOT touch `transitionToSell`. All three
  are tracked as deferred work; if the rebuild appears to require
  any of them, STOP and escalate.
- Do NOT add any organizer edit affordance on sell. No pencil
  icon, no drawer trigger, no whole-card-tap-to-edit for
  organizers, no conditional rendering based on viewer role.
  The designated direction (back-to-sketch view toggle) ships
  in its own session; see Session 10+ in the fix plan.
- Do NOT render a "Confirmed" badge, a "Direct"/"Connecting"
  label, or the legacy `subtype` fallback path. These are
  intentionally dropped in 9K. The `status` field on `Flight`
  stays in the data model; only the render is removed.
- Do NOT modify `CostBreakdown.tsx` — it reads `trip.flights[]`
  and `trip.transport[]` separately; 9K preserves that.
- Do NOT change any cost math. `perPerson`, `splitWays`,
  `estimated_total`, `cost_per_person` derivations stay bit-exact.
- Do NOT change data model or types. No new columns, no type
  changes, no prop renames on `Transport` or `Flight`. No reads
  re-pointed between `trip.flights` and `trip.transport`.
- Do NOT introduce strings not in `rally-microcopy-lexicon-v0.md`.
  If a proposed key in the mockup doesn't match approved copy,
  stop and ask.
- The intentional-duplication comment at the top of TransportCard
  and FlightCard is a REQUIREMENT. Both files must carry the
  identical block verbatim.
- Mobile-first at 375px. Compact card must render cleanly — no
  wrap on the meta row, ellipsis on long titles, no horizontal
  scroll.
- `rm -rf .next` before every `npm run dev` you run for QA.
  Turbopack cache bit us in 8M and 9B-2.
- `npx tsc --noEmit` clean before release notes.

## Likely escalation triggers

1. **Lexicon location ambiguity.** The mockup proposes
   `tripPageShared.transport.typeLabel.*` and
   `tripPageShared.transport.split{Group,Individual}`. If the
   exact approved strings in `rally-microcopy-lexicon-v0.md`
   differ from the mockup's table (e.g., lexicon says
   "splitting" instead of "group split"), use the lexicon
   string; if the lexicon has no entry, escalate rather than
   invent.

2. **`trip.flights[]` data shape differs from expectations.**
   The mockup assumes `Flight` has `departure_airport`,
   `arrival_airport`, `estimated_price`, `booking_link`. If
   reading the type reveals the field names differ, use the
   actual field names; don't rename the type. If a field the
   compact shape needs is missing entirely, flag — we may need
   to render less info on the card than the mockup shows.

3. **Section wrapper conflicts with existing `ModuleSlot`.**
   page.tsx line 443 uses `<ModuleSlot>` for the transport
   list. If swapping to `.module-section` requires either (a)
   editing ModuleSlot itself (cross-cutting, out of scope), or
   (b) duplicating section-header markup that `ModuleSlot`
   already provides, flag. The clean path is to stop using
   ModuleSlot here and render the section inline — but only
   for the transport module, not other callers.

4. **CSS primitive reuse.** The brief says reuse `.chassis
   .module-card*` primitives where they fit. If the existing
   primitives in globals.css don't match the compact shape's
   needs (grid columns, ellipsis clipping), add new
   `.chassis .transport-card*` classes rather than shoehorning.
   Don't modify `.chassis .module-card*` — that affects other
   modules.

5. **Non-interactive card without `<a>` tag.** A transport with
   no `booking_link` should render as `<div>`, not `<a>` with
   no href (which screen readers still announce as a link).
   Use a conditional render — if booking_link, render `<a>`;
   else render `<div>`.

6. **Type tag enum coverage.** `Transport.type_tag` has 7
   values. If a legacy sell trip has a transport row whose
   `type_tag` is null (pre-8I data), the emoji map needs a
   fallback (the mockup uses `·` for `other` / null). Confirm
   the lexicon key for the null case maps cleanly, and that the
   meta row renders something sensible without a type label.

7. **FlightCard call sites.** Grep for `FlightCard` usage before
   rebuilding. It should only render in page.tsx somewhere — if
   a second caller exists, flag; duplicating the rebuild across
   multiple call sites is not in 9K's scope.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9K — Release Notes` using the standard format
(What was built / What changed from the brief / What to test /
Known issues).

Cowork picks up at Step 3 (intake release notes) → Step 4 (QA
against the 17 ACs) from there.
