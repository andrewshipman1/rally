# Rally v0 — Fix Plan

**Date:** April 10, 2026
**Context:** QA audit found 45 issues. Most features are built but not wired together. The core architectural problem: the app has 9+ routes when it should have 3 screens (auth, dashboard, trip page). This plan re-wires what exists rather than rebuilding from scratch.

---

## Why the drift happened (and how to prevent it)

Each Claude Code session got a scope doc with features to build, but lacked three things:

1. **A hard constraint on page count.** Sessions created new routes (`/create`, `/trip/[slug]/crew`, `/trip/[slug]/buzz`) when the spec says everything lives on the trip page. Without "DO NOT create new routes" as a rule, each session optimized locally.

2. **Acceptance criteria that test wiring, not just existence.** "Build the crew section" got interpreted as "create a crew page" — which technically works but breaks the single-scroll trip page contract. ACs need to say "crew section renders inline on `/trip/[slug]` below the going row, with no separate route."

3. **A QA checkpoint between sessions.** Sessions 1–4 stacked features without verifying the end-to-end flow. A 10-minute Cowork QA between each session would have caught "wait, there's no link to crew" before session 3 piled more on top.

### New process for remaining sessions

```
For each session:

1. COWORK (you + Claude): Write session brief with:
   - Exact scope (what to wire/fix)
   - Hard constraints ("DO NOT create new routes")
   - Acceptance criteria (testable from the browser)
   - Files to read first (specific HTML phases + this plan)

2. CLAUDE CODE: Execute the brief
   - Must read AGENTS.md + session brief before writing code
   - Must run the app and verify ACs before declaring done

3. COWORK (you + Claude): QA the session output
   - Click through every AC in the browser
   - Update this plan with what's done and what drifted
   - Write next session brief
```

---

## The three screens (hard constraint for all sessions)

```
/auth          → magic link login (Phase 11) — WORKING, minor polish
/              → dashboard (Phase 3) — PARTIALLY WORKING, needs scoreboard/marquee
/trip/[slug]   → the trip page (Phases 2,4,5,6,7,8,9,10) — ONE scroll, ALL sections inline
```

**Rules that apply to EVERY session:**
- DO NOT create new page routes
- DO NOT create separate pages for sub-features (crew, buzz, extras, etc.)
- The trip page is ONE long scroll: marquee → header → builder fields OR hero → countdown → lodging → cost → crew → buzz → extras → RSVP bar
- Every interactive element must have a visible result (no dead-end buttons)
- All user-facing strings come from `lib/copy.ts`, never hardcoded in JSX
- All colors inside `[data-theme]` use CSS variables, never hardcoded

---

## Session plan

### Session 5: "Unblock the core flow"

**Goal:** A user can create a trip, get a share link, and an invitee can open it and RSVP. This is the minimum viable loop.

**Scope:**
1. Kill the `/create` route. "Start a trip" from dashboard creates a new trip in the DB (with sensible defaults) and redirects to `/trip/[new-slug]` in sketch state. The trip page IS the builder.
2. Wire the sketch-state trip page fields so they save on edit (name, tagline, when, where). The fields already render — they just need to persist changes.
3. Add the "send it" CTA to the sketch-state trip page. Gates: name ≥3 chars + at least one date. CTA text: disabled = "add the basics first", ready = "send it to the group 🚀". Clicking it transitions the trip to sell state.
4. Add a share link UI. After "send it" (or anytime on a sell+ trip): show a "copy the invite link" button. Uses the existing `share_slug` from DB. Toast: "link copied. drop it in the chat."
5. Fix the "+" button on crew section — it should open an email input to invite someone (or at minimum, work as a trigger for the share link).
6. Prevent organizer from seeing RSVP buttons on their own trip. Show "you started this" instead.

**Hard constraints:**
- DO NOT create a `/create` page or route
- DO NOT create any new routes
- DO NOT change the trip page layout structure — just wire existing components

**Acceptance criteria (test in browser):**
- [ ] "Start a trip" from dashboard → lands on `/trip/[new-slug]` in sketch mode (dark theme, dashed fields)
- [ ] Editing the name field saves (refresh → still there)
- [ ] Setting a date makes the countdown card show a real number (not "??")
- [ ] With name + date filled, CTA changes from "add the basics first" to "send it to the group 🚀"
- [ ] Clicking "send it" transitions trip to sell state (page re-renders with sell layout)
- [ ] "Copy invite link" button appears on sell-state trips, copies URL to clipboard
- [ ] Opening that link in incognito → shows trip page with RSVP bar (auth gate is fine)
- [ ] On your own trip, you see "you started this" — NOT "i'm in / hold my seat / can't make it"

**Files to read first:**
- `rally-fix-plan-v0.md` (this file)
- `rally-phase-4-builder.html` (sketch state design)
- `rally-phase-5-invitee.html` (invitee flow)
- `rally-microcopy-lexicon-v0.md` (all copy strings)

---

### Session 6: "Wire the trip page sections"

**Goal:** All designed sections render on the trip page in the correct order. Everything that was built as a separate page gets collapsed back into sections.

**Scope:**
1. Inline the crew section on the trip page (remove or redirect `/trip/[slug]/crew`). Render it below "who's coming" as a grouped list: in / holding / out. Show names, avatars, status badges, host marker (👑).
2. Inline the buzz/activity section on the trip page (remove or redirect `/trip/[slug]/buzz`). Render compose area + feed below crew. Compose placeholder: themed per trip.
3. Render the lodging section ("the spot") on sell+ trips. If no lodging options added, show empty state: "drop the first airbnb link. we'll pull the photos, price, everything."
4. Render the extras section on the trip page. If no extras, show "nothing here yet. add the first thing." with add button.
5. Fix the empty black bar (mystery component) — either populate it or remove it.
6. Add the trip page footer: "rally is a doorway, not an app. close it and go pack."
7. Ensure section order matches spec: marquee → header/hero → countdown → lodging → cost (placeholder OK) → crew → buzz → extras → footer. RSVP bar stays sticky at bottom.

**Hard constraints:**
- DO NOT create new components — use existing `LodgingGallery`, `ExtrasSections`, crew/buzz components
- DO NOT create sub-navigation or tabs — sections are just stacked vertically
- If a section has no data, show its empty state (not hidden)

**Acceptance criteria:**
- [ ] Trip page scrolls through all sections in one continuous flow
- [ ] Crew section shows grouped avatars with names and status
- [ ] Buzz section shows compose input + any existing posts
- [ ] Lodging section visible (empty state is fine if no listings added)
- [ ] Extras section visible (empty state is fine)
- [ ] No mysterious empty black bar
- [ ] Footer text renders at bottom
- [ ] `/trip/[slug]/crew` redirects to `/trip/[slug]#crew` (or just 404s)
- [ ] `/trip/[slug]/buzz` redirects to `/trip/[slug]#buzz` (or just 404s)

**Files to read first:**
- `rally-fix-plan-v0.md`
- `rally-phase-9-crew.html` (crew design)
- `rally-phase-10-activity.html` (buzz design)
- `rally-phase-7-extras.html` (extras design)
- `rally-phase-8-lodging-voting.html` (lodging design)

---

### Session 7: "Dashboard gamification + RSVP feedback"

**Goal:** Dashboard feels like a game board. RSVP moment feels like a celebration.

**Scope:**
1. Add full scoreboard chips: "your move {n}" (hot, pulsing), "cooking {n}", "locked {n}", "done {n}". Only show chips with count > 0.
2. Add the live-row: "{n} trip needs your move" with blinking dot. Fallback: "all caught up".
3. Add dashboard marquee strip with trip-specific text (use existing trip data to generate phrases).
4. Add RSVP confirmation feedback: confetti animation on "i'm in", toast messages ("you're on the list." / "seat's yours." / "next one."), state persistence for returning visitors.
5. Add "the archive" section for done trips with faded cards.
6. Fix title truncation — add right padding on card titles to clear stamps.

**Hard constraints:**
- Dashboard is still just `/` — no new routes
- Scoreboard chips must use lexicon strings exactly
- "Your move" chip gets `.hot` class, nothing else does

**Acceptance criteria:**
- [ ] Scoreboard shows multiple chips when trips exist in different states
- [ ] "Your move" chip pulses with accent color
- [ ] Live-row shows with blinking dot when action needed
- [ ] Marquee scrolls with trip-specific text
- [ ] Clicking "i'm in" on any trip → confetti burst + "you're on the list." toast
- [ ] Returning to a trip where you already RSVP'd → shows "you're in. {n} days out."
- [ ] Long trip titles don't get cut off by stamps
- [ ] Done/past trips appear in "the archive" section

**Files to read first:**
- `rally-fix-plan-v0.md`
- `rally-phase-3-dashboard.html`
- `rally-microcopy-lexicon-v0.md` (toast strings, chip strings)

---

### Session 8: "Theme picker + animations + copy audit"

**Goal:** Theme picker works, entrance animations exist, all copy matches the lexicon.

**Scope:**
1. Wire the theme picker sheet — trigger from sketch-state trip page (e.g., "pick a vibe" button or section). Uses existing `ThemePickerSheet`/`ThemePickerTile` components. Selecting a theme live-reskins the trip page. "Lock the vibe →" commits.
2. Add entrance animations: slide-up-bounce on page sections with staggered delays, pop-in on stickers/stamps, pop-avatar cascade on crew avatars, pulse-shadow on countdown and CTA.
3. Add theme-specific countdown copy from theme content system (e.g., "days until toes in" for beach, "days until first chair" for ski).
4. Add theme-specific RSVP button copy (emoji per theme).
5. Full copy audit: replace all hardcoded strings with `lib/copy.ts` imports. Fix: "Commit deadline" → "decide by", title case labels → lowercase, any banned words.
6. Fix `text-transform: uppercase` on marquee items.
7. Replace any hardcoded `#fff` / `white` inside `[data-theme]` with `var(--on-surface)`.

**Hard constraints:**
- Theme picker is a bottom sheet on the trip page, NOT a separate route
- No new routes
- Every string change must reference the lexicon or theme content system

**Acceptance criteria:**
- [ ] Theme picker opens as bottom sheet from sketch-state trip page
- [ ] Tapping a theme tile re-skins the trip page preview in real-time
- [ ] "Lock the vibe" commits and shows toast
- [ ] Trip page sections animate in on scroll (not all visible at once)
- [ ] Stickers pop in with rotation animation
- [ ] Countdown shows theme-specific label (not generic "liftoff")
- [ ] RSVP buttons show theme emoji
- [ ] Marquee text is lowercase
- [ ] No hardcoded white text inside themed containers
- [ ] All form labels are lowercase
- [ ] "decide by" not "commit deadline"

**Files to read first:**
- `rally-fix-plan-v0.md`
- `rally-phase-6-theme-picker.html`
- `rally-phase-2-theme-system.html` (animation specs)
- `rally-theme-content-system.md`
- `rally-microcopy-lexicon-v0.md`
- `rally-brand-brief-v0.md` (voice rules, banned words)

---

### Session 9: "Lock flow + remaining polish"

**Goal:** Organizer can lock a trip. Remaining polish items from QA.

**Scope:**
1. Build the lock flow: organizer sees "time to call it" prompt when cutoff approaches, "lock it in" button, cost confirmation screen, lock success celebration.
2. Add cutoff deadline display on trip page: "decide by {date} · {n} days left".
3. Add urgency banners based on proximity to cutoff.
4. Fix auth resend duplicate text.
5. Fix "1 days" pluralization.
6. Add passport navigation from dashboard (profile icon/link).
7. Add hero postcard/collage to trip page header (even if just a gradient or theme-colored block for now).
8. Fix "Add to Calendar" button contrast.
9. Fix "..." menu on organizer card (either make it work or remove it).
10. Remove the white gap above sketch-state trip content.

**Hard constraints:**
- Lock flow is a modal/sheet on the trip page, NOT a separate route
- All strings from lexicon

**Acceptance criteria:**
- [ ] Organizer sees lock CTA on sell-state trip with cutoff date set
- [ ] Clicking "lock it in" → confirmation → success celebration
- [ ] Locked trip shows "locked in" state with updated copy
- [ ] Cutoff date visible on sell-state trips
- [ ] "1 day" not "1 days"
- [ ] Auth resend shows single line, not duplicate
- [ ] Passport accessible from dashboard
- [ ] Trip page header has visual treatment (not just text on flat bg)
- [ ] No white gap above sketch trip content

---

## Between-session QA checklist

After every Claude Code session, run this in Cowork before starting the next:

```
□ Can I create a trip from the dashboard?
□ Can I edit the trip name and see it save?
□ Can I get a share link?
□ Does the share link work in incognito?
□ Can an invitee RSVP?
□ Does the RSVP show feedback?
□ Does the trip page scroll through ALL sections?
□ Are there any dead-end buttons (click → nothing happens)?
□ Are there any empty/mystery elements rendering?
□ Do all strings match the lexicon? (spot check 5 strings)
□ Does the dashboard reflect trip state changes?
```

If any of these fail, fix them BEFORE starting the next session. Drift compounds.

---

## What NOT to build in v0

These are explicitly deferred. If Claude Code starts building any of these, the session has drifted:

- Push notifications
- Payment tracking / Venmo integration
- Custom questions from organizer
- Threaded replies in buzz
- @mentions
- Media uploads in buzz
- Map view
- Native expense logging
- Receipt photo capture
- Apple Wallet pass
- Multi-currency
- Sticker marketplace
- Custom sticker upload
- Parallax scroll effects
- Social login (Google, Apple)
- Co-host / admin roles
