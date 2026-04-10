# Rally v0 — QA Report (Post-Session 4)

**Date:** April 10, 2026
**URL:** rally-gold.vercel.app
**Auditor:** Claude (CoWork)
**Method:** Chrome browser audit (DOM inspection + visual screenshots) at ~600px viewport width

---

## Executive Summary

The app is in dramatically better shape than the pre-Session-4 QA. Of the 16 issues cataloged in `claude-code-kickoff-session-4-qa-fixes.md`, **12 are fully resolved**. Four issues remain, plus 2 new findings.

### What was fixed since last QA

- **P0 FIXED:** Tortola trip now correctly renders as `tropical` theme (was `beach-trip`)
- **P1 FIXED:** Auth tagline → `how friend groups get to "let's go"` (was "the group trip planner...")
- **P1 FIXED:** Auth button → `let me in` (was "send me a link")
- **P1 FIXED:** Wordmark → `rally!` with pink bang on dashboard, passport, and auth
- **P1 FIXED:** `1 person` pluralization (was "1 people")
- **P1 FIXED:** Scoreboard chip → `cooking 6` word-first (was "4 drafts / 2 cooking")
- **P1 FIXED:** RSVP buttons now theme-specific (`sand szn 🏖️` for beach-trip, `island time 🌴` for tropical)
- **P1 FIXED:** Going label → `who's coming 👇` (was "1 going 👇")
- **P1 FIXED:** Eyebrow lowercase → `★ Andrew Shipman is calling` (was ALL CAPS)
- **P1 FIXED:** Hero countdown uses sensory theme copy (`84 days until toes in`)
- **P1 FIXED:** Buzz compose avatar shows `A` (was "?")
- **P1 FIXED:** Crew filter chips now have dark backgrounds with white text (was low contrast)
- **P2 FIXED:** Auth sent state → `check your inbox` / `we just sent the door.`
- **P2 FIXED:** Footer → `made with rally!` with pink bang
- **P2 FIXED:** Sketch cards have countdown stamps (`?` / `soon`)

---

## Remaining Findings

### P1 — Marquee text renders ALL CAPS

**Surface:** Trip page (all themes)
**Spec says:** Brand brief: "lowercase by default." Theme content system lists marquee items in lowercase (e.g., "toes in", "beers on the beach").
**Live shows:** Marquee items render visually uppercase: "TOES IN", "BEERS ON THE BEACH". DOM text is correct (lowercase), but CSS applies `text-transform: uppercase` on `.marquee-track span` elements.
**Fix:** Remove `text-transform: uppercase` from the marquee item CSS rule in `globals.css`. Search for the rule targeting marquee spans/items and delete the `text-transform` property.

---

### P1 — Dashboard sell-state stamp text wrong

**Surface:** Dashboard
**Spec says:** §5.2 sell-normal stamp sub = `to lock`. Lock/Go stamp sub = `days`.
**Live shows:** Sell-state cards (Cape Cod, Tortola) show stamp `83 days out` / `224 days out`. The sub text is "days out" — not in the lexicon vocabulary for any phase.
**Fix:** Update the stamp sub template in the dashboard copy surface or data layer. For sell-state: change `days out` → `to lock`. For lock/go state: change to `days`.

---

### P2 — No rally meter on sell-state dashboard cards

**Surface:** Dashboard
**Spec says:** §5.2: sell-state cards show rally meter with `{n} / {target} ride or dies` progress bar.
**Live shows:** No rally meter visible on sell-state cards (Cape Cod, Tortola). `meterCount: 0` in DOM.
**Fix:** The CSS classes `.dash-meter` and `.dash-meter-fill` likely exist in `globals.css` (added in 3B). The JSX in `src/app/page.tsx` may not render the meter component for sell-state cards, or the RSVP count data isn't being passed. Wire the meter component for cards where phase is "sell."

---

### P2 — Dashboard "cooking" chip uses `.hot` accent variant

**Surface:** Dashboard
**Spec says:** §5.2: only `your move {n}` chip uses `.hot` (accent, pulses). `cooking {n}` is "neutral."
**Live shows:** The `cooking 6` chip has CSS class `dash-chip hot` — orange background, which is the `.hot` variant.
**Fix:** Remove the `hot` class from the "cooking" chip. Only add `hot` to the "your move" chip.

---

### P2 — Auth resend state has duplicate text

**Surface:** Auth (sent → resend state after cooldown expires)
**Spec says:** Lexicon §5.1 expired button = `resend`.
**Live shows:** After cooldown, the UI shows `didn't get it? send another` as both a `<span>` label AND a `<button>` — rendering as duplicate text: "didn't get it? send another didn't get it? send another"
**Fix:** Either: (a) make the `<span>` say "didn't get it?" and the `<button>` say "send another", or (b) remove the `<span>` entirely and keep only the button.

---

### P2 — Aspen,CO card: title and meta both show destination

**Surface:** Dashboard
**Spec says:** Card shows trip name as title, destination in meta line.
**Live shows:** Trip with no name shows "Aspen,CO" as bold title AND "Aspen,CO · apr 23–27 · 1 person" in meta — destination appears twice.
**Fix:** When trip name is empty, still use destination as title fallback but suppress destination from the meta line to avoid duplication. Or show a placeholder title like "untitled trip."

---

### P2 — Some text uses hardcoded white instead of CSS variables

**Surface:** Trip page (inside `[data-theme]` container)
**Spec says:** Theme content system §0: all text inside `[data-theme]` must use `var(--ink)` / `var(--on-surface)` / `var(--accent)` — never hardcoded white.
**Live shows:** Several elements (crew names, vote buttons, avatar initials) use `rgb(255, 255, 255)` instead of `var(--on-surface)`. Currently renders correctly on beach-trip's dark surface, but would break on light-themed surfaces.
**Fix:** Audit elements inside `.chassis[data-theme]` on the trip page. Replace hardcoded `color: #fff` / `color: white` with `color: var(--on-surface)`.

---

## Summary Table

| # | Sev | Surface | Issue | Status |
|---|-----|---------|-------|--------|
| 1 | P1 | Trip page | Marquee items `text-transform: uppercase` | **OPEN** |
| 2 | P1 | Dashboard | Sell-state stamp sub says "days out" not "to lock" | **OPEN** |
| 3 | P2 | Dashboard | No rally meter on sell-state cards | **OPEN** |
| 4 | P2 | Dashboard | "cooking" chip uses `.hot` accent (should be neutral) | **OPEN** |
| 5 | P2 | Auth | Resend state has duplicate text | **OPEN** |
| 6 | P2 | Dashboard | Aspen,CO card: destination duplication in title + meta | **OPEN** |
| 7 | P2 | Trip page | Hardcoded white text inside `[data-theme]` container | **OPEN** |

**Total: 0 P0, 2 P1, 5 P2** — down from 1 P0, 9 P1, 6 P2 in the pre-Session-4 audit.

---

## Surfaces Not Audited

- **Invitee view (incognito):** Requires a separate browser session without auth cookies. Not tested.
- **Mobile viewports (360/375/390/414):** Browser resize didn't take effect (macOS minimum window constraint). Content renders responsively in a narrow column but exact breakpoint behavior not verified.
- **Error states:** Only HTML5 validation tested on auth. No custom error flows tested.
- **Write paths:** Compose (disabled), reactions (disabled), lock ceremony modal (not built) — all deferred to v0.1.
