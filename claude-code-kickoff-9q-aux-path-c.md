# Claude Code — Session 9Q kickoff (aux Path C orientation + buzz removal — 9N revival)

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Part 3 applies. Two-piece session — buzz removal (mechanical) +
aux Path C orientation (design). Treat them as a single commit but
keep the work separate while implementing.

## Turbopack cache warning (BB-5)

Standard recovery before starting the dev server:
```
pkill -9 node
lsof -iTCP:3000 -sTCP:LISTEN   # must be empty
lsof -iTCP:3001 -sTCP:LISTEN   # must be empty
cd ~/Desktop/claude/rally
rm -rf .next node_modules/.cache
npm run dev
# WAIT 30-60s after "Ready in Xs"
```

## Then read the brief

```
rally-fix-plan-v1.md → ### Session 9Q: "Aux Path C orientation +
                        buzz removal (9N revival)"
                     → also: ### Session 9N (scope reference for
                             Piece 1 — originally drafted 2026-04-22,
                             never executed, re-executing exactly
                             as written)
                     → also: ### Session 9O Actuals (Path C
                             precedent for Piece 2 hero-block shape)
                     → also: BB-5 (Turbopack workaround)
```

## Canonical design reference

```
rally-9o-cost-summary-sell-mockup.html   ← Row 4 Path C frame is the shape spec for aux
claude-code-kickoff-9n-remove-buzz.md     ← Piece 1 scope verbatim
```

## Canonical code references

```
/trip/sjtIcYZB     (Coachella sell — buzz still rendering; aux needs reshape)

src/app/trip/[slug]/page.tsx                   (PIECE 1: remove 4 buzz sites + comment)
src/components/trip/PlaylistCard.tsx           (PIECE 2: reshape to Path C)
src/app/globals.css                            (PIECE 2: add .chassis .aux-hero-block + related)

src/components/trip/BuzzSection.tsx            (REFERENCE ONLY — DO NOT MODIFY)
src/lib/buzz.ts                                (REFERENCE ONLY — DO NOT MODIFY)
src/lib/copy/surfaces/buzz.ts                  (REFERENCE ONLY — DO NOT MODIFY)
src/app/trip/[slug]/buzz/page.tsx              (ORPHAN ROUTE — DO NOT MODIFY)
src/types/index.ts                             (REFERENCE ONLY — DO NOT MODIFY)
```

## TL;DR

**Piece 1: Remove `<BuzzSection>` from sell render.** 9N was
drafted but never executed — we pivoted to 9O before CC ran it.
Buzz still renders on sell (screenshot confirms). Re-execute
9N's exact scope:

1. Remove 2 imports (page.tsx:27-28)
2. Remove `const buzzDays = await getBuzzFeed(...)` (page.tsx:263-264)
3. Remove `<Reveal><BuzzSection .../></Reveal>` block (page.tsx:535-544)
4. Update module-order comment (page.tsx:332) to drop "buzz"

Files preserved on disk: `BuzzSection.tsx`, `lib/buzz.ts`,
`lib/copy/surfaces/buzz.ts`, `app/trip/[slug]/buzz/page.tsx`.

**Piece 2: Aux Path C orientation.** `PlaylistCard.tsx` already
wraps in `.module-section.aux-section` but the OG-image hero sits
inside a nested card with its own border. Pull the OG image up
flush with the module-section top border so the visual mirrors
Your Total (Path C). Structure:

```
.module-section.aux-section
├── .aux-hero-block        (OG image flush to top; title + eyebrow overlaid)
├── .aux-body              (cream — playlist title, domain, byline)
└── .aux-footer-caption    ("tap the card to open · add songs from anywhere")
```

- Remove the nested card border inside the module-section.
- Move title + eyebrow INTO the hero block (on top of OG image).
- Empty/fallback state: hero uses `var(--surface)` + `var(--on-surface)`.

## Principle locked (Andrew, 2026-04-23)

**Option A on OG-image treatment.** The OG image IS the hero
background. No dark tint, no gradient overlay by default. Only
add a darkening treatment if title-contrast genuinely fails on
an observed OG image during QA.

**Mirror Your Total Path C for structure.** The 9O mockup's Row
4 frame is the shape spec. Hero block flush with module-section
top border, body on cream below, caption at bottom. Same
conceptual layout as CostBreakdown post-9O.

**Read-only on sell for every viewer.** Swap-it pill interaction
already exists from 8Q — preserve exactly. No new organizer
affordances.

**Don't delete anything for buzz.** Render-call removal only.
All four buzz files stay on disk for when buzz returns with a
proper redesign.

## Hard don'ts

- Do NOT create new routes.
- Do NOT touch any other module — single-module discipline.
- Do NOT delete or modify `BuzzSection.tsx`, `lib/buzz.ts`,
  `lib/copy/surfaces/buzz.ts`, or `app/trip/[slug]/buzz/page.tsx`.
- Do NOT change the playlist save/enrich logic, the
  `setPlaylistUrl` / `clearPlaylistUrl` server actions, or the
  enrich API call.
- Do NOT add organizer-specific rendering. Swap-it works for
  whoever can edit (existing 8Q behavior); don't expand role
  logic.
- Do NOT add a dark tint or gradient overlay to the OG image
  by default. Only after a contrast failure is observed.
- Do NOT introduce strings not in `rally-microcopy-lexicon-v0.md`.
- Do NOT change data model or types.
- Mobile-first at 375px. Hero block must render cleanly at that
  width with OG image + title + eyebrow + swap-it pill all fitting.

## Likely escalation triggers

1. **OG-image title contrast fails on observed themes.** Test
   with Coachella's current playlist OG + switch themes. If
   title color (probably `var(--on-surface)` or a white variant)
   fails against the purple Spotify gradient or any other OG
   art, propose a top-edge darkening gradient — but flag before
   adding. Andrew locked Option A (no gradient default).

2. **"aux cord secured" eyebrow + "swap it" pill collision.**
   Both currently live in the top-right region. If they can't
   fit legibly inside the hero at 375px, propose: (a) drop the
   eyebrow (older flavor label), (b) move eyebrow to bottom-
   left of hero, or (c) move eyebrow outside the hero entirely
   (back on cream, like sibling `.module-section-caption`).
   Flag before deciding.

3. **Empty-state visual weight.** Spec says fallback uses
   `var(--surface)` (matching Your Total). If empty aux feels
   bizarrely dark for a "no playlist yet" state (Your Total is
   meant to feel like a financial anchor; aux isn't), propose
   a lighter alternative (`color-mix(var(--surface) 50%,
   transparent)`) before implementing.

4. **PlaylistCard is a client component with THREE visual
   states** (empty / saved+enriched / saved+fallback). All
   three need Path C treatment. Don't restyle only the
   enriched state.

5. **Nested card removal affects `<a>` tap target.** Current
   implementation may wrap the whole card in an anchor for
   tap-to-open. Preserve that — the flushed hero block + body
   should still behave as a single tap target to open the
   playlist URL.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9Q — Release Notes` using the standard format.
Include a before/after screenshot of the aux module (even if
just a DOM description) so Cowork QA can compare against the
Path C intent quickly.

Cowork picks up at Step 3 → Step 4 from there. Expect QA to be
medium-sized (19 ACs: buzz-removal greps are fast, aux visual
checks are the bulk).
