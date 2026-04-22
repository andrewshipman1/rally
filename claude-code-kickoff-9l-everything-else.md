# Claude Code — Session 9L kickoff (everything-else: extract sell component + activities hint parity)

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies. Note the single-module
discipline (Part 1) and the "Reuse before rebuild" rule.

## Then read the brief

```
rally-fix-plan-v1.md → ### Session 9L: "Everything Else — extract
                        sell component + activities hint parity"
                     → also: 9K Actuals (module extraction +
                             Turbopack cache flake workaround)
                     → also: 9I Actuals (LodgingGallery
                             consolidation — sell component
                             extraction precedent)
                     → also: Session 10+ → "Organizer edit-on-sell
                             — back to sketch" (context on why 9L
                             stays strictly read-only on sell)
```

## Canonical code references

```
/trip/sjtIcYZB                             (Coachella sell — has activities/provisions/other values populated; reference target)
/trip/TheVfl1-                             (VEGAS BABY sketch — for hint-parity verification)

src/app/trip/[slug]/page.tsx (lines 473–539)   (EXTRACT this inline JSX)
src/components/trip/builder/SketchModules.tsx (lines 374–380)   (ADD activities hint prop to the EstimateInput call)
src/components/trip/builder/EstimateInput.tsx  (REFERENCE ONLY — do not modify)
src/components/trip/EverythingElse.tsx         (NEW — sell-only read-only component)

src/lib/copy/surfaces/builder-state.ts    (ADD everythingElse.activitiesHint key)
src/app/globals.css                       (EXISTING .chassis .estimate-input* — do not modify; sell reuses these classes)

src/components/trip/CostBreakdown.tsx     (DO NOT MODIFY — cost math stays exact)
src/types/index.ts                        (DO NOT MODIFY)
```

## TL;DR

Two small cleanups on the everything-else module:

1. **Extract the inline JSX to a dedicated component.** Everything-
   else is the only module on sell that still renders inline in
   `page.tsx` — 67 lines of read-only JSX mirroring the sketch
   builder shape. Pull it out to `src/components/trip/EverythingElse.tsx`
   as a sell-only read-only component. Matches the 9H / 9I / 9K
   pattern of one dedicated file per module.

2. **Add an activities hint on both sketch and sell.** Provisions
   and other both render a hint line below the input ("groceries,
   snacks, drinks — the stuff you stock up on" / "gifts, decor,
   entry fees — whatever else"). Activities doesn't. Visible
   inconsistency: the activities panel is shorter than its
   siblings, breaking the parallel structure. Add a hint
   (proposed: `"day trips, tours, shows — the stuff you do"`),
   render on both phases. Lexicon key goes in
   `builderState.everythingElse.activitiesHint`.

That's the whole session. Four files touched, no data model
changes, no CSS changes, no cost-math changes.

## Principle locked (Andrew, 2026-04-22)

**Sell gets its own read-only component; sketch keeps using
EstimateInput.** Do NOT add a `readOnly` / `mode` prop to
EstimateInput. Sketch's editable flow and sell's read-only
display have genuinely different shapes (interactive input vs
classed divs), and the back-to-sketch view toggle direction
logged in Session 10+ makes component consolidation pointless
— when the organizer edit path ships, it renders sketch
components wholesale. Dedicated sell component is the right
architecture here.

**Both phases render the activities hint.** Not one without the
other. If the hint is worth adding, it's worth adding on both
sides to preserve phase parity. Sketch's `<EstimateInput>` takes
a `hint` prop already (provisions and other both use it — line
387 and 395 in SketchModules.tsx), so sketch-side addition is
a single prop.

**No visible change from the extraction alone.** The new
EverythingElse component must render byte-identical to the
current inline JSX, aside from the activities hint. Screenshot
pre/post and compare.

## Hard don'ts

- Do NOT create any new routes. Three-screen rule holds.
- Do NOT touch any other module. No headliner, no spot, no
  getting-here, no transport, no cost summary, no crew/buzz/aux,
  no header/hero/countdown/marquee/sticky-bar. Single-module
  discipline.
- Do NOT refactor `EstimateInput`. Sketch phase uses it as-is;
  do not add props, modes, or behavior branches. Sell gets its
  own file.
- Do NOT add any organizer edit affordance on sell — no pencil,
  no drawer trigger, no conditional rendering based on viewer
  role. Sell is strictly read-only for every viewer.
- Do NOT change cost math. Activities / provisions / other
  dollar derivations stay bit-exact. `CostBreakdown.tsx`
  aggregation stays untouched.
- Do NOT change data model, types, or schema. No new columns,
  no type changes, no prop renames.
- Do NOT introduce strings not in `rally-microcopy-lexicon-v0.md`.
  The proposed activities hint copy is pending final
  cross-reference — if the lexicon has an approved string that
  differs, use the lexicon. If it has no entry, escalate rather
  than invent.
- Do NOT modify the CSS rules for `.chassis .estimate-input*`
  or its children. Sell renders the same classes sketch uses.
- Do NOT guard the new component internally with
  `hasEverythingElse` logic. The guard stays at the call site
  in page.tsx — the component renders what it's given.
- Mobile-first at 375px. The extracted component must render
  cleanly; the new activities hint must not cause wrap/clip.
- `rm -rf .next` before every `npm run dev` for QA. Turbopack
  cache flaked repeatedly in 9K QA — don't fight it.
- `npx tsc --noEmit` clean before release notes.

## Likely escalation triggers

1. **Activities hint copy mismatch.** The brief proposes
   `"day trips, tours, shows — the stuff you do"`. Before
   committing, cross-reference `rally-microcopy-lexicon-v0.md`
   §5.* for an approved activities hint string. If one exists
   and differs, use it. If none exists, escalate for Andrew's
   sign-off before inventing.

2. **EstimateInput hint prop shape.** Confirm via
   `src/components/trip/builder/EstimateInput.tsx` that the
   `hint` prop renders the same markup sell needs
   (`<p className="estimate-input-hint">`). Sketch line 387 +
   395 already pass `hint`; the addition at line 374-380
   should be identical in shape.

3. **Component prop shape.** The brief specifies
   `{ themeId, activitiesDollars, provisionsDollars, otherDollars }`
   — three separate dollar props. If page.tsx already has
   these as a single `everythingElse` or `trip.everything_else`
   object, use the existing shape rather than forcing the
   split. Flag before changing call-site data flow.

4. **`hasEverythingElse` logic computation.** page.tsx
   computes `hasEverythingElse` somewhere (likely derived
   from whether any of the three values are non-null/non-zero).
   Keep that computation where it lives; do NOT move it into
   the new component. The component renders unconditionally
   what it's given; the guard stays at the call site.

5. **Reveal wrapper + marginTop placement.** The extracted
   component should render INSIDE the existing
   `<Reveal delay={0.15}><div className="module-section
   everything-else-module" style={{ marginTop: 14 }}>` chrome,
   OR the component itself should render the .module-section
   div (with marginTop + className baked in). Pick one; the
   brief's Scope item 2 says "Preserve the `<Reveal>` wrapper
   and `style={{ marginTop: 14 }}` exactly as-is" — cleaner to
   leave the Reveal + outer div outside and have the component
   render only the header + rows. If the .module-section div
   goes inside the component, the call site becomes
   `<Reveal><EverythingElse .../></Reveal>` which is also fine.
   Pick the one that reads cleanest in page.tsx; note your
   choice in the release notes.

6. **$3000 bare-cost precedent from 9K.** The 9K rebuild
   introduced a cost-formatting regression (BB-3: `$3000` vs
   `$3,000`) because `formatMoney` was dropped during the
   rebuild. Everything-else uses `.toLocaleString('en-US')`
   on the dollar values — `(activitiesDollars ?? 0).toLocaleString('en-US')`
   — which DOES add commas for 4-digit values. Do NOT change
   this to match the 9K pattern. Keep `.toLocaleString('en-US')`
   as-is. (Fixing 9K's regression is a separate Bug Bash item.)

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9L — Release Notes` using the standard format
(What was built / What changed from the brief / What to test /
Known issues).

Cowork picks up at Step 3 (intake release notes) → Step 4 (QA
against the 13 ACs) from there.
