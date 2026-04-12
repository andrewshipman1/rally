# /trip/[slug] — Full Page Wireframe (v0 draft)

**Date:** April 11, 2026
**Purpose:** Map every section of the trip page across all phases. This is the single
reference for what the organizer builds and what the crew sees.

**Key insight:** The trip page IS the builder. Same URL, same scroll, different states
per phase. The organizer never leaves `/trip/[slug]` to set up the trip.

---

## Phases

| Phase | Who sees it | What's happening |
|-------|-------------|------------------|
| **sketch** | Organizer only | Building the trip — filling in fields, adding modules |
| **sell** | Organizer + invitees | Recruiting crew — share link, RSVP, vote on lodging |
| **lock** | All crew | Trip is locked — no more voting, final details |
| **go** | All crew | Trip is happening — live countdown, activity feed |
| **done** | All crew | Trip is over — archive, memories |

---

## Top-to-Bottom Sections

### 1. Marquee Strip
Scrolling banner across top of page.

| Phase | Content |
|-------|---------|
| sketch | "tap to name · set the dates · invite the crew · send it ✏️" |
| sell+ | Trip facts: "feb 14–17 · park city · 5 going ★" |

**Status:** ✅ Built and working.

---

### 2. Header

| Element | sketch | sell | lock | go | done |
|---------|--------|------|------|----|------|
| **Live-row** | "draft · only you can see this" | "trip is live" | "locked in" | "it's go time" | "that was a time" |
| **Sticker** | "new rally ✨" | countdown badge ("57 days 💍") | same | same | "done ✈️" |
| **Wordmark** | rally! | rally! | rally! | rally! | rally! |
| **Eyebrow** | "★ you started this" | "★ [organizer] is calling" | same | same | same |
| **Title** | editable field (dashed border) | display only (solid) | display | display | display |
| **Tagline** | editable field (dashed border) | display only | display | display | display |
| **When (start)** | editable field (dashed, date picker) | display only | display | display | display |
| **When (end)** | editable field (dashed, date picker) | display only | display | display | display |
| **Where** | editable field (dashed) | display only | display | display | display |
| **RSVP by** | editable field (dashed, date picker) — commit_deadline | display only | display | display | hidden |

**Status:** ✅ Mostly built. Sketch fields exist. Need to split "when" into start/end and add RSVP-by field.

---

### 3. Countdown

| Phase | What it shows |
|-------|---------------|
| sketch | **Hidden** — nothing to count yet |
| sell | Primary: "X days to lock it in" → commit_deadline. Secondary: "X days until [theme label]" → date_start |
| lock | "X days until [theme label]" → date_start |
| go | "X days until [theme label]" → date_start (or "0 — let's go") |
| done | hidden or "0" |

**Status:** ✅ Built. Sell-phase dual countdown working. Sketch now hidden (was showing empty state).

---

### 4. Invite List (sketch) → Going Row (sell+)

In sketch phase, this is a real invite list using `trip_members` data. In sell+, it becomes the avatar row.

| Phase | Content |
|-------|---------|
| sketch | Invite list: organizer (not removable) + invited guests (name + email/phone + ✕ remove). Total count. "+" opens InviteModal. Invite emails NOT sent until sell. |
| sell (invitee, pre-login) | Avatar row: "5 already in" + avatars + empty "you?" slot |
| sell (crew, post-login) | Avatars of going members. Tap → passport drawer |
| lock+ | Same as sell post-login |

Account creation required: invitees must create an account (magic link) to view the trip and RSVP. No anonymous/guest path.

**Status:** 🔴 To build (Session 7C). Replaces the InviteRoster from 7B which was a plain name list — wrong approach.

---

### 5. Share / Invite Actions

| Phase | Content |
|-------|---------|
| sketch | InviteModal accessible via "+" in invite list above (share link + email invite) |
| sell+ (organizer) | "copy the invite link ✍️" + "drop it in the group chat — anyone with the link can join" |
| sell+ (crew) | "add to calendar" button |

**Status:** ✅ Built. ShareLinkButton + AddToCalendarButton + InviteModal exist.

---

### 6. Organizer Card

Shows who started the trip. Visible in all phases post-sketch.

| Phase | Content |
|-------|---------|
| sketch | hidden (you ARE the organizer, you know) |
| sell+ | Avatar + name + "started this" badge + contact icon (💬 or ✉️) |

**Status:** ✅ Built. Badge and icon fixes applied.

---

### 7. MODULE: Lodging — "the spot"

**This is the first module that needs builder vs. viewer states.**

| Phase | Organizer sees | Crew sees |
|-------|---------------|-----------|
| sketch | **Empty state:** "drop the first airbnb link. we'll pull the photos, price, everything." + paste input + manual entry fallback | n/a (not visible) |
| sell (no options) | Same empty state + "add an option" button | Empty module slot |
| sell (1 option) | Option card + "add another option" | Single option (no voting) |
| sell (2+ options) | Voting cards + "lock the winner" button | Voting cards + vote buttons |
| lock | Winner highlighted + losers faded | Same |
| go/done | Winner only (clean view) | Same |

**Builder inputs needed:**
- Paste URL field (scrapes OG data: image, title, price)
- Manual entry fallback (name, price/night, link, image upload?)
- "Add another option" button
- "Lock the winner" button (organizer only, after votes)

**Status:** 🟡 Partial. LodgingGallery (voting/display) exists. **No add/edit UI. No OG scraping.**

---

### 8. MODULE: Flights — "getting there"

| Phase | Organizer sees | Crew sees |
|-------|---------------|-----------|
| sketch | Empty state + "add a flight" line-item form | n/a |
| sell+ | Flight line items + "add a flight" | Flight line items (read-only?) |
| lock+ | Locked list | Same |

**Builder inputs needed:**
- Line item form: airline, route (from → to), price, per-person or shared flag
- Optional: link to booking

**Question for Andrew:** Can crew members add their own flights, or is this organizer-only?

**Status:** 🟡 Partial. FlightCard display exists. **No add/edit UI.**

---

### 9. MODULE: Transportation — "getting around"

| Phase | Organizer sees | Crew sees |
|-------|---------------|-----------|
| sketch | Empty state + "add transport" form | n/a |
| sell+ | Line items + "add" | Line items |

**Builder inputs needed:**
- Line item: type (car rental, gas, rideshare, parking), cost, per-person or shared flag
- Optional: pickup/dropoff, link

**Status:** 🟡 Partial. TransportCard display exists. **No add/edit UI.**

---

### 10. MODULE: Activities — "what we're doing"

| Phase | Organizer sees | Crew sees |
|-------|---------------|-----------|
| sketch | Empty state + "add an activity" | n/a |
| sell+ | Activity cards + "add" | Activity cards |

**Builder inputs needed:**
- Activity: name, date/time, place, cost, link
- Optional: RSVP/attendance toggle

**Question for Andrew:** Can crew suggest activities, or organizer-only?

**Status:** 🟡 Partial. ActivityCard display exists. **No add/edit UI.**

---

### 11. MODULE: Provisions — "food & drink"

In sketch, provisions is a single estimate field (~$) for all food/drink costs.
In sell+, the organizer can optionally break it down into restaurants and groceries
using the existing RestaurantCard and GroceriesCard components.

| Phase | Organizer sees | Crew sees |
|-------|---------------|-----------|
| sketch | Empty state + "~$ estimate" input | n/a |
| sell+ | Estimate shown, option to "break it down (restaurants, groceries…)" | Estimate or detailed breakdown |

**Builder inputs needed (sketch):**
- Single estimate amount field (~$)

**Builder inputs needed (sell+, optional):**
- Add restaurant: name, date, time, cost, reservation link
- Add grocery item: name, quantity, assignee
- These use existing RestaurantCard / GroceriesCard display components

**Status:** 🔴 Missing. RestaurantCard and GroceriesCard display exist for sell+. **Provisions estimate input is new.**

---

### 12. Cost Summary — "the damage"

Aggregates all modules with cost data into a per-person estimate.

| Phase | Content |
|-------|---------|
| sketch | Hidden (nothing to sum yet) |
| sell+ (has cost data) | Line items from lodging, flights, transport, activities. Total ÷ "in" crew count = per-person |
| sell+ (no cost data) | Hidden |

**Status:** ✅ Built. CostBreakdown component wired to lodging.

---

### 13. MODULE: Crew — "who's in"

| Phase | Content |
|-------|---------|
| sketch | Minimal (see going row above) |
| sell+ | Grouped list: in (🙌), holding (🧗), out (—). Host gets 👑. Summary strip: "8 in · 3 holding · 2 out" |

**Builder inputs:** None (crew manages itself via RSVP).

**Status:** ✅ Built. CrewSection with grouped rows exists.

---

### 14. MODULE: Buzz — "the feed"

| Phase | Content |
|-------|---------|
| sketch | Hidden (no one to talk to yet) |
| sell+ | Activity feed. System events (RSVPs, votes, locks) + user posts. Compose box at top. |

**Builder inputs:** Compose box (text input + send).

**Status:** 🟡 Partial. BuzzSection exists. **Compose box interaction incomplete.**

---

### 15. MODULE: Extras — "the nice-to-haves"

| Phase | Organizer sees | Crew sees |
|-------|---------------|-----------|
| sketch | "add something extra" button → chooser sheet | n/a |
| sell+ | Extra cards + "add" button | Extra cards (read-only except packing list) |

**Four types in v0:**
1. **Packing list** — collaborative checklist
2. **Playlist** — paste Spotify link → pulls art + title
3. **House rules** — organizer writes, crew reads
4. **Shared album** — paste Apple Photos / Google Photos link

**Builder inputs needed:**
- Chooser bottom sheet (pick type)
- Packing: add item input
- Playlist: paste URL field
- House rules: text area
- Album: paste URL field

**Status:** 🟡 Partial. ExtrasSections display exists. **No add/edit UI. No chooser sheet.**

---

### 16. Footer

Theme-specific tagline. Always present.

**Status:** ✅ Built. PoeticFooter exists.

---

### 17. Sticky Bar (bottom)

| Phase | Content |
|-------|---------|
| sketch (organizer) | [← back] [🎨 theme] [save draft] [publish →] — publish gated on name + date |
| sell (invitee, pre-login) | "see the plan →" (primary) + "can't make it" (secondary) |
| sell+ (crew, post-login) | 3-state RSVP: "i'm in" / "maybe" / "can't make it" |
| organizer (all phases) | "★ you started this" (no RSVP bar) |

**Status:** ✅ Built. StickyRsvpBarChassis exists.

---

## Builder Input Patterns (decided April 11)

Three shared input components, built in Session 7 scaffolding:

1. **`EstimateInput`** — single `~$` amount field. Used by: provisions.
2. **`LinkPasteInput`** — paste a URL + manual fallback. Used by: lodging.
3. **`LineItemAddInput`** — name + optional cost. Used by: flights, transport, activities.

Session 8 wires these into each module. One shared component with a `type` prop
for the line-item modules — not four separate implementations.

---

## Resolved Questions (April 11)

1. ~~Can crew members add flights/activities, or organizer-only in v0?~~ → Organizer-only in sketch. TBD for sell+.
2. ~~Groceries — collaborative checklist or organizer seeds it?~~ → Replaced by provisions estimate in sketch. Detail in sell+.
3. ~~Progressive reveal vs. all slots visible?~~ → All module slots visible in sketch with empty states.
4. ~~Inline forms or bottom sheets?~~ → Inline inputs for sketch. Bottom sheets for complex sell+ flows (lodging voting, etc.).
5. ~~Minimum viable builder?~~ → Session 7 = scaffolding (header, invite list, sticky bar, shared inputs). Session 8 = wire inputs into modules.
6. ~~Invite roster (plain names) vs real invite list?~~ → Real invite list using trip_members. InviteRoster from 7B was wrong approach — reverted in 7C.
7. ~~Account required for invitees?~~ → Yes. All invitees must create an account to view trip and RSVP. No anonymous/guest decline path.

## Open Questions

1. ~~Sell+ invite flow: does "publish" auto-send to roster names, or is it just "trip is now shareable"?~~ → Invite emails are gated until sell phase. POST /api/invite currently sends immediately — 7C needs to gate on trip phase.
2. Postcard image: upload only, or should we support a URL paste too?
3. Provisions → restaurants/groceries breakdown in sell+: automatic prompt, or organizer-triggered?
