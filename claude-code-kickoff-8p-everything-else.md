# Claude Code — Session 8P kickoff

## First, read the session guard

Before touching any source files, read:

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3 (Claude Code Execution Rules). Pre-flight checklist applies.

## Then read the brief

The canonical brief for this session lives in `rally-fix-plan-v1.md` under:

```
### Session 8P: "Everything Else — Merge Activities + Provisions + Other"
```

Read the full brief — scope, hard constraints, ACs, files-to-read, scope-boundary reminders.

## Canonical wireframe

```
rally-everything-else-wireframe.html
```

Four frames: before · after populated · after null · number formatting. Design system derives from `rally-sketch-modules-v2-mockup.html` — no new tokens or primitives.

## TL;DR of the session

Merge the two orphaned `.sketch-module` blocks (activities + provisions, ~L350–L372 in `SketchModules.tsx`) into a **single** `.section` labeled "everything else" containing **three** stacked `EstimateInput` rows: activities, provisions, other. All optional. All per-person × crew. Add `toLocaleString()` display formatting in `EstimateInput`. Rename user-facing "food & drink" → "provisions". Wire the new "other" row as `Groceries.name = 'Other'` (no migration). Update `calculateTripCost` to include it. Collapse the module-order entries in `SKILL.md`.

## Hard don'ts (will cause rework)

- No new route. No new top-level component. No migration.
- No drawers, no line items, no per-item splits.
- Do not touch lodging, transport, headliner, crew, buzz, extras, countdown, marquee, sticky bar, or any trip-level field.
- No hardcoded strings in JSX. All user-facing copy via `getCopy` + lexicon.
- Mobile-first at 375px.
- `rm -rf .next && npm run dev` before QA (8M rule).
- `npx tsc --noEmit` must be clean before writing release notes.

## When done

Write release notes in `rally-fix-plan-v1.md` under `#### Session 8P — Release Notes` using the standard format (What was built / What changed from the brief / What to test / Known issues). Flag the `rm -rf .next` requirement at the top of "What to test."

## If you hit an escalation trigger

Stop. State what, state why, state options, recommend but do NOT act. See Part 3 of the session guard.
