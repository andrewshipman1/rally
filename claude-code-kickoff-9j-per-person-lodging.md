# Claude Code — Session 9J kickoff (per-person lodging cost + rollup wiring)

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies. Note the updated Part 1
sections ("Reuse before rebuild", canonical module order).

## Then read the brief

```
rally-fix-plan-v1.md → ### Session 9J: "Per-person lodging cost —
                        card math + rollup wiring"
                     → also: 9I Actuals (the `voting` prop + `crewCount`
                             prop surface on LodgingCard you'll extend)
```

## Canonical references

```
/trip/sjtIcYZB                             (Coachella sell — lodging with votes)
/trip/TheVfl1-                             (VEGAS BABY sketch — lodging with no votes)

src/components/trip/builder/LodgingCard.tsx (ADD per-person second line)
src/components/trip/CostBreakdown.tsx       (REWIRE Accommodation selector + label)
src/app/trip/[slug]/page.tsx                (UPDATE crewCount source for sell)
src/components/trip/builder/SketchModules.tsx (UPDATE crewCount source for sketch)
src/components/trip/builder/SketchTripShell.tsx (verify cost threading)
src/types/index.ts (lines ~411-460)         (divisor already correct — DO NOT MODIFY)
src/lib/copy/surfaces/builder-state.ts      (add divide + per-person keys)
src/lib/copy/surfaces/trip-page-shared.ts   (maybe add costBreakdown.lodging.*)
```

## TL;DR

Wire the lodging module's cost through to the per-person rollup
the way users actually think about it: divide by people not
explicitly "out," show the leading-vote spot pre-lock, and make
the math transparent on the card.

1. **On the card** — append a second line below the existing math
   showing `÷ {N} = ~${per_person}/person` (Format B locked by
   Andrew). Works for home_rental, hotel, and "other" cost types.
   Nothing for `free`.

2. **Divisor N** = `cost.divisor_used` in both paths. Already
   computed as `in + holding count, fallback to group_size when
   confirmed < 2` in [types/index.ts](src/types/index.ts). No
   backend change. Just switch the card's prop source.

3. **In CostBreakdown** — change the `selectedLodging` selector
   from `is_selected || first-added` to `is_selected ||
   leading-vote || first-added`. Ties in vote count → first-added.

4. **Rollup label** — `"lodging · {name}"` in most cases;
   `"lodging · {name} (so far)"` only when the leading-vote is
   winning and there are multiple spots and nothing's locked.
   Move the hardcoded `'Accommodation'` string into the lexicon
   while you're at it.

## Principle locked (Andrew, 2026-04-21)

**Transparent math over smooth display.** Showing the `÷ N`
denominator on the card surfaces the group-size dependency
directly — when N changes (someone RSVPs "out"), everyone's per-
person number moves, and Rally treats that social-dynamic
visibility as a feature. Hiding the denominator for a "cleaner"
number is not a win.

**Leading vote over personalized display.** The rollup shows the
same number to every invitee (based on current leader), not a
personalized number per viewer. Shared reality > personalization
for a group-decision primitive.

## Hard don'ts

- Do NOT create any new routes.
- Do NOT modify other `CostBreakdown` line items (Flights,
  Transport, Meals, Activities). Only the Accommodation line
  changes.
- Do NOT fix the rest of `CostBreakdown.tsx`'s hardcoded colors +
  strings. Same class of issue 9I cleaned up in LodgingGallery,
  but it's its own session — don't scope-creep. Only touch the
  specific lines the Accommodation change requires.
- Do NOT modify the divisor formula in `types/index.ts`. Already
  correct.
- Do NOT modify `Lodging` / `TripCostSummary` types or any
  Supabase schema.
- Do NOT change the sell render path beyond the `crewCount` prop
  source and the Accommodation label wiring.
- Do NOT change the module structure in `SketchModules.tsx` —
  only the `crewCount` prop value + threading `cost` into the
  render (data-layer wiring that the single-module rule allows).
- Do NOT invent new copy tones. Lowercase, sentence fragment,
  Rally voice. Match surrounding lexicon.
- Do NOT remove the `🏠` accommodation icon from the rollup.
- Do NOT change 9I voting UI (tally, vote button, lock button,
  winner flag) — regression territory.
- Mobile-first at 375px. Two-row cost-line must fit cleanly.
- `npx tsc --noEmit` clean before release notes.

## Likely escalation triggers

1. **`cost` not already threaded into `SketchModules` /
   `SketchTripShell`.** If sketch doesn't already have access
   to the computed `TripCostSummary`, you'll need to thread it
   down. This is minor but crosses a boundary — flag before
   wiring, and prefer the smallest change (pass `cost` as a
   prop, don't recompute in sketch).

2. **Lexicon location ambiguity.** The existing `'Accommodation'`
   hardcoded label lives inside `CostBreakdown.tsx`. Its
   replacement lexicon key could reasonably go in
   `builder-state.ts` (alongside other lodging keys) OR
   `trip-page-shared.ts` (alongside other cost-summary keys).
   Grep both surfaces first. If neither has a clear fit, propose
   a new `cost-breakdown.ts` surface — escalate before creating.

3. **Per-person line placement.** The `house-body` already has
   `house-meta` (title / cost-line / bedrooms etc.) and
   `lodging-card-meta` (for bedrooms, max_guests). The new per-
   person line should appear directly below the cost line but
   above `lodging-card-meta`. If the visual layout breaks at
   375px, flag — Andrew may want to swap them or inline them.

4. **Ties in voting and `votes.length === 0` across all spots.**
   Your selector must handle: all zero votes + multiple spots
   → first-added. Don't throw an error if `votes` is undefined
   or empty; default gracefully.

5. **"Free" lodging in the rollup.** If the display-spot is an
   "other" type with `free` or zero cost, the rollup's
   per-person for that line is $0. Don't divide by zero. Don't
   render `"lodging · {name} (so far)"` with a `$0` value if
   that looks wrong — flag the display question.

6. **Prop rename `crewCount` → `splitCount`.** Optional and only
   if trivial. If renaming would cascade through 5+ files, skip
   — keep the old name, just change what gets passed in.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9J — Release Notes` using the standard format
(What was built / What changed from the brief / What to test /
Known issues).
