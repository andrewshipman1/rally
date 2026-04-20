# Claude Code — Session 9E kickoff

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies.

## Then read the brief

```
rally-fix-plan-v1.md → #### Session 9E: "Scoreboard wrapper + cover-image postcard"
                     → also: 9D Release Notes + 9D Actuals + header audit findings
```

## Canonical references

```
rally-9e-hero-chrome-sell-mockup.html   (9E target — read this first; two variants)
rally-sell-phase-wireframe.html         (wireframe reference ~line 680 postcard, ~685 scoreboard)
src/components/trip/PostcardHero.tsx    (cover image + header)
src/components/trip/CountdownScoreboard.tsx (scoreboard wrapper target)
src/lib/themes/*                        (theme tokens for fallback gradient)
```

**Read `rally-9e-hero-chrome-sell-mockup.html` first.** It shows BOTH
variants (cover image present / no cover → theme-gradient fallback) side
by side and flags the theme-gradient token escalation trigger.

## TL;DR

Two concerns, one session. Both are "chrome around the countdown":

1. **Scoreboard card wrapper** — wrap the existing scoreboard contents
   in a new `.countdown-card` (white surface, ink border, rounded,
   padded, press shadow). No prop changes, no internal changes to the
   scoreboard. Just a visible wrapper.
2. **Cover image postcard** — reposition `<div className="postcard-cover">`
   from above-header → between tagline and scoreboard. Reframe as a
   `.postcard` (2.5px ink border, 12px radius, 16:9 aspect). Add
   destination-stamp pill (rotated white pill, top-right). Render a
   **theme-gradient fallback** in the same frame when
   `cover_image_url` is null.

## Hard don'ts

- Do NOT add a trip meta row (dates + destination). 9F owns it.
- Do NOT swap sticker content. 9F owns it.
- Do NOT add live-dot row, eyebrow, or touch the tagline. 9F.
- Do NOT touch the marquee. 9G.
- Do NOT change `CountdownScoreboard` prop surface or tile internals.
- Do NOT touch `ChassisCountdown.tsx` (still used by `InviteeShell`).
- Do NOT touch any module below the countdown.
- Do NOT add new lexicon entries. Destination is data, not voice copy.
- Do NOT build an upload flow.
- Do NOT address 9D-fix tick rate / tile sizing in the same session.
- `pkill -f "next dev"; pkill -f "next-server"; pkill -f "node.*next"`
  → `rm -rf .next && npm run dev` before QA.
- `npx tsc --noEmit` clean before release notes.

## Escalation trigger — theme-gradient tokens

Theme tokens may not cleanly support a two-color gradient for the
fallback postcard. Before coding the fallback, inspect
`src/lib/themes/*` and pick a path:

- **(a) Reuse two existing per-theme color vars** (preferred — no new
  tokens). If each theme has two suitable color vars already, compose
  the gradient from them.
- **(b) Add `--theme-gradient-a` / `--theme-gradient-b` per theme
  (17 themes × 2 vars = 34 new tokens)** — material work, ESCALATE
  before coding.
- **(c) Shared neutral gradient** across all themes for v0 — simpler,
  less "theme-alive."

If (a) is feasible, proceed. If (b) or (c) is the cleanest path, STOP
and raise options before coding.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9E — Release Notes` using the standard format.
