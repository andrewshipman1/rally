# Claude Code — Session 9H kickoff (headliner sketch parity)

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies.

## Then read the brief

```
rally-fix-plan-v1.md → #### Session 9H: "Headliner — sketch parity on sell"
                     → also: 9F + 9G Release Notes for hero/countdown context
                     → 9A-fix Release Notes (SellHeadliner origin)
```

**Label note.** An older kickoff `claude-code-kickoff-9c-headliner-polish.md`
exists from when this work was briefly tagged 9C. **Ignore that file** —
scope has shifted from "polish + readOnly" to "strict sketch parity."
This file is the current kickoff.

## Canonical references

```
rally-9h-headliner-sell-mockup.html        (9H target — v2 locked; read first)
/trip/TheVfl1-                             (sketch VEGAS BABY — live reference)
/trip/sjtIcYZB                             (sell Coachella — current state)
src/components/trip/builder/Headliner.tsx  (component source)
src/components/trip/SellHeadliner.tsx      (9A-fix wrapper)
src/components/trip/builder/SketchModules.tsx  (check where sketch wraps)
src/app/globals.css:4796                   (.module-section primitive)
src/lib/copy/surfaces/builder-state.ts     (existing lexicon)
```

**Read `rally-9h-headliner-sell-mockup.html` first.** Three rows:
sketch reference side-by-side with sell target, plus current-sell
"before" for context. All specs + escalation triggers in the
annotations.

## TL;DR

Make the sell headliner look exactly like the populated sketch
headliner. The delta is small:

1. **Wrap** the existing `.module-card.headliner` rendered output in
   a `.module-section` (existing primitive, zero new CSS).
2. **Add** a `.module-section-header` with "the headliner" title
   (left) and "rough estimate" caption (right). Match sketch exactly.
3. **Add** `readOnly?: boolean` prop to `Headliner.tsx`. Default
   false. When true, drop the outer card's click handlers +
   role=button + tabIndex. Render as a bare `<div>`.
4. **`SellHeadliner`** passes `readOnly={true}` and drops the noop
   `onOpen`.
5. **Audit** the "· edit anytime" cost-line tail — on sell
   (read-only per option C), it's misleading. Recommend option (ii):
   drop the tail on sell via phase-aware lexicon. Escalate first.

**The inner `.module-card` (image, title, cost, CTA) stays
byte-identical.** Don't restyle anything inside the card.

## Principle locked (Andrew, 2026-04-17)

Sell page below the countdown = sketch populated, fully read-only.
Invitees can't edit; organizer edits via future sketch-mode portal
(option C, separate future session). Every module below the
countdown mirrors sketch exactly — no sell-specific design
invention.

## Hard don'ts

- Do NOT modify the inner `.module-card` (image, title, cost line,
  CTA). Only add the outer section wrap + header.
- Do NOT touch sketch path (`SketchModules.tsx`) beyond inspecting
  for reference. Sketch rendering is byte-identical post-9H.
- Do NOT add a sell-specific visual element not in sketch.
- Do NOT touch any other module (spot, transport, etc.) — 9I+ after
  this ships.
- Do NOT touch the deadline banner or AddToCalendarButton — 9I.
- Do NOT address organizer edit flow — future session.
- Do NOT add new CSS if the existing `.module-section` primitive
  handles it cleanly (check the existing `.module-section-count`
  rule at globals.css ~4826 — it might serve as the right-side
  caption, or a new `.module-section-caption` class may be needed).
- Mobile-first at 375px.
- `pkill -f "next dev"; pkill -f "next-server"; pkill -f "node.*next"`
  → `rm -rf .next && npm run dev` before QA.
- `npx tsc --noEmit` clean before release notes.

## Likely escalation triggers

1. **Section wrap location.** If sketch wraps `<Headliner>` at the
   call site in `SketchModules.tsx` (not inside the component), match
   that pattern — don't double-wrap. STOP and flag if the pattern
   isn't immediately obvious from reading the sketch path.
2. **Lexicon keys for section title + caption.** Grep first. If keys
   exist under a different surface (e.g. `tripPageShared.headliner.*`),
   reuse. If they don't exist, STOP before adding — raise the options
   to Andrew.
3. **"· edit anytime" tail copy.** On sell under option C, it's
   misleading. Three paths:
   - (i) Keep as-is (strict visual parity)
   - (ii) Drop on sell only via phase-aware lexicon
   - (iii) Replace with sell-appropriate tail
   Recommended: (ii). Escalate before picking.
4. **Right-side caption CSS.** If `.module-section-count` (existing)
   doesn't deliver the "rough estimate" treatment cleanly (wrong font,
   wrong opacity), a new `.module-section-caption` class may be needed.
   STOP and flag if the existing primitive isn't a clean fit.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9H — Release Notes` using the standard format.
