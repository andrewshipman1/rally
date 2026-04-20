# Claude Code — Session 9C kickoff

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies.

## Then read the brief

```
rally-fix-plan-v1.md → #### Session 9C: "Headliner polish — sell readOnly + copy + layout pass"
                     → also: Session 9A + 9A-fix release notes + 9A Actuals
```

## Canonical references

```
rally-9c-headliner-sell-mockup.html   (9C target — read this first)
rally-headliner-mockup.html           (original 8J — populated state structure + CSS only)
rally-sketch-modules-v2-mockup.html   (8N .module-section primitives)
rally-microcopy-lexicon-v0.md         (copy source of truth)
```

**Read `rally-9c-headliner-sell-mockup.html` first** — it's the focused 9C
spec with annotations on what's in scope, what's out of scope, and the
escalation trigger around the CTA click propagation. The original 8J
mockup has useful structure/CSS but mixes sketch-path concerns (null
state, theme picker, drawer) that don't apply here.

## TL;DR

First module in the top-down polish walk down the sell page. 9A laid the
scaffolding; 9C makes the headliner pixel-perfect on sell.

Three things:

1. **Fix the soft dead-end card body on sell.** Add `readOnly?: boolean` to
   `Headliner.tsx` (default `false`). When `true`, drop `role="button"` +
   `onClick` + hover/press states on the outer card. The embedded source
   link still works. Update `SellHeadliner.tsx` to pass `readOnly={true}`
   (and drop the noop `onOpen`).
2. **Copy audit.** Every headliner string resolves via `getCopy` — no
   JSX literals. Resolved values match the lexicon. Don't invent new
   lexicon entries; flag gaps.
3. **375px layout + 8N parity pass.** Compare rendered sell-phase
   headliner against `rally-headliner-mockup.html`. Fix spacing / font /
   border-radius drift in globals.css, headliner-scoped only.

## Hard don'ts

- Do NOT touch `SketchModules.tsx` or any sketch-path caller.
- Do NOT modify `.module-section` in globals.css. Headliner-scope rules
  only.
- Do NOT add new lexicon entries. If audit surfaces gaps, flag and
  escalate.
- Do NOT touch any other module.
- Do NOT touch the hero, countdown, marquee, or sticky bar (Session 14).
- Do NOT change `Headliner.tsx`'s data shape or prop surface beyond
  adding `readOnly`.
- `rm -rf .next && npm run dev` before QA (kill orphan `next dev` first
  if SST cache complains).
- `npx tsc --noEmit` clean before release notes.

## Allowed files

- `src/components/trip/builder/Headliner.tsx`
- `src/components/trip/SellHeadliner.tsx`
- `src/lib/copy/surfaces/builder-state.ts` (only if copy audit finds a
  hardcoded literal that has a matching lexicon entry waiting)
- `src/app/globals.css` (headliner-scoped rules only)

## Likely escalation triggers

- Copy audit reveals strings not yet in the lexicon → STOP. Flag the gap
  before inventing.
- `readOnly` behavior interferes with the embedded source-link click →
  STOP. Flag the composition options (stopPropagation on the link vs.
  removing outer click vs. changing the card root element).
- 8N parity requires touching `.module-section` → STOP. Wrong scope.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9C — Release Notes` using the standard format.
