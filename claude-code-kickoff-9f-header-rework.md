# Claude Code — Session 9F kickoff (header rework + scoreboard wrapper)

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies.

## Then read the brief

```
rally-fix-plan-v1.md → #### Session 9F: "Header rework + scoreboard wrapper"
                     → also: 9E Release Notes (what was shipped that 9F is reversing
                       in part), 9D-fix Release Notes (scoreboard state)
```

**Label note.** An older kickoff file exists as
`claude-code-kickoff-9f-hero-chrome.md` from the pre-rework 9F scope
(which is now split into this new 9F + a separate 9G). **Ignore that
file.** This file is the current 9F kickoff.

## Canonical references

```
rally-9f-header-rework-sell-mockup.html    (v3 — LOCKED target)
rally-sell-phase-wireframe.html            (broader sell-phase context)
src/components/trip/PostcardHero.tsx       (header component)
src/components/trip/CountdownScoreboard.tsx (wrap target)
src/app/globals.css                         (retune sizes + new rules)
src/lib/copy/surfaces/trip-page-sell.ts    (remove phaseEyebrow.sell)
```

**Read `rally-9f-header-rework-sell-mockup.html` first.** Three rows:
before/after · length tiers · theme adaptivity. It has the full type
scale table, vertical rhythm spec, helper function code, and the
escalation triggers called out in a callout box.

## TL;DR

9E shipped the header elements but the scale + hierarchy didn't land.
9F reworks to the locked v3 wireframe in nine scope items:

1. **Scrap phase-eyebrow** — remove render, CSS, lexicon entry
2. **Scrap live-dot row on sell** — revert the 9E gate change; keep
   `common.live` and `.live-row` for go/done `isLive` path
3. **Title length tiers** — 60 / 48 / 38px based on `tripName.length`
   (≤16 / 17-24 / 25+); helper function in the brief
4. **Title punctuation accent** — regex `/([!?.]+)$/` wraps trailing
   punct in `<span className="title-accent">` with
   `color: var(--hot)`
5. **Meta 20px ink italic 700** (from 9E's 13px muted)
6. **Tagline 22px** (from 20px)
7. **Chrome rebalance** — logo 18px, pill 10px, sticker unchanged
8. **Wrap scoreboard in `.countdown-card`** — new variant: white
   surface + 2.5px ink border + 16px radius + 3×3 press shadow +
   18/18/20 padding + 18px horizontal margin
9. **Lock vertical rhythm** — 16 / 14 / 10 / 14 / 20 gaps

## Hard don'ts

- Do NOT touch the marquee (shipped 9E).
- Do NOT touch the cover image / `.postcard-cover` → **9G owns that.**
- Do NOT delete `<ShareLinkButton>` or `<OrganizerCard>` → **9G.**
- Do NOT change the sticker content.
- Do NOT modify `ChassisCountdown.tsx` (still used by `InviteeShell`).
- Do NOT change `CountdownScoreboard`'s prop surface, internals, tick
  logic, or tile CSS. Wrapper only.
- Do NOT remove the `common.live` lexicon entry or `.live-row` CSS —
  they're still used by the go/done `isLive` path.
- Do NOT add a fourth title size tier or switch to JS-based sizing.
- Do NOT touch any module (headliner onward) → 9H+.
- Mobile-first at 375px.
- `pkill -f "next dev"; pkill -f "next-server"; pkill -f "node.*next"`
  → `rm -rf .next && npm run dev` before QA.
- `npx tsc --noEmit` clean before release notes.

## Allowed files

- `src/components/trip/PostcardHero.tsx` — scraps + title helpers
- `src/components/trip/CountdownScoreboard.tsx` — wrapper div only
- `src/app/globals.css` — size retunes, tier classes, accent, card,
  cleanup of `.phase-eyebrow`
- `src/lib/copy/surfaces/trip-page-sell.ts` — remove
  `phaseEyebrow.sell` only

## Likely escalation triggers

- **`.title` class shared with sketch's inline edit field** → STOP.
  Scope the new size tiers to a sell-only wrapper class before
  bumping. Sketch should render unchanged.
- **`common.live` referenced beyond the `isLive` gate** → STOP before
  reverting.
- **Punctuation-split edge cases** (emoji-only titles, non-ASCII) →
  fall back to no-accent and move on. Don't over-engineer.
- **Length-tier breakpoints (16/24/25+) feel off against real trip
  names** → tune values, but don't add tiers or switch to JS sizing.

## How to verify the accent tracks per theme

Open 2-3 sell trips on different themes (default, bachelorette, beach).
The title's trailing `!?.` should render in that theme's `--hot`
(coral / pink / blue). Log the actual behavior across themes in the
release notes for future reference.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9F — Release Notes` using the standard format.
