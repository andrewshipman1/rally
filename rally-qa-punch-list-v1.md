# Rally v0 — UX Punch List

**Date:** April 10, 2026
**URL:** rally-gold.vercel.app
**Method:** Live browser walkthrough + HTML design file comparison + source code audit
**Reference files:** `rally-phase-3-dashboard.html` through `rally-phase-11-auth.html`

---

## How to read this

Each item is tagged with a severity and surface. "Design ref" points to the HTML phase file that specifies the intended behavior. "Dead end" means a user hits a wall with no path forward.

**Severity key:**
- **P0** — Broken flow / user cannot complete a core task
- **P1** — Major UX gap vs. design spec
- **P2** — Cosmetic / copy / polish issue

---

## P0 — Broken Flows & Dead Ends

### 1. Create trip → no path to builder
**Surface:** `/create`
**Design ref:** Phase 4 (trip builder / sketch state)
**What happens:** "Start a trip" from dashboard opens `/create` — a plain HTML form (trip name, destination, tagline, start/end date, commit deadline). After submission, the trip is created but there's no transition into the Phase 4 sketch-state builder experience. The user lands on a bare trip page with no guided onboarding.
**What should happen:** Per Phase 4, the builder should be an inline sketch experience with dashed fields, a marquee, a sticker, and a countdown card that builds itself as the user fills in details. The `/create` form is a developer scaffold, not the designed UX.

### 2. Sketch-state trip page is a dead end
**Surface:** `/trip/[slug]` (sketch/draft phase)
**Design ref:** Phase 4
**What happens:** On the Boys Trip draft page, the user sees editable fields (name, one-line, when, where) and a crew section with a "+" button. The "+" button does nothing. The "new rally" sticker in the top right does nothing. There is no "send it" or "go live" button to advance the trip from sketch → sell state. The marquee says "add the basics first" but there's no mechanism to progress.
**What should happen:** Phase 4 specifies a progression where filling in fields unlocks the ability to send invites and move to sell state. The builder needs a clear CTA to advance.

### 3. No invite/share flow
**Surface:** Trip page (all states)
**Design ref:** Phase 5 (invitee/preview), Phase 9 (crew)
**What happens:** There is no way to invite people to a trip. The "+" button on the crew section is non-functional. No share link, no email invite, no copy-link button exists in the UI.
**What should happen:** Per Phase 5, invitees receive a link and see a preview page with RSVP options. The organizer needs a way to generate and share that link. The crew page exists at `/trip/[slug]/crew` in the codebase but is not linked from the trip page UI.

### 4. No way to add lodging options or vote
**Surface:** Trip page (sell/lock state)
**Design ref:** Phase 8 (lodging voting)
**What happens:** The Tulum sell-state trip page has no lodging section visible. The code has a `LodgingGallery` component with voting UI, but it's not surfaced — there's no way for an organizer to add Airbnb/hotel links, and no way for crew to vote on them.
**What should happen:** Phase 8 specifies a lodging card with property images, vote tallies, voter names, and a lock button for the organizer. This is a core feature of the sell → lock flow.

### 5. No extras drawer accessible
**Surface:** Trip page
**Design ref:** Phase 7 (optional extras)
**What happens:** The trip page ends abruptly after the crew section. No extras (packing list, playlist, house rules, photo album) are visible or accessible. The code has `ExtrasSections` components but they don't render.
**What should happen:** Phase 7 specifies a drawer/section with toggleable extras that the organizer can enable. These are visible to all crew.

### 6. Buzz/activity feed unreachable
**Surface:** Trip page
**Design ref:** Phase 10 (activity feed)
**What happens:** The `/trip/[slug]/buzz` page exists in code but there is no link to it from the trip page. Users cannot access the activity feed.
**What should happen:** Phase 10 specifies a buzz section on the trip page showing reactions, RSVP notifications, and crew activity. It should be a tappable section or always-visible feed.

---

## P1 — Major UX Gaps

### 7. Dashboard scoreboard incomplete
**Surface:** Dashboard (`/`)
**Design ref:** Phase 3 (dashboard)
**What happens:** Only one chip shown: "cooking 8". The design specifies a multi-chip scoreboard: "your move {n}" (hot/pulsing), "cooking {n}", "locked {n}", "done {n}". The "your move" chip with its urgent pulsing animation is the key gamification beat and it's entirely missing.
**What should happen:** Full scoreboard row with state-specific chips. "Your move" cards should pulse with accent halo per Phase 3.

### 8. No marquee on dashboard
**Surface:** Dashboard
**Design ref:** Phase 3
**What happens:** No scrolling marquee strip at the top of the dashboard.
**What should happen:** Phase 3 specifies a marquee with trip-specific nudges: "your move on park city", "21 days to vino", etc. The marquee is part of the gamified game-board feel.

### 9. No "live row" status indicator on dashboard
**Surface:** Dashboard
**Design ref:** Phase 3
**What happens:** No "1 trip needs your move" status line with blinking dot above the header.
**What should happen:** Phase 3 specifies a live-row with a blinking accent dot and urgent-state text.

### 10. RSVP gives no feedback
**Surface:** Trip page (sell state)
**Design ref:** Phase 5 (invitee)
**What happens:** Clicking "i'm in" adds an avatar to the "who's coming" row silently. No confirmation animation, no toast, no state change on the button. The RSVP bar disappears but there's no celebration moment.
**What should happen:** The RSVP action should feel momentous — it's the core conversion event. Needs at minimum a confirmation state, ideally with animation (confetti, sticker pop, etc.).

### 11. Trip page missing theme picker
**Surface:** Trip page (sketch state)
**Design ref:** Phase 6 (theme picker)
**What happens:** No theme picker visible. The code has `ThemePickerSheet` and `ThemePickerTile` components but they aren't accessible from the trip page UI.
**What should happen:** Phase 6 specifies a theme picker sheet that lets the organizer choose a visual theme (beach, mountain, city, tropical, etc.) during the sketch phase.

### 12. Passport page not linked
**Surface:** Dashboard
**Design ref:** Phase 3.5 (passport)
**What happens:** The `/passport` page exists in code but there's no navigation to it from the dashboard. No profile icon, no tap target.
**What should happen:** Phase 3.5 specifies a passport page showing user stats, trip stamps, and ride-or-dies leaderboard. It should be accessible from the dashboard header.

### 13. Empty black bar on trip page
**Surface:** Trip page (sell state — Tulum)
**What happens:** Between the countdown cards and "who's coming" section, there's a mysterious empty black rectangle with no content. It appears to be a rendered but empty component.
**What should happen:** This element should either contain content or not render at all.

### 14. Countdown card says "days until liftoff" — not theme-specific
**Surface:** Trip page (Tulum)
**Design ref:** Theme content system
**What happens:** Countdown label is generic: "days until liftoff". The theme content system specifies sensory, theme-specific copy per trip type (e.g., "days until toes in" for beach, "days until first tracks" for ski).
**What should happen:** Countdown copy should pull from the theme content system based on the trip's assigned theme.

### 15. No end date on trip builder
**Surface:** `/trip/[slug]` (sketch state)
**Design ref:** Phase 4
**What happens:** The WHEN field shows only a start date (04/24/2026). No end date field visible. The `/create` form has both start and end date, but the inline builder only shows one.
**What should happen:** Both start and end dates should be editable inline, matching the date-range pattern from Phase 4.

---

## P2 — Cosmetic / Copy / Polish

### 16. Dashboard "cooking" chip uses accent style
**Surface:** Dashboard
**Design ref:** Phase 3
**What happens:** The "cooking 8" chip appears styled as a neutral chip but should only be the accent/hot style for "your move". (Carried over from prior QA — may still be using `.hot` class.)

### 17. Marquee text ALL CAPS on trip page
**Surface:** Trip page marquee
**Design ref:** Brand brief
**What happens:** Marquee items render uppercase via CSS `text-transform: uppercase`. Brand brief says "lowercase by default."
**What should happen:** Remove `text-transform: uppercase` from marquee CSS.

### 18. "1 days to lock it in" — pluralization bug
**Surface:** Trip page (Tulum countdown)
**What happens:** Shows "1 days to lock it in" — should be "1 day to lock it in".

### 19. Two duplicate "A" avatars after RSVP
**Surface:** Trip page (Tulum after clicking "i'm in")
**What happens:** After RSVPing as the organizer, the "who's coming" row shows two identical "A" avatars. The organizer was already counted, so the RSVP created a duplicate entry.
**What should happen:** The organizer should already be marked as "going" and shouldn't be able to double-RSVP themselves.

### 20. No footer on any page
**Surface:** All pages
**Design ref:** Multiple phases
**What happens:** No "made with rally!" footer anywhere.
**What should happen:** Per prior QA, footer should show "made with rally!" with the pink bang.

### 21. "Add to Calendar" button barely visible
**Surface:** Trip page
**What happens:** The calendar button text is very low contrast — nearly invisible against the light background. Appears to be using a muted/disabled style.

### 22. Title truncation on dashboard cards
**Surface:** Dashboard
**What happens:** "Dempsey's 30 birthda..." is truncated by the stamp overlay. The stamp covers the end of long titles.
**What should happen:** Card titles should have right padding to clear the stamp, per Phase 3 CSS: `padding-right: 70px`.

### 23. Huge white gap above trip page content
**Surface:** Trip page (Boys Trip sketch state)
**What happens:** Scrolling from the top of the page, there's a massive white/empty area above the dark trip content. The page doesn't feel like it starts at the top.
**What should happen:** Trip page content should begin immediately below the marquee/header with no dead space.

---

## Summary Table

| # | Sev | Surface | Issue |
|---|-----|---------|-------|
| 1 | P0 | /create | Create trip form is a scaffold, not the designed builder |
| 2 | P0 | Trip (sketch) | Sketch page is a dead end — no way to advance to sell |
| 3 | P0 | Trip (all) | No invite/share flow — can't add people to trips |
| 4 | P0 | Trip (sell/lock) | No lodging options or voting mechanism |
| 5 | P0 | Trip (all) | Extras drawer not accessible |
| 6 | P0 | Trip (all) | Buzz/activity feed unreachable |
| 7 | P1 | Dashboard | Scoreboard only shows "cooking" — missing your move/locked/done chips |
| 8 | P1 | Dashboard | No marquee strip |
| 9 | P1 | Dashboard | No live-row status with blinking dot |
| 10 | P1 | Trip (sell) | RSVP gives zero feedback |
| 11 | P1 | Trip (sketch) | Theme picker not accessible |
| 12 | P1 | Dashboard | Passport page not linked |
| 13 | P1 | Trip (sell) | Empty black bar renders between sections |
| 14 | P1 | Trip (sell) | Countdown copy is generic, not theme-specific |
| 15 | P1 | Trip (sketch) | No end date field in builder |
| 16 | P2 | Dashboard | "cooking" chip may still use hot/accent style |
| 17 | P2 | Trip page | Marquee text uppercase (should be lowercase) |
| 18 | P2 | Trip (sell) | "1 days" pluralization bug |
| 19 | P2 | Trip (sell) | Organizer can double-RSVP themselves |
| 20 | P2 | All | No footer |
| 21 | P2 | Trip (sell) | "Add to Calendar" button nearly invisible |
| 22 | P2 | Dashboard | Long titles truncated by stamp overlay |
| 23 | P2 | Trip (sketch) | Huge white gap above trip content |

**Totals: 6 P0, 9 P1, 8 P2**

---

## Features Specified in HTML Designs But Not Implemented or Accessible

| Feature | Design Phase | Code Exists? | Accessible in UI? |
|---------|-------------|-------------|-------------------|
| Gamified sketch builder | Phase 4 | Partial | No — `/create` is a plain form |
| Invitee preview + RSVP | Phase 5 | Partial | No invite flow exists |
| Theme picker | Phase 6 | Yes (components) | No — not linked from UI |
| Extras drawer | Phase 7 | Yes (components) | No — not rendered on trip page |
| Lodging voting | Phase 8 | Yes (components) | No — not rendered/populatable |
| Crew page | Phase 9 | Yes (page route) | No — not linked from trip page |
| Activity/buzz feed | Phase 10 | Yes (page route) | No — not linked from trip page |
| Passport | Phase 3.5 | Yes (page route) | No — not linked from dashboard |
| Dashboard scoreboard | Phase 3 | Partial | Only "cooking" chip renders |
| Dashboard marquee | Phase 3 | No | No |
| Share/invite link | Phase 5 | share_slug in DB | No UI to generate or copy link |
