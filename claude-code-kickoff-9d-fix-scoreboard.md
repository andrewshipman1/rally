# Claude Code — Session 9D-fix kickoff

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies.

## Then read the brief + context

```
rally-fix-plan-v1.md → #### Session 9D — Release Notes
                     → 9D QA (2026-04-17) — two issues found note
                     → #### Session 9D-fix: "Scoreboard tick rate + sizing"
```

## TL;DR

Two-item hot fix on the scoreboard you shipped in 9D. Two files touched
(`CountdownScoreboard.tsx` + `globals.css`). No prop changes, no
lexicon changes, no other surfaces.

### Issue 1 — Tick rate runs ~4–5× faster than real time

Verified in Chrome on `/trip/k5PbSJff`. Seconds tile decremented 28s
over a ~3s real wait, then 42s over a ~5s real wait — consistently
~4–5× too fast. Component code LOOKS correct (1Hz `setInterval`,
target-based recompute, `[target]` dep, cleanup). No StrictMode in the
app folder.

Possible causes — diagnose before fixing:

- Next.js 16 / Turbopack HMR dev artifact (orphaned intervals)
- Prop reference instability triggering effect re-runs each render
- Subtle stacking pattern I'm not seeing

**Required step:** verify in `next build && next start` (production
profile). If the bug does NOT repro in prod, it's dev-only — harden
with a `useRef` guard or recursive `setTimeout` pattern. If it DOES
repro in prod, fix the root cause (likely effect stacking / prop
instability).

### Issue 2 — Tiles visually under-scale at 375px

Andrew's feedback: "a lot of white space around the countdown. I feel
like it could be larger." CSS-only polish in `globals.css`:

- Remove / raise tile `max-width` so tiles fill more of the row
- Bump numeral font size from 28px toward 36-42px (your call on exact
  value — aim for visual weight closer to the 42px trip title without
  overpowering it)
- Bump unit label from 10px to 11-12px
- Optional: tighten vertical padding above/below if the bigger tiles
  introduce awkward gaps

## Hard don'ts

- Do NOT change the component's prop surface.
- Do NOT change the lexicon.
- Do NOT modify `ChassisCountdown.tsx`.
- Do NOT touch any file other than `CountdownScoreboard.tsx` and
  `globals.css`.
- Do NOT add new dependencies.
- `pkill -f "next dev"; pkill -f "next-server"; pkill -f "node.*next"`
  → `rm -rf .next && npm run dev` before QA.
- `npx tsc --noEmit` clean before release notes.

## Escalation triggers

- **If the tick bug reproduces in `next build && next start`** → STOP.
  That's a real bug, not dev HMR. Raise options before coding.
- **If the tile-size bump breaks the 375px layout** (horizontal scroll,
  clipped tiles) → STOP. Raise options.
- **If a fix requires changing the component prop surface** → STOP.
  Out of scope.

## How to verify the tick fix

Navigate to `/trip/k5PbSJff`. Screenshot the scoreboard. Wait 10 real
wall-clock seconds. Screenshot again. The seconds tile should have
decremented by ~10, not ~40+.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9D-fix — Release Notes` using the standard format.
