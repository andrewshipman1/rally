# Claude Code — Session 9E kickoff

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies.

## Then read the brief

```
rally-fix-plan-v1.md → #### Session 9E: "Top-of-header rebuild"
                     → also: 9A / 9A-fix / 9C / 9D release notes + Actuals
                     → also: "Header audit findings" note in 9D Actuals
```

## Canonical references

```
rally-9e-top-header-sell-mockup.html    (9E target — READ FIRST)
rally-sell-phase-wireframe.html         (view 2 hero reference)
src/components/trip/PostcardHero.tsx    (primary file — all hero edits land here)
src/lib/copy/surfaces/trip-page-sell.ts (lexicon home for marquee + phase-eyebrow)
src/lib/copy/surfaces/common.ts         (verify common.live)
```

## TL;DR

Top-of-header rebuild. Five changes, all phase-gated to sell. Rally
chrome stays (logo, "is calling" pill, sticker). Wireframe additions
layered in: live-dot row, phase-eyebrow, trip meta, tagline reposition,
dynamic marquee.

Target stack (top to bottom):

```
marquee (dynamic sell template)
logo + "is calling" pill + sticker        ← preserved
live-dot row — "trip is live"             ← NEW (enable on sell)
phase-eyebrow — "sell · {N}-night trip"   ← NEW (distinct from existing .eyebrow pill)
title                                      ← preserved
trip meta — "dates · destination"         ← NEW
tagline                                    ← existing, repositioned below meta
```

## Five numbered changes

1. **Marquee dynamic sell template** — replace `theme.strings.marquee`
   on sell with `"★ {organizer} called you up ★ lock it in by
   {cutoffShort} ★ {inCount} already in ★"`. Omit count when 0. New
   lexicon. Other phases unchanged.
2. **Enable live-dot row on sell** — flip the gate from
   `isSketch || isLive` → `isSketch || isLive || phase === 'sell'`.
   Verify `common.live` resolves to `"trip is live"`.
3. **NEW phase-eyebrow element** — distinct from the existing
   `.eyebrow` pill. Below live-dot row. `"sell · {N}-night trip"` with
   nights math. New lexicon. Class name: `.phase-eyebrow` (or similar
   disambiguating).
4. **NEW trip meta row** — below title. `"{dates} · {destination}"`
   with same-month collapse. No new lexicon (data render).
5. **Reposition tagline** — move from directly below title to below
   trip meta row. No content or styling change.

## Hard don'ts

- Do NOT touch the sticker content / position / styling.
- Do NOT touch the existing `.eyebrow` pill ("is calling") — add a
  distinct NEW element for the phase-eyebrow.
- Do NOT touch the cover image — 9F.
- Do NOT touch the scoreboard or its wrapper — 9D-fix + 9F.
- Do NOT touch any module (headliner onward).
- Do NOT break the sketch hero — phase-gate every change, verify
  sketch still works.
- Do NOT touch `InviteeShell`.
- Do NOT invent lexicon beyond scope #1 and #3.
- `pkill -f "next dev"; pkill -f "next-server"; pkill -f "node.*next"`
  → `rm -rf .next && npm run dev` before QA.
- `npx tsc --noEmit` clean before release notes.

## Likely escalation triggers

- `common.live` doesn't resolve to `"trip is live"` today → raise
  options (update existing vs. add sell-override).
- Marquee template approach: single interpolated string vs. three
  discrete pieces joined in component → raise options based on the
  existing surface pattern.
- Nights math edge cases (timezone, invalid, same-day) you can't
  resolve cleanly → raise options.
- Preserving sketch behavior requires restructuring `PostcardHero`'s
  conditional rendering beyond "add elements, add phase branch" →
  STOP before restructuring.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9E — Release Notes` using the standard format.
