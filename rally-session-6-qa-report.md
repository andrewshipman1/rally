# Rally — Session 6 QA Report

**Date:** April 10, 2026
**Surface:** Dashboard (`/`)
**Tested on:** localhost:3000
**Tester:** Andrew + Claude (Cowork)

---

## AC Results (Re-test after card height fix)

| # | AC | Result | Notes |
|---|-----|--------|-------|
| 1 | Scoreboard shows chips matching trip states | ⚠️ PARTIAL | "cooking 10" renders. Only one trip state in test data so only one chip shows — correct behavior. Multi-state display unverified. |
| 2 | "your move" chip pulses | ⚠️ CANNOT TEST | No trips in "your move" state. Logic appears correct (only shows counts > 0). |
| 3 | Live-row shows with blinking dot | ✅ PASS | "ALL CAUGHT UP ✨" renders — correct fallback when no trips need action. |
| 4 | Marquee scrolls with trip text | ✅ PASS | "11 days to Aspen,CO ★ Andrews Birthday is brewing ★ 82 days to Cape Cod ★ 223 days to Tortola, BVI" |
| 5 | Long trip titles don't get cut off by stamps | ❌ FAIL | Stamps are off-screen (see responsive bug below). Can't evaluate title/stamp overlap when stamps aren't visible. |
| 6 | Done trips appear in archive section | ❌ FAIL | No archive section. No "the archive" header. No done/past trip separation. Only "what you're cooking" section exists. |
| 7 | Passport reachable from dashboard | ✅ PASS | "A" avatar in header, links to /passport. |

---

## Bugs Found

### P0: Cards wider than viewport — stamps and actions clipped

Cards render at ~564px width regardless of viewport. At mobile widths (375px), the right ~190px of every card is off-screen. This clips:
- **Stamps** (countdown stickers) — positioned `right: 12px` from card edge, fully off-screen
- **Rally meter** — bar extends past right edge
- **"tap in →"** action text — positioned at card right, off-screen

**Root cause:** `.dash-card` has no `max-width: 100%` or `overflow` containment. Cards need to respect their container width.

**Fix:** Add `max-width: 100%` or `width: 100%` to `.dash-card`, and ensure card padding + stamp positioning works within a constrained width.

### P1: No archive section

The dashboard only has one section ("what you're cooking"). The spec calls for a separate "the archive" section below active trips, showing done/past trips with faded styling (`.faded` class, reduced opacity).

**Fix:** Filter trips by lifecycle state. Trips with `done` status render under "the archive" section header with the `.faded` card variant.

### P1: Card height fix confirmed ✅

Previous `min-height: 727px` bug is resolved. Cards now auto-size to content (127-164px depending on whether rally meter is present). Container gap is 12px — correct.

---

## Responsive Observation (Andrew's question)

The dashboard does NOT adapt to the viewport width. At 375px (iPhone) or 500px, cards overflow horizontally. This isn't just a polish issue — it makes stamps invisible and actions unreachable on any mobile device.

The Phase 3 design spec shows a 360px phone frame with cards fitting perfectly inside. The current implementation doesn't constrain cards to their container.

**Recommendation:** This should be a P0 fix alongside the archive section before moving to Session 7. The dashboard needs to work on mobile — that's where most users will see it.

---

## Summary

| Status | Count |
|--------|-------|
| ✅ Pass | 3 (live-row, marquee, passport) |
| ⚠️ Partial | 2 (scoreboard — insufficient test data) |
| ❌ Fail | 2 (stamps/truncation, archive) |
| Bugs found | 2 (P0 responsive overflow, P1 no archive) |

**Before Session 7, fix:**
1. Card responsive width — `max-width: 100%` so cards fit viewport and stamps are visible
2. Archive section — separate done trips with "the archive" header and faded cards
