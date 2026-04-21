# Claude Code — Session 9I kickoff (spot consolidation + sell-chrome cleanup)

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies. Pay particular attention
to two recently-updated sections:

- **Part 1, Trip Page Module Order** — the canonical order was
  updated 2026-04-21 (cost summary now sits directly below the last
  line-item module; "getting here" / arrival estimator is at
  position 3, not after cost).
- **Part 1, Hard Rules → "Reuse before rebuild"** — new rule added
  2026-04-21. This session is the first application of it to a
  full component (after 9H's precedent on Headliner). Read it.

## Then read the brief

```
rally-fix-plan-v1.md → ### Session 9I: "Spot consolidation —
                        LodgingGallery → LodgingCard + sell-chrome cleanup"
                     → also: 9H Actuals (the readOnly/consolidation precedent)
                     → 9H Release Notes (Variant A section-wrap pattern)
```

## Canonical references

```
rally-9i-spot-sell-mockup.html             (9I target — locked 2026-04-21; read first)
rally-9h-headliner-sell-mockup.html        (precedent pattern — Variant A wrap)
/trip/TheVfl1-                             (sketch VEGAS BABY — live sketch reference)
/trip/sjtIcYZB                             (sell Coachella — current sell state)

src/components/trip/LodgingGallery.tsx     (TO DELETE — read in full first)
src/components/trip/builder/LodgingCard.tsx (TO EXTEND with voting prop)
src/components/trip/builder/SketchModules.tsx ~183-260 (sketch call site — DO NOT MODIFY, but understand)
src/app/trip/[slug]/page.tsx               (TO REWIRE — lines ~38, 300-413)
src/app/globals.css                        (add voting-pill + vote/lock classes)
src/lib/copy/surfaces/trip-page-shared.ts:27 (lodging.h2 = "the spot")
src/lib/copy/surfaces/cutoff.ts            (banner keys — orphaned, NOT deleted)
src/app/actions/lodging.ts                 (castLodgingVote, lockLodgingWinner — unchanged)
src/types                                  (Lodging, LodgingVote, User types)
```

**Read `rally-9i-spot-sell-mockup.html` first.** Three rows:
sketch mode vs. sell-voting-open side-by-side (same component,
different props), sell-locked state, and current sell being
deleted. All specs + five escalation triggers in the annotations.

## TL;DR

One spot module. One component. Delete the parallel sell
component, extend the sketch component with a presence-discriminated
`voting` prop, rewire page.tsx. Bundled: two preloaded
chrome deletions (deadline banner + AddToCalendarButton render).

The consolidation work:

1. **Delete** `src/components/trip/LodgingGallery.tsx` entirely
   (273 lines, including its internal unnamed LodgingCard).
2. **Extend** `LodgingCard.tsx` with optional `voting?: {...}`
   prop. Presence = sell mode (hide edit affordances, show
   voting UI, show winner/losing flags). Absence = sketch
   mode (current behavior).
3. **Rewire** page.tsx to replace `<LodgingGallery>` with a
   `.module-section.lodging-module` wrapper + `.module-section-header`
   (title "the spot" + voting-pill "open"/"locked in") + a map
   over `lodging` to `<LodgingCard voting={...} />`.
4. **Add CSS classes** to globals.css for voting-pill / tally-line
   / vote-row / btn-vote / btn-lock — theme-tokenized, no raw whites.

The chrome cleanup (same file, contiguous edits):

5. **Delete** the deadline-banner IIFE (page.tsx ~301-324) — all
   four T-7/T-3/T-0/passed variants.
6. **Delete** the `<AddToCalendarButton>` render call + import
   (page.tsx ~38, 343-347). **Do NOT delete** the component
   file itself (`AddToCalendarButton.tsx` stays orphaned).

**The inner `.house` / `.house-img` / `.house-body` rendering
inside LodgingCard stays byte-identical to what sketch shows
today.** Don't restyle cards — just add the sell-mode branches.

## Principle locked (Andrew, 2026-04-21)

**Reuse before rebuild.** Sell page below the countdown = sketch
populated. When sketch and sell render the same module, it's one
component with a prop difference — not two components. 9H did
this to Headliner (readOnly prop); 9I does it to LodgingCard
(voting prop). Transport and everything-else follow the same
pattern in later sessions.

If you find yourself writing `SellLodgingCard.tsx`, `LodgingCardV2.tsx`,
or any "sell-specific spot surface" — STOP. That's the anti-pattern
this session exists to eliminate.

## Hard don'ts

- Do NOT create any new routes. Three screens.
- Do NOT build a parallel `Sell<Anything>.tsx` component. Extend the
  existing one. See above.
- Do NOT invent new lexicon keys. Every string you need already
  exists. Grep first; if missing, STOP and escalate.
- Do NOT modify `SketchModules.tsx`, `LodgingAddForm.tsx`, or any
  server action. The sketch render call site must continue to work
  unchanged (presence-of-prop discriminator handles this).
- Do NOT add voting UI to sketch. Voting is sell-only.
- Do NOT touch any other module (headliner, transport, everything-else,
  crew, cost, buzz, aux) or the header/hero chrome, scoreboard,
  marquee, postcard.
- Do NOT delete `AddToCalendarButton.tsx` (component file) — only
  delete its import + render call in page.tsx.
- Do NOT delete lexicon keys in `cutoff.ts` or
  `trip-page-shared.ts:calendar.cta`. Orphans are fine.
- Do NOT fix Bug Backlog item 1 (null-state + date-ordering for
  "? nights"). Separate session.
- Do NOT change the module render order in `page.tsx` (crew/cost
  swap is its own mini-session).
- Do NOT modify the `Lodging` or `LodgingVote` types — handle the
  `Lodging` vs `LodgingWithVotes` union via the `voting` prop
  shape, not by adding optional vote fields to `Lodging`.
- Mobile-first at 375px.
- `pkill -f "next dev"; pkill -f "next-server"; pkill -f "node.*next"`
  → `rm -rf .next && npm run dev` before QA. Mandatory —
  globals.css changed.
- `npx tsc --noEmit` clean before release notes.

## Likely escalation triggers

1. **Prop surface bloat.** Combining sketch edit props and sell
   voting props on a single component may make `LodgingCard`'s
   prop type uncomfortably large. Options: (a) keep one file,
   accept the prop count; (b) split into `LodgingCard` (pure
   presentation) + `LodgingCardContainer` (voting interaction
   wrapper) in the same directory. **Recommended: (a) — one file
   is simpler and Andrew's default preference.** Escalate before
   splitting.

2. **TypeScript union issues.** `SketchModules.tsx` passes a plain
   `Lodging`; page.tsx sell passes `LodgingWithVotes`. Narrow
   through the `voting` prop's presence, not by widening the
   `spot` prop type. If the union causes friction, STOP — don't
   modify the `Lodging` type.

3. **Missing lexicon key.** If grep shows a key you need is
   missing, STOP — do not invent copy. Ask Andrew.

4. **`useTransition` semantics.** LodgingGallery uses a single
   `useTransition` for both vote and lock. Preserve that behavior
   — both actions pending should grey out the card. Don't
   refactor to separate transition states.

5. **Sketch-only behavior leaking into sell.** If during the
   refactor click-to-edit, remove-button, or type-badge accidentally
   shows on sell, treat as a blocker — not a "polish later" bug.
   Gate them explicitly on `voting === undefined`.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9I — Release Notes` using the standard format
(What was built / What changed from the brief / What to test /
Known issues).
