# Claude Code — Session 9D kickoff

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies.

## Then read the brief

```
rally-fix-plan-v1.md → #### Session 9D: "Countdown scoreboard build"
                     → also: 9A / 9A-fix / 9C release notes + Actuals
```

## Canonical references

```
rally-9d-scoreboard-mockup.html       (9D target — read this first)
rally-sell-phase-wireframe.html       (scoreboard at ~line 685+)
src/components/trip/ChassisCountdown.tsx   (existing countdown pattern)
```

**Read `rally-9d-scoreboard-mockup.html` first** — it's the focused 9D
spec with annotations, CSS reference, and the "drop the secondary
countdown" decision flagged as an escalation trigger.

## TL;DR

New `CountdownScoreboard` client component. d:h:m:s tiles with
yellow-sticker treatment. Live-tick seconds (1Hz `setInterval`).
Lock-emoji wobble. Replaces the sell-phase
`<ChassisCountdown>` call in `page.tsx`. Lock/go phases use the same
component with different target + themed kicker. Sketch phase
untouched. Secondary sell countdown gets dropped (wireframe has one
scoreboard — confirm before deleting).

## Hard don'ts

- Do NOT modify `ChassisCountdown.tsx`. New component alongside.
- Do NOT touch the deadline banner (rust-colored "today's the day").
- Do NOT touch the marquee (still parked separately).
- Do NOT touch the cover image or hero banner — that's Session 9E.
- Do NOT touch any module (headliner onward).
- Do NOT touch sketch-phase hero or its countdown path.
- Do NOT invent new lexicon entries. If kicker / hint strings aren't
  in the lexicon, STOP and escalate.
- Component must be `'use client'` (needs useEffect for the interval).
- `rm -rf .next && npm run dev` before QA. Kill orphan `next dev` +
  `next-server` + `node.*next` procs first (per 9C pain point).
- `npx tsc --noEmit` clean before release notes.

## Likely escalation triggers

- **Kicker / hint strings don't exist in the lexicon** → STOP. Raise
  options (add entries vs. reuse adjacent strings vs. pull from theme
  tokens) before writing new copy.
- **"Drop the secondary sell countdown"** — the brief recommends it
  (wireframe has one scoreboard). If there's a reason to keep both
  (accessibility, test data, a state I can't see), STOP and raise it.
- **Phase-branch edge case** — if lock/go already renders a different
  countdown shape that shouldn't be swapped to the scoreboard, STOP
  and confirm the migration scope.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9D — Release Notes` using the standard format.
