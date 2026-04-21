# Claude Code — Session 9B-1 kickoff (Getting Here module)

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies. Note: this is the first
session since the 9H/9I/9J arc where we're **building net-new**
(no component to reuse + extend — there's nothing shipped yet that
does arrival). The "reuse before rebuild" rule still applies to
visual primitives (reuse existing CSS classes), but the component
itself is new.

## Then read the brief

```
rally-fix-plan-v1.md → ### Session 9B-1: "Getting Here module —
                        mode picker, cost entry, reference links"
                     → also: 9I + 9J release notes (server action
                             pattern, useTransition precedent)
```

## Canonical references

```
rally-9b-getting-here-mockup.html          (9B target — v2 locked; read first)
rally-sell-phase-wireframe.html            (original design thinking — lines 360, 788, 993)

src/app/trip/[slug]/page.tsx:415           (reserved slot to fill)
src/components/trip/builder/LodgingCard.tsx (pattern for useTransition + server action)
src/app/globals.css                        (reuse .module-section*, .estimate-input, .module-card-pill; add .gh-* primitives near .voting-* from 9I)
src/lib/copy/surfaces/*.ts                 (voice precedent for new getting-here.ts surface)
supabase/migrations/                       (sequential numbering + member table schema)
src/types/index.ts                         (type extension target)
src/app/actions/lodging.ts                 (server-action shape precedent)
```

**Read `rally-9b-getting-here-mockup.html` FIRST.** Three state-
progression frames, three mode variants, one passport edge case,
a primitive-reuse table, and 5 escalation triggers live in the
annotations. All locked decisions numbered in the scope block.

## TL;DR

First genuinely personal Rally module. Each invitee picks their
arrival mode (flight / drive / train / other), drops in a rough
cost, and sees a reference link to Google Flights or Google Maps
for ballparking. Data persists on their membership row. Renders
only to the current viewer (no roster on sell).

Eight scope items:

1. **DB migration** — add `arrival_mode` (enum), `arrival_cost_cents`,
   `arrival_updated_at` to the member/invitee table. **Verify
   target table** before running the migration.
2. **Server action** — `upsertArrival(tripId, mode, costCents)`.
   Auto-resets cost to null when mode changes. `revalidatePath`
   after.
3. **New component** — `src/components/trip/GettingHere.tsx`
   (NOT in `builder/`). Client component. Three render branches
   per state.
4. **Render on sell** — fill `page.tsx:415` reserved slot.
   Only when `currentUserId != null`.
5. **Lexicon surface** — new file
   `src/lib/copy/surfaces/getting-here.ts` with mode labels,
   icons, helper copy per mode, reference-link labels, passport
   nudge, roll-line templates.
6. **Reference link builders** — Google Flights / Google Maps
   driving / Google Maps transit (`/data=!4m2!4m1!3e3` suffix).
   Origin from passport `based_in`; flight mode requires
   non-empty origin or shows passport nudge.
7. **CSS** — ~60 lines. `.gh-mode-picker`, `.gh-mode-tile`
   (+ active + press states), `.gh-passport-nudge`, `.gh-roll-line`
   (+ .val + .val.pending). **Reuse** `.module-section`,
   `.module-section-empty`, `.estimate-input`, `.module-card-pill`.
8. **Types** — `ArrivalMode` union + member-type extension.

## Principle locked

**Visually consistent with headliner + spot.** Reuse shipped
primitives (`.module-section`, `.module-section-empty`,
`.estimate-input`, `.module-card-pill`) wherever they fit. New
primitives (`.gh-mode-picker`, `.gh-mode-tile`, `.gh-passport-nudge`,
`.gh-roll-line`) all root their visual DNA in the pill pattern:
2px ink border, 2px offset shadow, accent fill on active,
Georgia-italic lowercase type.

**Per-viewer personal.** Each user's card shows their own data.
Other crew members' arrivals are invisible on sell. Roster display
is a lock-phase feature, future session.

**Required-soft, not hard-gated.** Empty state nudges via
`.module-section-empty` copy. Cost pending shows "(pending)" in
the roll line. **No RSVP button disable, no red-outline
enforcement.** Friction is visual only.

## Hard don'ts

- Do NOT create new routes.
- **Do NOT touch `CostBreakdown.tsx` at all.** Per-viewer rollup
  personalization is 9B-2's entire scope. Any CostBreakdown edit
  here is scope creep.
- Do NOT render Getting Here on sketch. Sketch's helper-text slot
  from 8I stays as-is.
- Do NOT render Getting Here for logged-out teaser viewers.
  Session 10 handles visibility for the teaser layer.
- Do NOT show a roster of other crew members' arrivals.
- Do NOT integrate any paid flight/maps/transit API. No scraping,
  no Amadeus, no SerpAPI, no Rally-generated prices. Deep-links
  only.
- Do NOT modify other modules (headliner, spot, transport,
  everything-else, crew, cost, buzz, aux).
- Do NOT modify `SketchModules.tsx`, `LodgingCard.tsx`, or any
  existing server action.
- Do NOT hard-gate RSVP on arrival being filled. Nudge only.
- Do NOT add a free-text note field to "other" mode.
- Do NOT add hardcoded strings in JSX. All user-facing text via
  `getCopy`.
- Do NOT add hardcoded colors inside `[data-theme]`. CSS tokens
  only.
- Mobile-first at 375px. Mode picker 4-column grid must not
  overflow. If it feels cramped, FLAG — do not silently switch
  to 2×2 or stack.
- `rm -rf .next && npm run dev` before QA (globals.css change).
- `npx tsc --noEmit` clean before release notes.

## Likely escalation triggers

1. **Target table for migration.** Might be `trip_members`,
   `members`, or `trip_invitees` depending on schema. Verify
   before running. If multiple tables could work, pick the one
   that pairs with the existing RSVP state — arrival is coupled
   to "who's coming," so whichever table holds `rsvp` status is
   the right target.

2. **Passport `based_in` query shape.** 8D shipped the passport
   but the exact field name and join shape matter. If the
   existing member query doesn't already include `passport.based_in`
   for the current user, extend it minimally. If the extension
   touches other queries, flag before modifying.

3. **Mode-change cost reset: trigger vs. server action.** A DB
   trigger is cleaner (fires regardless of write path) but adds
   migration complexity. Server-action-level reset is simpler.
   Either is acceptable. Recommend server-action for minimalism.

4. **4-column grid at 375px.** If the tiles feel cramped with
   four columns at mobile width, flag — Andrew may want 2×2 or
   a horizontal scroller. **Do not silently change the layout.**

5. **Reference-link URL encoding edge cases.** Destinations like
   "palm spring, ca" (spaces, no country) may parse oddly on
   Google side. The link still opens Google and the user can
   fix manually. Accept `encodeURIComponent` + ship. Only
   escalate if the link produces a clearly broken result.

6. **"Other" mode with cost=0 visual deadness.** The "other"
   tile active + $0 entered + no reference link may feel empty.
   DO NOT add a note field. If it reads too dead, flag for Andrew
   to consider a minor variant later.

7. **Member query without arrival fields shipped yet.** The
   migration is part of this session, so the query extension
   must happen alongside the migration + component. If CC lands
   the component before the migration, types break. Sequence:
   migration → types → query → component → render.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9B-1 — Release Notes` using the standard format
(What was built / What changed from the brief / What to test /
Known issues). Include any DB seed data you used for testing
so Cowork QA can reproduce.
