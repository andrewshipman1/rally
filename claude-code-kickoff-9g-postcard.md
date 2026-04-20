# Claude Code — Session 9G kickoff (cover-image postcard + deletions)

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies.

## Then read the brief

```
rally-fix-plan-v1.md → #### Session 9G: "Cover-image postcard + destination stamp + hero-area cleanup"
                     → also: 9F Release Notes + 9F Actuals (the hero/header state 9G builds on)
```

## Canonical references

```
rally-9e-hero-chrome-sell-mockup.html   (9G target — filename retained
                                          from earlier iteration; content valid)
rally-sell-phase-wireframe.html         (wireframe context ~line 680)
src/components/trip/PostcardHero.tsx    (cover image lives here)
src/app/trip/[slug]/page.tsx            (two deletions per scope #5 + #6)
src/lib/themes/*                        (theme tokens for fallback gradient)
```

**Read `rally-9e-hero-chrome-sell-mockup.html` first.** It shows both
the cover-present variant and the theme-gradient fallback variant side
by side, with annotations.

## TL;DR

Six scope items, two "surfaces":

**Hero cover image reposition + frame (PostcardHero.tsx + globals.css):**

1. Move `<div className="postcard-cover">` from above-header → below
   tagline, above `<CountdownScoreboard>` / `.countdown-card`
2. Cover-present variant: 16:9 postcard frame, 2.5px ink border, 12px
   radius, image `overflow: hidden`, subtle bottom-gradient tint for
   stamp legibility
3. Theme-gradient fallback when `cover_image_url` is null — same frame
   shape, theme-color gradient instead
4. Destination stamp pill in top-right corner (white bg, 1.5px ink
   border, 7px radius, ~3deg rotation, mini press shadow). Content:
   `trip.destination`. Hidden when destination unset.

**page.tsx render-call deletions:**

5. Delete `<ShareLinkButton>` render call + import (~lines 341-345).
   Leave `ShareLinkButton.tsx` component file in place (orphan).
6. Delete `<OrganizerCard>` render call + import (~line 357). Leave
   `OrganizerCard.tsx` file in place (orphan).

## Escalation trigger — theme-gradient tokens (pay attention)

The fallback gradient (scope #3) needs two color values per theme.
Before coding, inspect `src/lib/themes/*` and pick a path:

- **(a) Reuse two existing per-theme color vars** (preferred — no new
  tokens). Note: **`--hot` just landed in every theme in 9F** — that's
  a fresh candidate alongside `--accent`. If `--hot` + `--accent` can
  compose into a readable gradient per theme, ship with those.
- **(b) Add `--theme-gradient-a` / `--theme-gradient-b` per theme
  (17 × 2 = 34 new tokens)** — material work, ESCALATE before coding.
- **(c) Shared neutral gradient** across all themes for v0.

Pick (a) if feasible. Confirm per-theme readability before shipping.
If (b) or (c) is the cleanest path, STOP and raise options.

## Hard don'ts

- Do NOT modify `CountdownScoreboard.tsx` (9F territory, shipped).
- Do NOT touch `ChassisCountdown.tsx` (used by `InviteeShell`).
- Do NOT touch title / meta / tagline / chrome row (9F owns those;
  shipped + QA'd).
- Do NOT touch the marquee.
- Do NOT touch any module (headliner onward).
- Do NOT build an image upload flow (separate sketch-path concern).
- Do NOT add new lexicon entries — `trip.destination` is data, not
  voice copy.
- Do NOT delete `ShareLinkButton.tsx` or `OrganizerCard.tsx` component
  files (orphan pattern per 9A's flights/groceries/activities).
- Do NOT touch `page.tsx` beyond the two render-call deletions + their
  imports.
- Mobile-first at 375px.
- `pkill -f "next dev"; pkill -f "next-server"; pkill -f "node.*next"`
  → `rm -rf .next && npm run dev` before QA.
- `npx tsc --noEmit` clean before release notes.

## Allowed files

- `src/components/trip/PostcardHero.tsx` — cover reposition + frame +
  fallback + stamp
- `src/app/globals.css` — scoped `.postcard`, `.postcard-stamp`,
  `.postcard--image`, `.postcard--fallback` rules (names suggested;
  CC's final naming call)
- `src/app/trip/[slug]/page.tsx` — the two render-call deletions + their
  imports only; no other edits
- `src/lib/themes/*` — ONLY if CC takes escalation path (b) and Andrew
  approves

## Regression gate for the deletions

Before deleting render calls, confirm:

- Sketch trip still works (uses `SketchTripShell`, different render
  path — should be unaffected)
- No other page references `ShareLinkButton` or `OrganizerCard`
  imports that would break. Grep the codebase before deleting the
  imports.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9G — Release Notes` using the standard format.
