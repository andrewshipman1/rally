# Claude Code — Session 9F kickoff

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies.

## Then read the brief

```
rally-fix-plan-v1.md → #### Session 9F: "Scoreboard wrapper + cover-image postcard"
                     → also: 9D Release Notes + 9D Actuals + 9D-fix Release Notes
                     + 9E (top-of-header rebuild) Release Notes + header audit findings
```

**Label note:** an older kickoff file exists as
`claude-code-kickoff-9e-hero-chrome.md` from when this session was briefly
tagged 9E. Ignore that file — scope has since been renumbered to 9F and
expanded with two additional deletions. This file is the current kickoff.

## Canonical references

```
rally-9e-hero-chrome-sell-mockup.html   (canonical target — two variants)
rally-sell-phase-wireframe.html         (wireframe reference)
src/components/trip/PostcardHero.tsx    (cover image + header)
src/components/trip/CountdownScoreboard.tsx (scoreboard wrapper target)
src/app/trip/[slug]/page.tsx            (two deletions per scope #6)
src/lib/themes/*                        (theme tokens for fallback gradient)
```

**Read `rally-9e-hero-chrome-sell-mockup.html` first.** It shows BOTH
variants (cover image present / no cover → theme-gradient fallback) side
by side and flags the theme-gradient token escalation trigger.

## TL;DR

Hero chrome pass, six things:

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
3. **Delete `<ShareLinkButton>`** render call from `page.tsx` (~lines
   341–345) plus its import. Andrew: "totally wrong." Share-link UX is
   Session 11's concern. Keep `ShareLinkButton.tsx` file — orphan, don't
   delete.
4. **Delete `<OrganizerCard>`** render call from `page.tsx` (~line 357)
   plus its import. Same orphan-file pattern as #3.

(#3 and #4 are the "remove two hero-area render calls" item #6 in the
9F brief.)

## Hard don'ts

- Do NOT add a trip meta row (dates + destination). Separate session.
- Do NOT swap sticker content. Separate session.
- Do NOT add live-dot row, eyebrow, or touch the tagline.
- Do NOT touch the marquee.
- Do NOT change `CountdownScoreboard` prop surface or tile internals.
- Do NOT touch `ChassisCountdown.tsx` (still used by `InviteeShell`).
- Do NOT touch any module below the countdown.
- Do NOT add new lexicon entries. Destination is data, not voice copy.
- Do NOT build an upload flow.
- Do NOT address 9D-fix tick rate / tile sizing in the same session.
- Do NOT delete the `ShareLinkButton.tsx` or `OrganizerCard.tsx`
  component files — only their render calls + imports in `page.tsx`.
- Do NOT touch `page.tsx` beyond the two deletions (no other edits
  there).
- `pkill -f "next dev"; pkill -f "next-server"; pkill -f "node.*next"`
  → `rm -rf .next && npm run dev` before QA.
- `npx tsc --noEmit` clean before release notes.

## Escalation trigger — theme-gradient tokens

Theme tokens may not cleanly support a two-color gradient for the
fallback postcard. Before coding the fallback, inspect
`src/lib/themes/*` and pick a path:

- **(a) Reuse two existing per-theme color vars** (preferred — no new
  tokens).
- **(b) Add `--theme-gradient-a` / `--theme-gradient-b` per theme
  (17 themes × 2 vars = 34 new tokens)** — material work, ESCALATE
  before coding.
- **(c) Shared neutral gradient** across all themes for v0.

If (a) is feasible, proceed. If (b) or (c) is the cleanest path, STOP
and raise options before coding.

## Regression gate for the deletions

Before deleting the render calls, confirm:
- Sketch trip page still works (uses `SketchTripShell`, different render
  path — the call sites in `page.tsx` sell/lock/go block don't affect
  it, but verify by loading a sketch trip after the delete).
- No other page references `ShareLinkButton` or `OrganizerCard` imports
  that would now be broken. grep the codebase before deleting.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9F — Release Notes` using the standard format.
