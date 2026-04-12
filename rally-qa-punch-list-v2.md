# Rally v0 — Comprehensive QA Punch List (v2)

**Date:** April 10, 2026
**URL:** rally-gold.vercel.app
**Method:** Live browser walkthrough, HTML design file deep-read (phases 1–11), PRD v4, microcopy lexicon, theme content system, brand brief, source code audit
**Auditor:** Claude (Cowork)

---

## How to read this

This document is organized into three tiers:

1. **Architectural / Flow Gaps** — the app's page structure and navigation are wrong
2. **Feature Gaps** — designed features that are missing or inaccessible
3. **Granular UX / Copy / Visual Polish** — pixel-level and string-level issues

Each item references the spec source (PRD section, HTML phase file, lexicon, brand brief).

**Severity key:**
- **P0** — Broken flow, user hits dead end, or core feature completely missing
- **P1** — Major UX gap vs. spec (feature exists in code but isn't wired, or key interaction missing)
- **P2** — Copy, animation, visual polish, or minor behavioral issue

---

## Part 1: Architectural / Flow Gaps

The app should be **three screens** (per your direction): auth, dashboard (list of trips), and trip page (draft or live). The current build over-fragmented into separate routes that create dead ends and break the single-page trip experience.

### A1 · P0 — App has too many disconnected pages

**What the spec says:** The app is auth → dashboard → trip page. The trip page is a single scrollable surface that contains everything: the pitch, the countdown, lodging, extras, buzz, crew. It's one URL you drop in the group chat.
**What's built:** The app has `/`, `/create`, `/trip/[slug]`, `/trip/[slug]/crew`, `/trip/[slug]/buzz`, `/passport`, `/auth`, `/auth/setup`, `/auth/expired`, `/auth/invalid` — 9+ routes. Crew and buzz are separate pages instead of sections on the trip page.
**Impact:** The whole premise of Rally is "the link is the pitch" — one URL, one scroll, everything answered. Separate `/crew` and `/buzz` pages break this. Nobody will navigate to them because there are no links to them anyway.
**Fix:** Collapse `/trip/[slug]/crew` and `/trip/[slug]/buzz` back into sections on the main trip page. The trip page should be one long scroll: hero → countdown → lodging → cost → crew → buzz → extras → RSVP. No sub-navigation needed.

### A2 · P0 — `/create` is a plain HTML form, not the designed builder

**Design ref:** Phase 4 (trip builder / sketch state)
**What's built:** `/create` is a standard form: text inputs for name, destination, tagline, date pickers for start/end/deadline, and a "Create trip →" submit button. No theming, no personality, no gamification.
**What should exist:** Phase 4 specifies an inline sketch experience ON the trip page itself — dashed fields with the Shrikhand/Caveat type stack, a marquee scaffolding strip ("tap to name · set the dates · invite the crew · send it"), a "??" countdown card that fills in as you set dates, and a CTA that upgrades from "add the basics first" → "send it to the group 🚀" as fields are completed.
**Impact:** The create flow is the first thing an organizer does. It sets the tone for the entire product. A plain form screams "admin tool," not "the friend who's been to Lisbon."
**Fix:** The `/create` route should either redirect to a new trip page in sketch/draft state, or the form should be rebuilt to match the Phase 4 builder experience. The builder IS the trip page in draft mode — they shouldn't be different pages.

### A3 · P0 — Sketch-state trip page is a dead end (can't advance to sell)

**Design ref:** Phase 4, PRD §5.4–5.8
**What happens:** On the Boys Trip draft page, there's an "add the basics first" prompt and a "+" button for crew that does nothing. The "new rally" sticker does nothing. There is no "send it" CTA to advance from sketch → sell.
**What should happen:** PRD specifies gates: name ≥3 chars + at least one date + at least one invitee → CTA upgrades to "send it to the group 🚀". Clicking it transitions the trip to sell state and generates the share link.
**Impact:** You literally cannot launch a trip. The entire flow from "I have an idea" to "my friends can see this" is broken.

### A4 · P0 — No invite/share flow exists

**Design ref:** Phase 5 (invitee), PRD §5.9, lexicon §5.1
**What happens:** There is no UI to generate a share link, copy a link, or invite people by email. The "+" on the crew section is non-functional.
**What should happen:** PRD: organizer shares trip page link to group chat. The confirmation screen after creating/sending should show "here's your link. drop it in the chat." with a "copy the link" button. Toast: "link copied. go forth." The share_slug exists in the DB but there's no UI surface to use it.

### A5 · P0 — "The spot" (lodging) section doesn't render on trip page

**Design ref:** Phase 8 (lodging voting), PRD §5.5
**What happens:** The Tulum sell-state trip page has no lodging section. The code has `LodgingGallery` with voting but it doesn't appear. There's no way for an organizer to add Airbnb/hotel links.
**What should happen:** PRD specifies: "the spot" section with property cards (OG-scraped images, listing title, price/night, highlight chips), voting UI (tap to vote, tally, voter avatars), and organizer lock button. Empty state: "drop the first airbnb link. we'll pull the photos, price, everything."
**Impact:** Lodging is the #1 decision driver for group trips. Without it, Rally can't do its core job.

### A6 · P0 — Buzz/activity feed is a separate page and not linked

**Design ref:** Phase 10 (activity), PRD §5.6
**Your direction:** Buzz should be an inline section on the trip page, not a separate `/buzz` page. The trip page should be a simple infinite scroll.
**What should happen:** The buzz section belongs on the trip page as a scrollable feed section below crew. Compose area with themed placeholder ("what's the word?"), day dividers, post bubbles, event rows, reactions. All inline.

### A7 · P1 — Crew section is a separate page and not linked

**Design ref:** Phase 9 (crew)
**Your direction:** Same as buzz — crew belongs on the trip page, not at `/trip/[slug]/crew`.
**What should happen:** Crew section on the trip page shows avatars grouped by status (in/holding/out), with host marker (👑), +1 sub-text, and RSVP timestamps. Section header: "the crew", sub: "{n} rallied · {trip_name}".

### A8 · P1 — Passport page exists but has no navigation to it

**Design ref:** Phase 3.5 (passport)
**What happens:** `/passport` renders in code but there's no link from the dashboard header.
**What should happen:** Per Phase 3.5, accessible from the dashboard — shows profile (display name, tagline, join date), stat strip (trips / ride or dies / countries), passport grid with themed stamp cards, and ride-or-dies leaderboard.

---

## Part 2: Feature Gaps

### F1 · P0 — No theme picker accessible

**Design ref:** Phase 6 (theme picker), PRD §5.5
**What's built:** `ThemePickerSheet` and `ThemePickerTile` components exist in code.
**What's missing:** No UI trigger to open the theme picker. It should be a bottom sheet that slides up from the trip page (sketch state), showing 17 theme tiles organized by category (occasion/setting/default), with live preview of the trip page re-skinning as you tap tiles. CTA: "lock the vibe →". Toast: "vibe locked. {theme.name} it is."

### F2 · P0 — No extras drawer accessible

**Design ref:** Phase 7 (optional extras), PRD §5.6
**What's built:** `ExtrasSections` components exist in code.
**What's missing:** No way to access extras (packing list, playlist, house rules, shared album). Should appear as a section on the trip page with add/toggle capability for organizer. Empty state: "nothing here yet. add the first thing."

### F3 · P1 — RSVP gives zero feedback

**Design ref:** PRD §5.5, lexicon §5.1
**What happens:** Clicking "i'm in" silently adds an avatar. No animation, no toast, no confirmation state, no confetti.
**What should happen:** PRD specifies: confetti burst animation, bouncing emoji, confirmation message, immediate "Share to Story 📸" CTA. Toast: "you're on the list." The RSVP moment is THE core conversion event and it feels like nothing.

### F4 · P1 — Organizer can RSVP to their own trip (creates duplicate)

**What happens:** Clicking "i'm in" on Tulum (where you're the organizer) adds a second "A" avatar. You shouldn't be able to RSVP to your own trip — you're automatically "in."
**Fix:** Organizer should see "you started this" state, not the RSVP bar. The RSVP bar should only show for invitees.

### F5 · P1 — No RSVP state persistence (returning visitor)

**Design ref:** PRD §5.5, lexicon §5.1
**What should happen:** If user returns after RSVPing, show state-specific message: "you're in. {n} days out." (in), "you've got a seat on hold until {cutoff}." (holding), "you said no. miss us yet? change your mind." (out).

### F6 · P1 — No cutoff deadline system

**Design ref:** PRD §5.7
**What's missing:** No visible cutoff date on trip page, no urgency banners ("one week to lock this in", "72h. who's coming?", "today's the day"), no auto-flip from holding → out at deadline.

### F7 · P1 — No lock flow for organizer

**Design ref:** PRD §5.7, lexicon §5.1
**What's missing:** No "time to call it" screen, no "lock it in" button, no cost confirmation ("here's the damage · ${n}/person all in"), no lock success celebration ("locked. {n} ride or dies. {n} days. let's go.").

### F8 · P1 — No per-person cost display

**Design ref:** PRD §5.5
**What's missing:** No cost breakdown section on trip page. PRD specifies: large animated count-up total, visual proportion bars by category, "~${n} per person, before flights" label, "flights not included. obviously." sublabel.

### F9 · P1 — No date poll

**Design ref:** PRD §5.5
**What's missing:** No date polling UI for trips with multiple potential date ranges. Should show tappable options with vote counts and stacked avatar indicators.

### F10 · P2 — No "Add to Calendar" deeplink working properly

**What happens:** The button exists but text is nearly invisible (very low contrast). Needs to be styled with theme-appropriate contrast.

---

## Part 3: Granular UX / Copy / Visual Polish

### Dashboard Issues

**D1 · P1 — Scoreboard only shows "cooking" chip**
Design ref: Phase 3
Spec says: multi-chip scoreboard → "your move {n}" (hot, pulses), "cooking {n}", "locked {n}", "done {n}". "Your move" is the key gamification beat. Currently only "cooking 8" renders.

**D2 · P1 — No marquee on dashboard**
Design ref: Phase 3
Spec says: scrolling marquee strip with trip-specific nudges ("your move on park city", "21 days to vino", etc.). 22s linear infinite animation, var(--sticker-bg) text on var(--surface) background. Not present.

**D3 · P1 — No live-row status indicator**
Design ref: Phase 3
Spec says: "{n} trip needs your move" with blinking accent dot (blink-dot 1.4s ease-in-out infinite). Falls back to "all caught up" when no action needed. Not present.

**D4 · P2 — Long titles truncated by stamp overlay**
"Dempsey's 30 birthda..." is cut off by the stamp. Phase 3 CSS specifies `.card-title { padding-right: 70px }` to clear the stamp.

**D5 · P2 — Greeting copy is generic**
Live shows: "hey Andrew Shipman 👋". Lexicon specifies "where to next? ✈️" as the H1 for returning users (which is present), but the greeting line isn't in the lexicon. Minor polish.

**D6 · P2 — No "the archive" section for done trips**
Design ref: Phase 3
Spec says: past trips section header "the archive" with done-state cards (faded, "✓" stamp, "re-live it →" action). Dashboard currently only shows active trips.

### Trip Page Issues

**T1 · P1 — Empty black bar renders between countdown and "who's coming"**
On Tulum trip page, a mystery empty black rectangle (appears to be an empty component) sits between the countdown cards and the crew section. Should either have content or not render.

**T2 · P1 — Countdown copy is generic, not theme-specific**
Design ref: Theme content system
Shows: "days until liftoff". Should show theme-specific sensory copy per the theme content system (e.g., "days until toes in" for beach, "days until first chair" for ski, "days until 4am bodega slices" for city).

**T3 · P1 — No hero collage/postcard**
Design ref: Phase 2, PRD §5.5
Spec says: trip page should open with a full-bleed visual header (edge-to-edge cover image or collage grid). Currently just text on a flat background. The PRD says "hero is a postcard, not a header."

**T4 · P2 — "1 days to lock it in" — pluralization bug**
Should be "1 day to lock it in".

**T5 · P2 — Marquee text ALL CAPS**
Brand brief: "lowercase by default." Marquee items render uppercase via CSS `text-transform: uppercase`. DOM text is lowercase but CSS overrides it.

**T6 · P2 — No footer**
Spec says trip page footer: "rally is a doorway, not an app. close it and go pack." All other pages: "made with rally!" Neither present.

**T7 · P2 — Huge white gap above trip page content (sketch state)**
On Boys Trip, massive white space above the dark trip content when scrolling. Content should begin immediately below the marquee.

**T8 · P2 — Organizer card "..." menu does nothing**
The ellipsis button on the organizer card has no visible action or menu.

**T9 · P2 — "who's coming" should show names and status badges**
Design ref: Phase 5, PRD
Currently just shows avatar initials. Spec says each row should show name + status badge ("I'm in! ✈️" / "Maybe 🤔" / "Waiting...") and animate in on scroll.

### Auth Issues

**AU1 · P2 — Auth resend state has duplicate text**
From prior QA (still open): after cooldown, UI shows "didn't get it? send another" as both a `<span>` and a `<button>`, rendering duplicate text.

### Animation / Motion Issues

**M1 · P1 — No entrance animations on trip page sections**
Design ref: Phase 2, PRD
Spec says: sections animate in on scroll with staggered fade-ups (slide-up-bounce 0.7s with incremental delays). Creates sense of reveal. Currently everything renders static.

**M2 · P1 — No pop-in animations on stickers/stamps**
Design ref: Phase 2
Stickers should pop-in (0% opacity 0 scale 0.6 rotate -12deg → 65% scale 1.08 → 100% scale 1 rotate 0) with staggered delays. Currently static.

**M3 · P1 — No avatar cascade animation**
Design ref: Phase 2
Avatars in "who's coming" should pop-avatar (scale 0 → 1.18 → 1) with nth-child stagger (+0.08s per avatar). Currently static.

**M4 · P2 — No marquee scroll animation on trip page**
Design ref: Phase 2
Marquee should scroll via CSS animation (marquee-scroll 18s linear infinite). The marquee exists on trip page but check if it actually animates.

**M5 · P2 — No pulse-shadow on countdown/CTA**
Design ref: Phase 2
Countdown card and main CTA button should have pulse-shadow (3s ease-in-out infinite, 1.2s delay) — box-shadow grows/shrinks between 5px and 7px.

### Copy / Microcopy Issues

**C1 · P1 — Multiple strings don't match lexicon**
Need to audit ALL user-facing strings against lexicon §5.1–5.24. Key ones to verify:
- Auth button: should be "let me in" (not "log in" or "sign in")
- Auth tagline: should be "how friend groups get to 'let's go'"
- Empty dashboard H1: "the daydream starts here"
- Empty dashboard body: "every trip starts as a vague 'we should.' rally turns it into a date on the calendar."
- Sell-state card meta: should use lexicon patterns ("5 yes's · 6 days to lock it · {note}")
- Error messages: "oh no. something broke" not generic 500 text

**C2 · P2 — "Commit deadline" label on create form**
Lexicon calls it "decide by" not "commit deadline." The create form uses developer language.

**C3 · P2 — Labels use title case instead of lowercase**
Brand brief rule #1: "Lowercase by default." The create form uses "Trip name", "Destination", "Tagline", "Start date", "End date", "Commit deadline" — all title case. Should be lowercase.

**C4 · P2 — Banned words in UI**
Brand brief "never say" list includes: "trip planner", "attendee", "confirm attendance", "itinerary", "organizer" (in user-facing copy), "submit", "loading", "TBD" (use "tbd"). Need full audit for violations.

### Theme System Issues

**TH1 · P1 — Hardcoded white text inside themed containers**
From prior QA (still open): several elements use `#fff` instead of `var(--on-surface)`. Would break on light-themed surfaces.

**TH2 · P2 — Theme-specific RSVP button copy not implemented**
Design ref: Theme content system
RSVP "i'm in" button should include theme emoji: "i'm in 💅" (bachelorette), "i'm in 🌴" (tropical), "i'm in ⛷️" (ski). Currently generic.

**TH3 · P2 — Theme-specific sticker copy not implemented**
Design ref: Theme content system
Eyebrow sticker should be theme-specific: "new bach ✨" (bachelorette), "new beach 🏖️" (beach), etc. FOMO flags on countdown should vary by theme.

---

## Summary Table

| # | Sev | Category | Issue |
|---|-----|----------|-------|
| A1 | P0 | Architecture | Too many disconnected pages — crew/buzz should be trip page sections |
| A2 | P0 | Architecture | /create is a plain form, not the Phase 4 builder |
| A3 | P0 | Architecture | Sketch trip page is dead end — can't advance to sell |
| A4 | P0 | Architecture | No invite/share flow — can't get link to friends |
| A5 | P0 | Architecture | "The spot" (lodging) section doesn't render |
| A6 | P0 | Architecture | Buzz feed is wrong page and not linked |
| A7 | P1 | Architecture | Crew section is wrong page and not linked |
| A8 | P1 | Architecture | Passport has no navigation |
| F1 | P0 | Feature | Theme picker not accessible |
| F2 | P0 | Feature | Extras drawer not accessible |
| F3 | P1 | Feature | RSVP gives zero feedback (no confetti, no toast) |
| F4 | P1 | Feature | Organizer can double-RSVP themselves |
| F5 | P1 | Feature | No RSVP state persistence for returning visitors |
| F6 | P1 | Feature | No cutoff deadline system |
| F7 | P1 | Feature | No lock flow for organizer |
| F8 | P1 | Feature | No per-person cost display |
| F9 | P1 | Feature | No date poll |
| F10 | P2 | Feature | Add to Calendar button nearly invisible |
| D1 | P1 | Dashboard | Scoreboard only shows "cooking" chip |
| D2 | P1 | Dashboard | No marquee |
| D3 | P1 | Dashboard | No live-row status indicator |
| D4 | P2 | Dashboard | Title truncation from stamp overlap |
| D5 | P2 | Dashboard | Greeting copy not in lexicon |
| D6 | P2 | Dashboard | No "the archive" section for done trips |
| T1 | P1 | Trip page | Empty black bar between sections |
| T2 | P1 | Trip page | Countdown copy generic, not theme-specific |
| T3 | P1 | Trip page | No hero collage/postcard |
| T4 | P2 | Trip page | "1 days" pluralization bug |
| T5 | P2 | Trip page | Marquee text uppercase (should be lowercase) |
| T6 | P2 | Trip page | No footer |
| T7 | P2 | Trip page | Huge white gap above content (sketch state) |
| T8 | P2 | Trip page | "..." menu does nothing |
| T9 | P2 | Trip page | "who's coming" missing names and badges |
| AU1 | P2 | Auth | Resend state duplicate text |
| M1 | P1 | Animation | No entrance animations on trip page |
| M2 | P1 | Animation | No pop-in on stickers/stamps |
| M3 | P1 | Animation | No avatar cascade animation |
| M4 | P2 | Animation | No marquee scroll animation |
| M5 | P2 | Animation | No pulse-shadow on countdown/CTA |
| C1 | P1 | Copy | Multiple strings don't match lexicon |
| C2 | P2 | Copy | "Commit deadline" should be "decide by" |
| C3 | P2 | Copy | Labels title case, should be lowercase |
| C4 | P2 | Copy | Banned words audit needed |
| TH1 | P1 | Theme | Hardcoded white text in themed containers |
| TH2 | P2 | Theme | RSVP buttons not theme-specific |
| TH3 | P2 | Theme | Sticker/FOMO copy not theme-specific |

**Totals: 8 P0, 19 P1, 18 P2 — 45 items**

---

## Designed Features: Status Matrix

| Feature | Design Phase | Code Exists? | Renders in UI? | Accessible? | Notes |
|---------|-------------|-------------|----------------|-------------|-------|
| Auth (magic link) | Phase 11 | Yes | Yes | Yes | Minor copy issues |
| Dashboard (game board) | Phase 3 | Partial | Partial | Yes | Missing scoreboard, marquee, live-row |
| Trip builder (sketch) | Phase 4 | Partial | Partial | Yes | Plain form instead of gamified builder |
| Invitee preview | Phase 5 | Partial | Partial | No | No share flow to get invitees there |
| Theme picker | Phase 6 | Yes (components) | No | No | No UI trigger |
| Extras drawer | Phase 7 | Yes (components) | No | No | Not rendered |
| Lodging voting | Phase 8 | Yes (components) | No | No | Not rendered, no add flow |
| Crew list | Phase 9 | Yes (page) | Yes | No | Separate page, no link to it |
| Activity/buzz | Phase 10 | Yes (page) | Yes | No | Separate page, no link to it |
| Passport | Phase 3.5 | Yes (page) | Yes | No | No navigation from dashboard |
| RSVP system | PRD §5.5 | Yes | Yes | Yes | No feedback, no state persistence |
| Lock flow | PRD §5.7 | No | No | No | Not built |
| Cost display | PRD §5.5 | No | No | No | Not built |
| Date poll | PRD §5.5 | Partial | No | No | Not built |
| Cutoff/deadline | PRD §5.7 | Partial | No | No | Not built |
| Nudge system | PRD §5.8 | No | No | No | Not built |
| Share link | PRD §5.9 | Partial (DB) | No | No | share_slug in DB, no UI |

---

## Recommended Fix Priority

**Phase 1 (Unblock core flow):**
1. Collapse crew + buzz into trip page sections (A1, A6, A7)
2. Replace /create with sketch-state trip page builder (A2)
3. Add sketch → sell transition with "send it" CTA (A3)
4. Add share link generation + copy button (A4)
5. Render lodging section on trip page (A5)

**Phase 2 (Core features):**
6. Wire theme picker trigger from trip page (F1)
7. Wire extras sections on trip page (F2)
8. Add RSVP feedback (confetti, toast, state persistence) (F3, F5)
9. Fix organizer self-RSVP bug (F4)
10. Build lock flow (F7)

**Phase 3 (Polish to spec):**
11. Dashboard scoreboard, marquee, live-row (D1–D3)
12. Entrance animations (M1–M3)
13. Copy audit against lexicon (C1–C4)
14. Theme-specific copy (T2, TH2, TH3)
15. Hero postcard/collage (T3)
