# Rally — Migration Scope v0
**Claude Code handoff brief: rewire the live app to the new design system.**

Status: draft · Author: design pass · Date: 2026-04-07

---

## 0. Framing

The live app at `rally-gold.vercel.app` was built PRD→code with no design layer. The visual and interaction design in this repo's HTML specs (Phases 1–5) is the destination. **Every pixel rewires.** This doc is not a ground-up rebuild — it's a transplant: our chassis, typography, lexicon, and state machine go in; the live app's feature inventory tells us what surfaces we're missing and need to design before handoff.

Two things this doc is:
1. A **gap triage** — for every feature that exists in dev but not in our designs, the call is fold / design new / cut.
2. A **surface map** — the canonical list of surfaces Claude Code should build, each tied to an existing HTML spec or flagged as "spec needed."

What this doc is **not**: a component-level implementation plan. Claude Code owns that. Design owns the source of truth for visuals, copy, and state.

---

## 1. Canonical surfaces (the whole app)

| # | Surface | Spec file | State |
|---|---|---|---|
| 1 | Dashboard (logged-in home) | `rally-phase-3-dashboard.html` | ✅ designed |
| 2 | Profile / passport | `rally-phase-3-5-passport.html` | ✅ designed |
| 3 | Trip page — builder state (Sketch) | `rally-phase-4-builder.html` | ✅ designed |
| 4 | Trip page — live state (Sell / Lock / Go / Done) | `rally-phase-2-theme-system.html` | ✅ designed |
| 5 | Trip page — invitee pre-login state | `rally-phase-5-invitee.html` | ✅ designed |
| 6 | Theme picker (inside builder) | `rally-phase-6-theme-picker.html` | ✅ designed |
| 7 | Extras drawer (packing/playlist/rules/album) | `rally-phase-7-extras.html` | ✅ designed |
| 8 | Lodging voting (options mode) | `rally-phase-8-lodging-voting.html` | ✅ designed |
| 9 | Trip page — crew subsurface | `rally-phase-9-crew.html` | ✅ designed |
| 10 | Trip page — buzz / activity feed subsurface | `rally-phase-10-activity.html` | ✅ designed |
| 11 | Auth flow (sign-in / magic link) | — | 🟡 lightweight, unspecced — see §9 |
| 12 | Lexicon (all strings) | `rally-microcopy-lexicon-v0.md` | ✅ synced (thru §5.23) |
| 13 | Theme content system (17 themes, palette + strings) | `rally-theme-content-system.md` | ✅ designed |
| 14 | Brand chassis (dual-mode kernel, type, motion) | `rally-brand-brief-v0.md` + phases 1 / 1.5 / 2 | ✅ locked |

Everything else in the current app is either a naming mismatch or scaffolding that gets replaced wholesale.

---

## 2. Gap triage

Every gap is a feature in the live app that wasn't accounted for in our designs. The call is:
- **Fold** — maps to something we already designed, just needs renaming or a small add.
- **Design new** — a real hole; needs a spec before handoff.
- **Cut** — not valuable enough for v0, defer.

### Fold into existing surfaces

**G1. Phase selector** — live app lets you set a phase. Maps 1:1 to our lifecycle: Sketch → Sell → Lock → Go → Done. Action: rename in code, reuse our state machine. No design work.

**G2. Commit Deadline field** — same thing as our cutoff date. Action: adopt our field, our copy ("when are we calling it?"), our validation rules (optional in Sketch, required to Lock). See lexicon §5.19.

**G3. RSVP emoji presets (Default/Party/Beach/Hype/Chill)** — the live app lets organizers pick emoji sets for yes/no/maybe. Our three-state system (in/holding/out, 🙌/🧗/—) replaces this. Action: cut the preset picker, ship the three-state directly. Too much config for too little payoff.

**G4. Share link / copy link button** — invitee flow entry point. Action: add an explicit "copy link ↗" affordance to the live-row on the builder and sell-state trip page. Reuses the live-row slot we already designed. Add string to lexicon §5.16 and §5.17.

**G5. "Trip Dad" organizer label** — fold into the organizer chip on the trip page. Lowercase it: "trip dad". Keep the joke. It's already vibe-aligned.

**G6. Per-category cost progress bars** — already implied by our cost section. Action: Claude Code can build the bars using our existing cost card; no new spec needed. Use `--stroke` for track, `--on-surface` for fill.

**G7. "Made with Rally" footer** — ship on every trip page. One line, Caveat, bottom-centered, subtle. Viral hook at near-zero cost. Add to lexicon §5.16/§5.17 as a global footer string.

### Design new state / new component

**G8. Theme picker (11 themes → full chassis variants)** — the live app has 11 themes as gradient swatches only. Our chassis treats each theme as a full variant: surface, stroke, accent, sticker tone, typography accent color, maybe subtle motion variant. Needs:
- A picker surface inside builder (probably a bottom drawer on the trip page in Sketch phase)
- 11 theme definitions as chassis tokens (not gradients)
- A preview-in-place interaction (tap theme → trip page re-skins live)

Deliverable: new HTML spec `rally-phase-6-theme-picker.html`.

**G9. Per-line-item cost split mode** — each itinerary line item needs a toggle: "split shared" vs "book yours". This affects the cost calculation and the guest UI (do they owe a share, or do they book their own?). Needs:
- A control on each itinerary line item
- Copy in lexicon §5.10-ish
- Spec for the two modes in the cost section (how the number rolls up)

Deliverable: add to lexicon + extend the trip page spec with the line item variant.

**G10. Optional extras (packing list, playlist, house rules, shared album)** — new "extras drawer" below itinerary. Each extra is a card; user adds from a chooser when they want it. Not required. Needs:
- Chooser UX ("+ add something extra")
- Four card types with distinct copy and empty states
- Placement rule: below itinerary, above cost
- **Shared album is a LINK field, not a real album.** One URL input ("paste your shared album link"), a tap-to-open card that launches Apple Photos / Google Photos / whatever. Rally does not host images.

Deliverable: new HTML spec `rally-phase-7-extras.html` with all four cards.

**G11. Voting on lodging options (the biggest gap)** — the live app lets the organizer add 2+ lodging options and the crew votes. This is a real product mechanic, not a nice-to-have. **Lodging-only for v0** — not a generic line item variant. Needs:
- Lodging line item can have 2+ options; each is votable
- Vote tally UI (lowercase, on-brand, not a bar chart)
- Resolution mechanic: organizer locks the winner, losing options **stay visible, crossed out / greyed**, so the crew can see what was on the table
- Copy: "which one are we doing?", "{n} votes", "{name} locked it in 🗝️"

Deliverable: `rally-phase-8-lodging-voting.html` ✅ shipped. Smart-link images included on every option (see §5.4).

**G12. Itinerary header images** — small addition. Optional cover image on any line item. No separate spec; add to line item anatomy in the trip page spec. Image-less is the default.

**G13. Crew subsurface** — the live app has a "view all →" for the guest list. Needs a dedicated page. Full-state of the trip page at `/trip/{slug}/crew`. Reuses chassis. Three sections: in / holding / out. Lexicon already has the chip copy.

Deliverable: new HTML spec `rally-phase-9-crew.html`.

**G14. Activity feed with comments** — the live app has a feed. Needs a subsurface or bottom drawer on the trip page. Spec the empty state copy in lexicon (it's on-brand in the live app, keep the spirit).

Deliverable: new HTML spec `rally-phase-10-activity.html`.

### Cut / defer

**G15. Effect tab placeholder** — the live app reserves a slot for animation config. Cut for v0. Animation kernel lives in the chassis; no user-facing config surface.

**G16. 6-category itinerary lock (Lodging / Flight / Transport / Restaurant / Activity / Groceries)** — the live app locks the user into six categories. Don't port the lock. Categories become optional **tags** on line items, not required slots. The rigidity is the bug. Our line item is generic: title, when, where, cost, optional tag, optional image.

---

## 3. Surface-by-surface rewire notes

Claude Code should treat each surface as a wholesale replacement of the live app's equivalent. These are the "gotchas" per surface.

### 3.1 Dashboard
- Live app has a basic list of trips. Our Phase 3 spec is the replacement.
- Scoreboard chips at top (in / holding / past). Lexicon §5.2.
- Trip cards use chassis, theme accent from trip.
- "+ new rally" button → routes to builder state (Phase 4).

### 3.2 Profile / passport
- Live app has no real profile. Our Phase 3.5 spec is net-new.
- Stamps, stat strip, ride-or-dies leaderboard. All from lexicon §5.15.

### 3.3 Trip page — builder state
- This is `/trip/{slug}` in **Sketch** phase, not a separate route.
- Dashed placeholders, blinking caret, disabled sticky CTA until gates pass.
- Gates: name + dates (min) to un-disable "send it". Cutoff optional here, required to move to Lock.
- Theme picker (G8) accessed from a subtle "change vibe" link in the live-row.

### 3.4 Trip page — live states
- Phase 2 spec is the destination for Sell / Lock / Go / Done states.
- State transitions drive subtle chassis shifts (sticker label, live-row copy, CTA).
- Cost card, itinerary, crew row, activity preview — all live here.

### 3.5 Trip page — invitee pre-login
- Phase 5 spec. Login-gate, not RSVP-gate.
- Primary CTA: "see the plan →" (not "i'm in").
- RSVP three-state happens on the full page after login.
- Nudge automation sequence specced in lexicon §5.18.

### 3.6 Crew subsurface (spec needed)
- Full-page state at `/trip/{slug}/crew`.
- Three sections: in / holding / out, each with chip counts.
- Each crew member: avatar, name, state, optional note ("driving up Friday").
- Reuses chassis. No new tokens.

### 3.7 Activity feed (spec needed)
- Either a subsurface at `/trip/{slug}/buzz` or a bottom drawer on the trip page. Call: **subsurface**, because comments need space.
- Empty state copy: keep the live app's spirit, route through lexicon.
- Posts: crew member + avatar + text + timestamp + optional reaction.

### 3.8 Theme picker (spec needed)
- Bottom drawer on trip page in Sketch phase.
- 11 swatches (chassis previews, not gradients).
- Tap to preview, hold/confirm to apply.
- Live-row copy while picking: "try on a vibe".

### 3.9 Lodging voting (spec needed)
- **Lodging-only for v0.** Not a generic line item variant.
- Organizer adds 2+ lodging options to the lodging card.
- Each option renders as a mini-card, each with vote count.
- Vote copy: "i want this one 🗳️" / "{n} votes".
- Lock mechanic: organizer picks winner, losing options stay visible, crossed out / greyed.
- Future: generic options mode for restaurants/activities is a v0.1 consideration.

### 3.10 Optional extras drawer (spec needed)
- Lives between itinerary and cost on the trip page.
- Chooser row: "+ add something extra" → sheet with 4 options.
- Each card has its own empty state and add flow.
- Packing list = checklist. Playlist = Spotify link or text list. House rules = text. Shared album = **link field** to Apple Photos / Google Photos — Rally does not host images.

### 3.11 Auth flow (lightweight spec)
- No magic-link UI exists yet. Keep it dead simple.
- One screen: email field → "send me a link". Success state: "check your email".
- Chassis, Caveat heading ("welcome in"), no logo fanfare.
- Post-link-click → trip page in logged-in state.

---

## 4. Lexicon deltas

Lexicon is synced. Sections added in this pass:

- **§5.20** — lodging voting strings (for G11) ✅
- **§5.21** — extras drawer strings (for G10) ✅
- **§5.22** — crew subsurface strings (for G13) ✅
- **§5.23** — buzz / activity feed strings (for G14) ✅
- **§6 theme microcopy library** — expanded from 11 themes to 17 in `rally-theme-content-system.md`. Each theme now carries a full string pack (stickers, marquee, hints, RSVP flavor, nudges, CTAs), not just a palette.

Still open:
- **§5.16** add `share_link.copy` → "copy the invite link ↗" (G4)
- **§5.16** add `footer.made_with` → "made with rally" (G7)
- **§5.17** add `share_link.copy` (parity) (G4)
- **Theme picker strings** — currently inline in the phase 6 spec, not yet promoted to a lexicon section
- **Auth flow strings** — deferred with the auth spec itself (see §9)

---

## 5. Build order for Claude Code

Recommended sequence so Claude Code isn't blocked:

1. **Chassis + design tokens** — port the dual-mode kernel, typography, motion primitives from the phase HTML specs. This unblocks everything.
2. **Dashboard** (Phase 3) — simplest surface, good chassis test.
3. **Trip page — live states** (Phase 2) — the hero surface. Gets voting and extras as empty slots initially.
4. **Trip page — builder state** (Phase 4) — reuses most of live state.
5. **Trip page — invitee pre-login** (Phase 5) — reuses live state with gate layer.
6. **Profile / passport** (Phase 3.5).
7. **Crew subsurface** (G13) — spec arrives before this step.
8. **Activity feed** (G14) — spec arrives before this step.
9. **Theme picker** (G8) — spec arrives before this step.
10. **Voting mechanic** (G11) — spec arrives before this step. Highest risk, allocate time.
11. **Extras drawer** (G10) — spec arrives before this step.
12. **Auth flow** (G11/lightweight) — can happen in parallel any time after chassis.

All design specs for steps 1–11 are shipped. Step 12 (auth) is the only remaining blocked design work — lightweight, non-critical-path, can ship any time. See §9 for the dangling items checklist.

---

## 5.4 Smart-link images (cross-cutting)

Rally already has a smart-link system that pulls hero images from pasted URLs — Airbnbs, flights, activities, restaurants. **Every itinerary line item, every lodging voting option, and any place a user pastes a link must render the pulled image as part of the card.** This is not a nice-to-have; images are a primary part of the appeal. People commit to a trip faster when they see the place.

Rules for all surfaces:
- 16:9 aspect ratio, full-bleed top of the card, chassis stroke below.
- Source-domain pill bottom-left of the image (e.g. "airbnb.com", "delta.com"). Tiny trust signal.
- Fallback: if fetch fails, render a colored chassis panel with a Caveat label of the domain. Never show a broken-image icon.
- **The image IS the link.** Tap anywhere on the image → opens the original listing URL in the system browser. Affordances: source-domain pill with ↗ arrow, "see it →" Caveat pill. Entire image is the hit target. Option title is also tappable and routes to the same URL. No in-app browser for v0.
- State modifiers: loser/past-tense items grayscale + darken; winner/active items stay full-color.

Surfaces that already need to be updated to account for this:
- Trip page — live states (Phase 2) — every itinerary card should have the image slot
- Lodging voting (Phase 8) — each option has the image ✅ already spec'd
- Extras drawer (Phase 7, pending) — shared album link and playlist link pull their preview images
- Crew subsurface (Phase 9, pending) — not applicable
- Activity feed (Phase 10, pending) — comments that paste links get the treatment

This gets a dedicated Claude Code note: **the smart-link image component is a shared primitive**, not a per-surface one-off. Build once, reuse everywhere.

**Per-category treatment:**
- **Lodging** (Airbnb, Vrbo, Booking): hero image of the listing. Primary case. Fully spec'd in Phase 8.
- **Flights** (Google Flights, airline sites): whatever the smart-link pulls — often a route card or airline hero image. Fallback: chassis panel with airline name in Caveat + route ("sfo → slc") in DM Sans.
- **Activities** (Viator, AllTrails, Resy for dinners): hero image. Same treatment as lodging.
- **Restaurants** (Resy, OpenTable, Google Maps): restaurant hero. Same treatment.
- **Transport** (rental cars, transfers): often no good image source. Default to chassis panel with vendor name + vehicle type in Caveat.

**Phase 2 update needed:** the existing `rally-phase-2-theme-system.html` spec does not show the image slot on itinerary cards. Claude Code should add it per this §5.4 when building Phase 2 surfaces. Design will not update the Phase 2 file retroactively — this note is the source of truth.

## 5.5 Routing map

Canonical URLs Claude Code should wire:

- `/` — dashboard (logged-in home)
- `/signin` — auth flow (magic link)
- `/me` — profile / passport
- `/new` — shortcut that creates a draft trip and redirects to `/trip/{slug}` in Sketch phase
- `/trip/{slug}` — trip page (phase determines state: Sketch / Sell / Lock / Go / Done)
- `/trip/{slug}/crew` — crew subsurface
- `/trip/{slug}/buzz` — activity feed subsurface
- Invitee pre-login lands on `/trip/{slug}` with an `?invite={token}` param that triggers the login gate state

No other routes for v0.

## 5.6 Platform

Mobile-first. The HTML specs are designed for ~390px viewports. Desktop is a scaled-up mobile view centered in a column — not a separate layout. No tablet-specific work.

## 6. Explicit non-goals for v0

Naming these so scope doesn't creep:

- No in-app messaging beyond the activity feed comments.
- No payments / collection / Venmo integration. Cost card is informational only.
- No calendar export. Later.
- No itinerary map view. Later.
- No AI trip-plan generation. Later.
- No analytics instrumentation beyond basic pageviews. Event taxonomy is a v0.1 concern.
- No effects/animation config surface (G15 cut).
- No required itinerary categories (G16 cut — categories are optional tags).

---

## 7. Decisions (locked)

1. **Voting resolution** — losing options stay visible, crossed out / greyed. Crew can see what was on the table. Locked winner gets the 🗝️ treatment.
2. **Extras scope** — all four in v0: packing list, playlist, house rules, shared album. **Shared album is a link field, not a hosted gallery** — user pastes an Apple Photos / Google Photos URL, card taps open externally. Rally does not host images. All four extras are cheap once the drawer pattern exists.
3. **Theme count** — **17 themes at v0**, expanded from 11. Canonical list and full string packs live in `rally-theme-content-system.md`. Theme is treated as a content system (palette + ~20 strings per theme), not just color skins.
4. **Crew subsurface scope** — read-only in v0. Anyone on the trip can view. No nudges, kicks, role changes, or co-host promotion. Defer all organizer-tool affordances to v0.1.
5. **Buzz feed scope** — mixed feed (system events + short chat posts) with reactions on every row. No threading, no @mentions, no media, no read receipts. iMessage is still where the real back-and-forth lives.
6. **Auth flow** — magic link only in v0. 15-min expiry, single-use, 30-day session, 30s resend cooldown, 5/hour rate limit. Spec: `rally-phase-11-auth.html`. Lexicon: §5.24. **Backend provider still open — Andrew to confirm.**
7. **RSVP chips LOCKED GLOBAL** — 🙌 / 🧗 / — are the three-state chip icons across all themes. Do not override per theme. Only the viewer-side button CTA text (e.g. "pour me in 🍷") is themeable. See lexicon §5.10.
8. **Wordmark LOCKED** — Shrikhand `rally!`, lowercase, bang in accent color. See brand brief "The wordmark — LOCKED v0" section.
9. **Sticker kit LOCKED** — emoji-only for v0 with uniform sticker treatment (pill, rotate, drop-shadow). No custom illustrations. See brand brief "The sticker kit — emoji-only v0".
10. **G9 cost-split mode DEFERRED** — v0 ships "split shared" as the sole mode. Per-line-item toggle moves to v0.1. No further design work on G9.

---

## 8. Handoff artifacts checklist

- [x] `rally-phase-6-theme-picker.html` (G8)
- [x] `rally-phase-7-extras.html` (G10)
- [x] `rally-phase-8-lodging-voting.html` (G11) — was filename-drifted as `options-voting`, corrected
- [x] `rally-phase-9-crew.html` (G13)
- [x] `rally-phase-10-activity.html` (G14)
- [x] `rally-theme-content-system.md` — 17 themes with full string packs (new, not on original list)
- [x] Lexicon §5.20–§5.26 additions (lodging, extras, theme variables, theme picker, auth, crew, buzz)
- [x] Smart-link image cross-cutting spec (§5.4)
- [x] Decisions locked in §7
- [x] `rally-phase-11-auth.html` — magic-link flow, 4 states
- [x] Lexicon §5.24 auth strings
- [x] Brand brief: Shrikhand wordmark locked, emoji sticker kit locked
- [x] RSVP chip global lock in lexicon §5.10 + theme content doc scrubbed
- [x] Share-link / footer strings in §5.4, §5.16, §5.17
- [ ] **Andrew to confirm auth backend provider** (Supabase / Clerk / custom) — does not block design handoff
- [ ] Phase 2 update: add itinerary-card image slot per §5.4 (Claude Code can do this inline, no retroactive spec update)
- [x] G9 per-line-item cost split mode — DEFERRED to v0.1 (see §7.10)

---

## 9. Dangling items (what's still open at handoff)

**→ Claude Code: when you revisit the PRD, promote every `TODO(prd):` marker below into a tracked item in the PRD. These are known gaps that design is handing off as open.**

Three things sit outside the shipped design package. None block the critical path, but they need to live in the PRD so they don't get lost.

**Quick TODO index (greppable) — remaining open items:**

- `TODO(prd): auth-backend-confirm` — **Andrew owes a decision.** Provider choice (Supabase / Clerk / Resend-only custom / other). Spec in `rally-phase-11-auth.html` is provider-agnostic so this doesn't block implementation start, but should be resolved before auth code lands.
- `TODO(prd): phase2-image-slot` — add smart-link image slot to itinerary cards per §5.4. Claude Code handles inline when building Phase 2; no retroactive HTML update needed.

**Closed since last handoff:**

- ✅ `auth-flow-spec` → `rally-phase-11-auth.html` shipped
- ✅ `cost-split-mode` → deferred to v0.1 per decision §7.10
- ✅ `share-link-strings` → added to §5.4, §5.16, §5.17
- ✅ `made-with-rally-footer` → added to §5.4, §5.16, §5.17
- ✅ `theme-picker-lexicon` → lexicon §5.23
- ✅ `theme-variable-catalog` → lexicon §5.22
- ✅ `rsvp-chip-global-lock` → lexicon §5.10 + theme doc scrubbed
- ✅ `wordmark-lock` → brand brief "The wordmark — LOCKED v0"
- ✅ `sticker-kit-decision` → brand brief "The sticker kit — emoji-only v0"

### 9.1 Auth flow — ✅ SPEC SHIPPED
`TODO(prd): auth-backend-confirm` (only remaining open item)

Spec: `rally-phase-11-auth.html` (4 states: landing, sent, expired, invalid). Lexicon: §5.24. Email strings: §5.14.

**Locked constraints:** magic link only, 15-min expiry, single-use, 30-day rolling session, 30s resend cooldown, 5/hour rate limit per email, Resend for delivery.

**Still open:** backend provider. Andrew to confirm whether auth runs on Supabase Auth, Clerk, Resend-only with a custom JWT layer, or custom. Spec is provider-agnostic. Does not block design handoff, but should land before auth code does.

### 9.2 G9 — per-line-item cost split mode — ✅ DEFERRED to v0.1

Per decision §7.10: v0 ships "split shared" as the sole mode. No per-item toggle, no lexicon strings, no design work. Revisit after v0 ships.

### 9.3 Phase 2 itinerary image slot
`TODO(prd): phase2-image-slot`

`rally-phase-2-theme-system.html` predates the smart-link image decision (§5.4). The file does not show an image slot on itinerary cards. **Claude Code should add the image slot when building Phase 2 surfaces, per §5.4.** Design will not retroactively update the Phase 2 HTML — §5.4 is the source of truth.

### 9.4 Lexicon odds and ends — ✅ ALL CLOSED

- ✅ `share_link.copy` → added to §5.4 (global), §5.16 (builder), §5.17 (invitee)
- ✅ `footer.made_with` → added as global string in §5.4; poetic trip-page footer kept for the live trip page only
- ✅ Theme picker strings → lexicon §5.23
- ✅ Theme variable interpolation catalog → lexicon §5.22 (new — every `{var}` used across theme packs is now enumerated with type, source, and resolution rules)

---

## 10. Post-handoff (design roadmap after Claude Code build)

Not blocking handoff — captured so it doesn't get lost:

1. **Brand book overview** — canonical one-pager (or long-form doc) pulling together the voice, the chassis, the type system, the motion primitives, the theme content system, and the sticker vocabulary into a single reference. Audience: new hires, contractors, partners. Source material already exists across `rally-brand-brief-v0.md`, the phase HTML specs, and `rally-theme-content-system.md` — this is a consolidation + polish pass.
2. **Investor pitch deck** — narrative deck positioning Rally ("Partiful for group trips"), the product mechanic (three-state RSVP, theme content system, smart-link images), the market gap, and the visual identity as a moat. Likely pptx. Uses the shipped design system as proof of craft. Structure TBD — recommend 12–15 slides.

Both are post-handoff deliverables. Will kick off once Claude Code has the v0 build running.
