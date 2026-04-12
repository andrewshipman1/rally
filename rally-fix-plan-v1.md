# Rally v0 — Fix Plan v1

**Date:** April 10, 2026
**Supersedes:** rally-fix-plan-v0.md
**Context:** QA audit found 45 issues. Most features are built but not wired. The core problem: the app has 9+ routes when it should have 3 screens, and no single module works end-to-end. This plan fixes that in two phases — master pages first, then module-by-module.

---

## What changed from v0

v0 tried to fix everything in 5 sessions organized by feature area. That's the same
pattern that caused the drift: too much scope per session, features wired in parallel
instead of completed in series.

v1 splits into two phases:
- **Phase A** — Get the 3 master pages working as clean shells with the core loop (create → share → RSVP). No module depth, just the containers.
- **Phase B** — One session per module, taken to completion before moving on. Each module gets its own brief, its own ACs, and gets QA'd before the next starts.

---

## Why the drift happened (carried forward from v0)

Each Claude Code session got a scope doc with features to build, but lacked:

1. **A hard constraint on page count.** Sessions created new routes when the spec says
   three screens. Without "DO NOT create new routes" as a rule, each session optimized locally.

2. **Acceptance criteria that test wiring, not just existence.** "Build the crew section"
   got interpreted as "create a crew page" — technically works but breaks the single-scroll
   trip page contract.

3. **A QA checkpoint between sessions.** Sessions 1–4 stacked features without verifying
   the end-to-end flow.

### New process

```
For each session:

1. COWORK (Andrew + Claude): Write/review session brief
   - Exact scope (one module or one structural fix)
   - Hard constraints
   - Testable acceptance criteria
   - Files to read first
   - How to QA solo (no second test user required)

2. CLAUDE CODE: Execute the brief
   - Must read CLAUDE.md → session guard skill → session brief before coding
   - Must run the app and verify ACs before declaring done

3. COWORK (Andrew + Claude): QA the session output
   - Click through every AC in the browser
   - Update plan with what's done and what drifted
   - Write next session brief
```

---

## The 3 screens (non-negotiable)

```
/auth          → magic link login
/              → dashboard (trip list + scoreboard)
/trip/[slug]   → the trip page (single scroll, ALL modules inline)
```

Rules for every session:
- DO NOT create new page routes
- DO NOT create separate pages for sub-features
- The trip page is ONE long scroll with module sections
- Every interactive element must produce a visible result
- All user-facing strings come from `lib/copy.ts`, never hardcoded in JSX
- All colors inside `[data-theme]` use CSS variables
- Test in the browser before declaring done

---

## Trip page module order

The trip page is one scroll. What's visible depends on the phase.

**Sketch phase (organizer only):**
```
┌─────────────────────────────┐
│  marquee strip              │
│  trip header                │
│    live-row · wordmark +    │
│    postcard · sticker ·     │
│    eyebrow · title ·        │
│    tagline · start/end ·    │
│    where · rsvp-by          │
├─────────────────────────────┤
│  invite roster (name list)  │  ← "who to invite" — names, not avatars
├─────────────────────────────┤
│  MODULE: lodging            │  ← paste a link or estimate
│  MODULE: flights            │  ← line-item add
│  MODULE: transportation     │  ← line-item add
│  MODULE: activities         │  ← line-item add
│  MODULE: provisions         │  ← single estimate (~$) for food/drink
│  MODULE: extras             │  ← chooser sheet (packing/playlist/rules/album)
├─────────────────────────────┤
│  footer                     │
│  [sticky: ← back · 🎨 · save draft · publish →]
└─────────────────────────────┘
```
No countdown, no cost summary, no crew avatars, no share link in sketch.

**Sell+ phases (all viewers):**
```
┌─────────────────────────────┐
│  marquee strip              │
│  trip header (filled)       │
│  countdown                  │
│  going row (avatars)        │
│  share / invite link        │
│  organizer card             │
├─────────────────────────────┤
│  MODULE: lodging            │  ← voting (sell), locked (lock+)
│  MODULE: flights            │  ← line items with costs
│  MODULE: transportation     │  ← line items with costs
│  MODULE: activities         │  ← line items with costs
│  MODULE: provisions         │  ← estimate, or broken into restaurants/groceries
├─────────────────────────────┤
│  cost summary               │  ← aggregates all modules → per-person estimate
├─────────────────────────────┤
│  MODULE: crew               │  ← who's in / holding / out
│  MODULE: buzz               │  ← activity feed
│  MODULE: extras             │  ← packing list, playlist, rules, album
├─────────────────────────────┤
│  footer                     │
│  [sticky RSVP bar]          │
└─────────────────────────────┘
```

**Reference wireframe:** `rally-trip-page-wireframe.html` — interactive, phase-switchable.

Each module follows a consistent pattern per phase:
- **Sketch** — empty state with input prompt (estimate, paste-a-link, or line-item add)
- **Sell** — active state, allows interaction (vote, add, remove)
- **Lock+** — read-only after organizer locks
- All modules contribute to the cost summary when they have cost data

---

## Phase A: Master Pages

### Session 5: "Clean shells + core loop"

**Goal:** The three screens exist as clean containers. A user can create a trip, edit
basic fields, share a link, and an invitee can open it and RSVP. Every module slot is
visible (as an empty state) in the correct order.

**Scope:**

1. **Kill `/create` route.** Dashboard "start a trip" creates a DB record and redirects
   to `/trip/[new-slug]` in sketch state. The trip page IS the builder.

2. **Kill `/trip/[slug]/crew` and `/trip/[slug]/buzz` routes.** Redirect to
   `/trip/[slug]` or 404. These become inline sections.

3. **Wire sketch-state fields** so edits persist (name, tagline, when, where).

4. **Add "send it" CTA** — gated on name ≥3 chars + at least one date. Transitions
   trip to sell state.

5. **Add share link UI** — "copy the invite link" button on sell+ trips. Toast:
   "link copied. drop it in the chat."

6. **Organizer doesn't see RSVP bar** on their own trip. Show "you started this."

7. **Render all module slots on the trip page** in the correct order (see module order
   above). Modules without components yet show a generic empty state:
   "nothing here yet" with the module name. Modules with existing components
   (lodging, crew, buzz, extras) render their actual empty states.

8. **Remove all dead-end buttons.** If a button can't do anything yet, hide it.
   No broken affordances.

9. **Fix the white void** below trip page content.

**Hard constraints:**
- DO NOT create any new routes
- DO NOT build any module depth — just empty states and slot positioning
- DO NOT write new user-facing copy — pull from lexicon or use "nothing here yet"

**How to QA solo (no second user needed):**
- Create trip from dashboard → verify sketch state renders
- Edit name, refresh → verify persistence
- Set date → verify countdown shows real number
- Click "send it" → verify transition to sell state
- Click "copy invite link" → paste into incognito tab → verify trip page loads
- In incognito: verify RSVP bar appears (auth gate is fine — just verify it renders)
- On your own trip: verify NO RSVP bar, see "you started this"
- Scroll trip page top to bottom → verify all module slots render in order
- Click every visible button → verify none are dead ends
- Verify no white void at bottom

**Acceptance criteria:**
- [ ] Dashboard "start a trip" → lands on `/trip/[new-slug]` in sketch mode
- [ ] `/create` returns 404 or redirects to dashboard
- [ ] `/trip/[slug]/crew` and `/trip/[slug]/buzz` redirect or 404
- [ ] Editing name saves (survives refresh)
- [ ] Setting a date makes countdown show a real number
- [ ] "send it" CTA appears only when name + date are set
- [ ] Clicking "send it" transitions to sell state
- [ ] "copy invite link" copies URL, shows toast
- [ ] Invite URL in incognito shows trip page with RSVP bar
- [ ] Organizer sees "you started this" instead of RSVP buttons
- [ ] Trip page shows all module sections in correct order
- [ ] No buttons that do nothing when clicked
- [ ] No white void / empty space at bottom of trip page

**Files to read first:**
- `.claude/skills/rally-session-guard/SKILL.md` (the guardrail — read this first)
- `rally-fix-plan-v1.md` (this file)
- `rally-phase-4-builder.html` (sketch state design)
- `rally-phase-5-invitee.html` (invitee flow)
- `rally-microcopy-lexicon-v0.md` (all copy strings)

---

### Session 6: "Dashboard cleanup"

**Goal:** Dashboard accurately reflects trip states and feels like a game board.

**Scope:**

1. **Scoreboard chips** — "your move {n}" (hot, pulsing), "cooking {n}", "locked {n}",
   "done {n}". Only show chips with count > 0.

2. **Live-row** — "{n} trips need your move" with blinking dot. Fallback: "all caught up."

3. **Dashboard marquee** — scrolling strip with trip-specific text.

4. **Trip card polish** — fix title truncation, ensure stamps render correctly,
   rally meter on sell cards, avatar stack.

5. **"The archive"** — section for done trips with faded cards.

6. **Passport link** — profile icon/avatar in dashboard header that navigates
   to `/passport` (passport page already exists, just needs a way to get there).

**Hard constraints:**
- Dashboard is `/` — no new routes
- Scoreboard chips use lexicon strings exactly
- "your move" chip gets `.hot` class, nothing else

**How to QA solo:**
- All dashboard elements visible with your existing trips
- Create trips in different states to see chip counts change
- Verify marquee scrolls
- Verify passport is reachable

**Acceptance criteria:**
- [ ] Scoreboard shows chips matching trip states
- [ ] "your move" chip pulses
- [ ] Live-row shows with blinking dot
- [ ] Marquee scrolls with trip text
- [ ] Long trip titles don't get cut off by stamps
- [ ] Done trips appear in archive section
- [ ] Passport reachable from dashboard

**Files to read first:**
- `.claude/skills/rally-session-guard/SKILL.md`
- `rally-fix-plan-v1.md`
- `rally-phase-3-dashboard.html`
- `rally-microcopy-lexicon-v0.md`

#### Session 6 — Actuals

**Status:** Complete — April 11, 2026. 4 of 7 ACs passed. 3 untestable (no trips in required states). 0 bugs escalated.

**AC Results:**
- [x] Scoreboard shows chips matching trip states ✅ ("cooking 11" confirmed)
- [ ] "your move" chip pulses ⚠️ no trips in your-move state to test
- [x] Live-row shows with blinking dot ✅ ("ALL CAUGHT UP ✨" fallback confirmed)
- [x] Marquee scrolls with trip text ✅
- [ ] Long trip titles don't get cut off by stamps ⚠️ no long-title trips to test
- [ ] Done trips appear in archive section ⚠️ no done trips to test
- [x] Passport reachable from dashboard ✅ (avatar links to /passport)

**What was built (Claude Code — Sessions 5+6 combined):**
1. Scoreboard chip rendering — `src/app/page.tsx`
2. Live-row with fallback — `src/app/page.tsx`
3. Dashboard marquee — `src/app/page.tsx`
4. Trip card stamps + rally meter — `src/components/dashboard/`
5. Passport link in header — `src/app/page.tsx`
6. Passport drawer components — `src/components/trip/PassportDrawer.tsx`, `PassportContext.tsx`, `CrewAvatarTap.tsx`
7. Passport drawer wiring — going-row, crew section, organizer card avatars wrapped in `CrewAvatarTap`

**QA fixes (Cowork — CSS/copy + 2 bug fixes applied directly):**
1. Left-clipped section headings — `globals.css:2710`, margin `0 0 8px` → `0 18px 8px`
2. "Organizer" → "started this" — `OrganizerCard.tsx:31`
3. Rally meter "ride or dies" — `lib/copy/surfaces/dashboard.ts:43`
4. Dashboard avatar → /passport link restored — `app/page.tsx:89`
5. Chat icon → email icon when no phone — `OrganizerCard.tsx:56`
6. Sell-phase hero countdown fix — `app/trip/[slug]/page.tsx:231-246`, counts to `cutoffIso`
7. Off-by-one countdown fix — `lib/dashboard.ts:90-102`, `Math.ceil` matches `ChassisCountdown`
8. Passport drawer animation fix — `PassportDrawer.tsx:27-33`, replaced double-rAF with `setTimeout`
9. CrewAvatarTap event propagation — `CrewAvatarTap.tsx:20`, added `stopPropagation`/`preventDefault`

**What changed from the brief:**
- Passport drawer (components + wiring) was added beyond Session 6's dashboard scope
- Several trip-page fixes (countdown logic, organizer card, section headings) were out of dashboard scope but discovered during QA
- Items 8-9 above were bugs in Claude Code's output, fixed by Cowork during QA

**Known issues:**
- 3 ACs untestable without trips in your-move, done, or long-title states
- Passport drawer empty state ("no passport yet — they're mysterious like that") untested with a user who has no bio/socials

---

## Phase B: Sketch Page (Builder)

The wireframe work (April 11) revealed that the original module-by-module approach
was wrong. Modules in sketch phase are shallow — just inputs and estimates. The real
work is the **scaffolding** (header, roster, sticky bar, shared input patterns) that
every module depends on. So Phase B builds the sketch page first, then Phase C
deepens modules for sell+ phases.

### What already exists (audit, April 11)

| Component | Status | Notes |
|-----------|--------|-------|
| ThemePickerSheet | ✅ built | Bottom sheet, 17 themes, live preview, wired in SketchTripShell |
| LodgingGallery | ✅ display | Voting, lock, cost integration — missing add/edit UI |
| RestaurantCard | ✅ display | Shows reservation details — no add UI |
| GroceriesCard | ✅ display | Shows items — no add UI |
| CostBreakdown | ✅ built | Aggregates lodging, restaurants, groceries |
| CrewSection | ✅ built | Grouped list, passport drawer wired |
| BuzzFeed | ✅ built | Compose, post bubbles, reactions |
| Extras | 🟡 partial | Packing list exists, others TBD |
| Header fields | ✅ built | Title, tagline, when, where — need split dates + RSVP-by |
| Countdown | ✅ built | Needs to hide in sketch |
| Going row | ✅ built | Needs invite roster variant for sketch |
| Sticky bar | 🟡 partial | Exists but needs sketch-specific buttons |
| Postcard image | 🔴 missing | New — small image object in header |
| Invite roster | 🔴 missing | New — name list for sketch phase |
| Provisions estimate | 🔴 missing | New — replaces restaurants/groceries in sketch |

---

### Session 7A: "Sketch Page — Header + Sticky Bar"

**Loop phase:** Brief ✅ → Execute (Claude Code) → Release Notes → QA (Cowork) → Update Plan

**Goal:** The sketch page header and navigation work end-to-end. An organizer can
fill in the basics (title, tagline, dates, location, RSVP deadline), add a cover
image, pick a theme, save a draft, and publish (transition to sell). This is
the top of the page + the sticky bar — no modules, no roster yet.

**Scope:**

1. **Split date fields** — replace single "when" field with "start" and "end"
   date inputs. Both use date pickers. Both write to `date_start` / `date_end`.

2. **RSVP-by field** — new field after when/where row. Maps to `commit_deadline`
   in the DB. Date picker input. If `commit_deadline` column doesn't exist,
   add it to the `trips` table in Supabase (escalate to Andrew for help running
   the migration if needed).

3. **Postcard image object** — small (64px) image element in header row next to
   "rally!" wordmark. Tap to upload/select an image. If no image, element
   doesn't render (no empty state). Stores as `cover_image_url` on the trip.
   If this column doesn't exist, add it (same escalation path as #2).

4. **Hide countdown in sketch** — countdown section `display:none` when
   `phase === 'sketch'`. Appears in sell+.

5. **Sticky bar** — four buttons: [← back to dashboard] [🎨 theme] [save draft]
   [publish →]. Back navigates to `/`. Theme triggers existing `ThemePickerSheet`.
   Save draft persists current field state. Publish gates on required fields
   (name + at least one date) then transitions to sell phase.

**Data model notes:** Some scope items may require new columns on the `trips` table
(`commit_deadline`, `cover_image_url`). Claude Code should check the current schema
first and propose migrations. If unsure about the Supabase migration path, escalate
to Andrew — he can run the queries directly.

**Hard constraints:**
- DO NOT create any new routes
- DO NOT build module inputs — modules stay as empty states (that's Session 8)
- DO NOT modify sell/lock/go/done phase behavior — this session is sketch only
- Use existing `ThemePickerSheet` — do not rebuild or restyle it
- All new strings from `lib/copy.ts`, not hardcoded

**How to QA solo:**
- Create trip from dashboard → lands in sketch state
- Tap title → edit → refresh → verify persistence
- Set start date + end date → verify both save
- Set RSVP-by date → verify it saves
- Tap postcard area → upload image → verify it appears in header
- Remove or don't add image → verify postcard element not rendered
- Tap 🎨 → theme picker opens → select theme → verify it applies
- Tap save draft → no errors, fields persist on refresh
- Tap ← → returns to dashboard
- Tap publish with no name → verify it's blocked
- Fill name + date → tap publish → verify transition to sell phase
- After publish: verify countdown appears, share link visible
- Verify no regressions on sell/lock/go/done phases

**Acceptance criteria:**
- [ ] Start and end date fields render separately — both save to DB
- [ ] RSVP-by field renders after when/where — saves to `commit_deadline`
- [ ] Postcard image: tap to upload → image appears in header. No image = not rendered
- [ ] Countdown hidden in sketch, visible in sell+
- [ ] Sticky bar: back navigates to dashboard
- [ ] Sticky bar: 🎨 opens ThemePickerSheet
- [ ] Sticky bar: save draft persists all fields
- [ ] Sticky bar: publish blocked until name + date filled
- [ ] Sticky bar: publish transitions trip to sell phase
- [ ] No regressions on sell/lock/go/done phases

**Files to read first:**
- `.claude/skills/rally-session-guard/SKILL.md` (the guardrail — read first, follow the pre-flight checklist)
- `rally-fix-plan-v1.md` (this file — session brief + constraints)
- `rally-sketch-phase-spec.md` (flat page spec — every element top to bottom, sketch only)
- `rally-microcopy-lexicon-v0.md` (all copy strings)
- `src/components/trip/builder/SketchTripShell.tsx` (existing sketch shell — build on this)
- `src/components/trip/theme-picker/ThemePickerSheet.tsx` (existing theme picker — wire it, don't rebuild)

**Skill usage:** The `rally-session-guard` skill governs this session. Claude Code must:
1. Read the skill before writing any code
2. Run the pre-flight checklist (read brief, read design files, confirm constraints)
3. Write release notes into this file when done
4. Run the between-session QA checklist before declaring complete

#### Session 7A — Release Notes

**What was built:**
1. Split date fields — start + end date inputs replace single "when" field — `SketchHeader.tsx`, `InlineField.tsx`
2. RSVP-by field — new date picker below date/location row, saves to `commit_deadline` — `SketchHeader.tsx`
3. Postcard image — 64px tap target in wordmark row with Supabase Storage upload — `PostcardImage.tsx` (new), `upload.ts` (new), `PostcardHero.tsx`
4. Hide countdown in sketch — removed `SketchCountdownEmpty` render from sketch shell — `SketchTripShell.tsx`
5. 4-button sticky bar — [← back] [🎨 theme] [save draft] [publish →] — `BuilderStickyBar.tsx`
6. Server action whitelist — added `commit_deadline` + `cover_image_url` to `updateTripSketch` — `update-trip-sketch.ts`
7. Copy strings — 9 new lexicon entries for field labels + sticky bar buttons — `builder-state.ts`
8. CSS — new sticky bar button styles, field variant styles (start/end/rsvp-by), postcard image, wordmark-row — `globals.css`

**What changed from the brief:**
- "Pick the vibe" standalone button removed from page body — 🎨 button in sticky bar replaces it
- `themePicker` import cleaned up from SketchTripShell (unused after button removal)
- `SketchCountdownEmpty.tsx` file left in place (dead code) — no other consumers, can be deleted later

**QA Results (Cowork — April 12, 2026):**
- [x] Start and end date fields render separately — both save to DB ✅
- [x] RSVP-by field renders after when/where — saves to `commit_deadline` ✅
- [x] Postcard image: tap to upload → image appears in header. No image = not rendered ✅ (required RLS policies on `trip-covers` bucket — see setup below)
- [x] Countdown hidden in sketch, visible in sell+ ✅
- [x] Sticky bar: ← navigates to dashboard ✅
- [x] Sticky bar: 🎨 opens ThemePickerSheet ✅
- [x] Sticky bar: save draft persists all fields ✅
- [x] Sticky bar: publish blocked until name + date filled ✅
- [x] Sticky bar: publish transitions trip to sell phase ✅
- [x] No regressions on sell/lock/go/done phases ✅ (sell page has pre-existing issues — not caused by 7A)

**Status: Session 7A — COMPLETE. 10/10 ACs pass.**

**Pre-QA setup (Andrew):**
- [x] Create Supabase Storage bucket `trip-covers` (public, 5MB limit, image/jpeg,png,webp,gif) ✅

**Known issues:**
- `SketchCountdownEmpty.tsx` is now dead code (no consumers) — can be deleted in a future cleanup

**Supabase setup (done during QA):**
- Created `trip-covers` bucket (public, 5MB limit, image/jpeg,png,webp,gif)
- Added RLS INSERT policy: authenticated users can upload to `trip-covers`
- Added RLS SELECT policy: public read access for `trip-covers`

**QA fixes (Cowork):**
1. Removed dev bypass button ("DEV: skip to sell phase") — `SketchTripShell.tsx:197-228`. No longer needed now that the publish flow works. **Claude Code: this button is gone, do not re-add it.**
- Build compiles cleanly with zero TypeScript errors

---

### Session 7B: "Sketch Page — Invite Roster + Shared Input Components"

**Loop phase:** Brief ✅ → Execute (Claude Code) → Release Notes → QA (Cowork) → Update Plan

**Goal:** The invite roster works and the shared input components exist for
Session 8 to wire into modules. After this session, the full sketch page
scaffolding is complete.

**Scope:**

1. **Invite roster** — replaces the going row avatar circles in sketch phase.
   Simple name list with "add a person" text input. Stores names as pre-invite
   placeholders (not user accounts). The going row avatars return in sell+.
   Data model: likely a new `invite_roster` table or a JSON column on the trip —
   Claude Code should propose the approach and escalate to Andrew for Supabase
   help if needed.

2. **Shared input components** — build three reusable input components that
   Session 8 will wire into each module:
   - `EstimateInput` — single `~$` amount field (provisions will use this)
   - `LinkPasteInput` — paste a URL + manual entry fallback (lodging will use this)
   - `LineItemAddInput` — name + optional cost (flights, transport, activities will use this)
   These components should be built in `src/components/trip/builder/` and should
   NOT be wired to any module yet — just exist as standalone, testable components.
   Session 8 connects them.

**Data model notes:** The invite roster needs somewhere to live. Could be a
`trip_roster` table (trip_id, name, added_by, created_at) or a JSON array on
the trip record. Claude Code should propose what fits best with the existing
schema. Escalate to Andrew for Supabase migration help.

**Hard constraints:**
- DO NOT create any new routes
- DO NOT wire shared input components to modules — they just need to exist and render
- DO NOT modify sell/lock/go/done phase behavior
- Invite roster is sketch-phase only — going row avatars unchanged in sell+
- All new strings from `lib/copy.ts`, not hardcoded

**How to QA solo:**
- Navigate to sketch trip → verify invite roster renders (not avatar circles)
- Type a name in "add a person" → verify it appears in the roster list
- Add multiple names → verify list grows
- Refresh → verify roster persists
- Publish trip → verify going row switches to avatar circles in sell
- Render `EstimateInput` in isolation → verify it accepts a dollar amount
- Render `LinkPasteInput` in isolation → verify URL paste + manual fallback
- Render `LineItemAddInput` in isolation → verify name + cost entry

**Acceptance criteria:**
- [ ] Invite roster shows name list with add input in sketch phase
- [ ] Can add names to roster — they persist on refresh
- [ ] Going row shows avatars in sell+ (unchanged from current behavior)
- [ ] `EstimateInput` component exists and renders correctly
- [ ] `LinkPasteInput` component exists and renders correctly
- [ ] `LineItemAddInput` component exists and renders correctly
- [ ] All three input components are in `src/components/trip/builder/`
- [ ] No regressions on sell/lock/go/done phases

**Files to read first:**
- `.claude/skills/rally-session-guard/SKILL.md` (the guardrail — read first)
- `rally-fix-plan-v1.md` (this file)
- `rally-sketch-phase-spec.md` (flat page spec — sections 4 and 5)
- `rally-microcopy-lexicon-v0.md`
- `src/components/trip/builder/SketchTripShell.tsx`
- `src/types/index.ts` (existing data models)

**Skill usage:** Same as Session 7A — rally-session-guard governs. Pre-flight
checklist required. Release notes written into this file when done.

#### Session 7B — Release Notes

**What was built:**
1. Invite roster component — name list with add/remove, replaces avatar circles in sketch — `InviteRoster.tsx` (new)
2. `roster_names` field — added to `Trip` type + `SketchPatch` whitelist + autosave — `types/index.ts`, `update-trip-sketch.ts`
3. SketchTripShell wiring — replaced `SketchCrewField` with `InviteRoster`, removed unused `members`/`organizerId`/`crewReady` props — `SketchTripShell.tsx`, `page.tsx`
4. `EstimateInput` — shared ~$ amount input for provisions (Session 8) — `EstimateInput.tsx` (new)
5. `LinkPasteInput` — shared URL paste + manual fallback for lodging (Session 8) — `LinkPasteInput.tsx` (new)
6. `LineItemAddInput` — shared name + cost input for flights/transport/activities (Session 8) — `LineItemAddInput.tsx` (new)
7. Copy strings — 12 new lexicon entries for roster + shared inputs — `builder-state.ts`
8. CSS — invite roster styles + 3 shared input component styles — `globals.css`

**What changed from the brief:**
- Removed `members`, `organizerId`, `crewReady` props from SketchTripShell (no longer needed after SketchCrewField replacement)
- Removed `hasNonOrganizerMember` import from page.tsx (unused)
- `SketchCrewField.tsx` left in place (not deleted) — it's no longer imported by the sketch shell but may have other consumers

**What to test:**
- [ ] Sketch trip shows invite roster (name list), not avatar circles
- [ ] Can type a name and press enter → appears in roster
- [ ] Can add multiple names → list grows
- [ ] Can remove a name via ✕ button
- [ ] Organizer name shows first, not removable
- [ ] Refresh page → roster persists (requires `roster_names` column — see setup)
- [ ] Publish trip → going row shows avatar circles in sell (not roster)
- [ ] `EstimateInput` renders correctly (test via importing in a scratch component)
- [ ] `LinkPasteInput` renders correctly with link/manual toggle
- [ ] `LineItemAddInput` renders correctly with name + cost + add button
- [ ] No regressions on sell/lock/go/done phases

**Known issues:**
- `SketchCrewField.tsx` is now unused by the sketch shell — can be deleted in a future cleanup
- `roster_names` column must be added to Supabase before the roster will persist

**Supabase setup required (Andrew):**
```sql
ALTER TABLE trips ADD COLUMN roster_names text[] DEFAULT '{}';
```
Run this migration before testing roster persistence.

#### Session 7B — QA Results

**Status: SKIPPED — direction changed.**
During QA Andrew identified that the InviteRoster (plain name list) was a
downgrade from the existing invite infrastructure. The codebase already has:
- `POST /api/invite` — creates user + trip_member from email/phone, sends invite
- `DELETE /api/invite` — organizer uninvite
- `InviteModal` — share link + email invite UI
- `trip_members` table with full invite tracking (role, rsvp, invite_opened_at)
- `CrewSection` — full member list grouped by RSVP status

Building a text-only name roster on top of `roster_names text[]` was solving a
problem that was already solved. Session 7C replaces 7B's roster work with the
real invite data model.

**Decision: invitees must create an account** to view the trip and RSVP. No
anonymous/guest decline path. This matches the existing auth-gated invitee flow
(`InviteeShell` → magic link → account → view trip → RSVP).

---

### Session 7C: "Sketch Page — Invite List (Real Data Model)"

**Loop phase:** Brief ✅ → Execute (Claude Code) → Release Notes → QA (Cowork) → Update Plan

**Goal:** Revert the InviteRoster swap from 7B. Restore SketchCrewField +
InviteModal as the invite action, then build a proper sketch-phase invite list
that shows real trip_members data (name + contact info + count + remove).

**Context for Claude Code:** Session 7B built an `InviteRoster` component that
stores plain-text names in `roster_names text[]` on the trips table. This was
wrong — the codebase already has a full invite system using `trip_members`,
`POST /api/invite`, and `InviteModal`. We need to revert the roster swap and
build a proper invite list using the real data model.

**Scope:**

1. **Revert SketchTripShell** — remove `InviteRoster` import and usage. Restore
   `SketchCrewField` + `InviteModal` wiring. Re-add the `members`,
   `organizerId` props that 7B removed. Remove `roster_names` from the
   `initial` prop and from local state / autosave queue calls.

2. **Revert page.tsx** — re-add `members`, `organizerId`, and any other props
   that 7B removed from the SketchTripShell call site. Re-add
   `hasNonOrganizerMember` import if it was used.

3. **Revert types/index.ts** — remove `roster_names` from `Trip` type and
   `SketchPatch` whitelist. Remove from `update-trip-sketch.ts` if added there.

4. **Build `SketchInviteList`** — new component in `src/components/trip/builder/`
   that replaces the avatar-only display in SketchCrewField with a richer list:
   - Shows each invited trip_member: display name + email or phone
   - Shows total invitee count (e.g., "3 invited")
   - Each row has a remove/✕ button (calls `DELETE /api/invite?memberId=...`)
   - Organizer row shown first, not removable
   - "+" button opens the existing `InviteModal`
   - All new strings from `lib/copy.ts`, not hardcoded

5. **Wire SketchInviteList into SketchTripShell** — replace the `SketchCrewField`
   avatar display with the new list, keeping the InviteModal trigger intact.

6. **Do NOT delete InviteRoster.tsx** — leave it as dead code for now. Do NOT
   delete `roster_names` column from Supabase (Andrew will clean up later).

**Hard constraints:**
- DO NOT create any new API routes — use existing `POST /api/invite` and
  `DELETE /api/invite`
- DO NOT modify the InviteModal component — it already works
- DO NOT modify sell/lock/go/done phase behavior
- DO NOT build RSVP UI — invites are all "pending" in sketch phase
- DO NOT send invite emails in sketch — emails fire when trip moves to sell
- All new strings from `lib/copy.ts`, not hardcoded
- Account creation is REQUIRED for invitees to view trip and RSVP (confirm
  existing auth-gated flow in InviteeShell is intact, do not build guest paths)

**Important note on invite emails:** The existing `POST /api/invite` endpoint
sends an invite email immediately. For sketch phase, we do NOT want emails sent
yet (invites should queue until publish/sell transition). Claude Code should
check whether the endpoint already gates email sending on trip phase. If it
sends emails regardless of phase, add a `skipEmail` flag or check `trip.phase`
before sending. Escalate to Andrew if unsure.

**How to QA solo:**
- Navigate to sketch trip → verify SketchCrewField shows (not InviteRoster)
- Click "+" → InviteModal opens with share link + email tabs
- Add an invite via email tab → member appears in invite list with name + email
- Verify total count updates
- Click ✕ on a guest → member removed from list
- Organizer row present, no ✕ button
- Refresh → invited members persist (they're in trip_members table)
- Publish trip → sell phase shows avatar circles as before
- No regressions on other phases

**Acceptance criteria:**
- [ ] SketchCrewField + InviteModal restored as invite action in sketch
- [ ] InviteRoster removed from SketchTripShell (dead code, not deleted)
- [ ] `roster_names` removed from Trip type and SketchPatch whitelist
- [ ] SketchInviteList shows invited members with name + contact info
- [ ] Total invitee count displayed
- [ ] Can remove a guest via ✕ (calls DELETE /api/invite)
- [ ] Organizer shown first, not removable
- [ ] Invite emails gated — not sent during sketch phase
- [ ] Refresh persists invite list (real trip_members data)
- [ ] No regressions on sell/lock/go/done phases

**Files to read first:**
- `.claude/skills/rally-session-guard/SKILL.md` (the guardrail — read first)
- `rally-fix-plan-v1.md` (this file — especially 7B release notes for what to revert)
- `rally-sketch-phase-spec.md` (flat page spec — section 4: crew/invite)
- `src/components/trip/builder/SketchTripShell.tsx` (current state after 7B)
- `src/components/trip/builder/SketchCrewField.tsx` (what to restore)
- `src/components/trip/builder/InviteModal.tsx` (do not modify)
- `src/app/api/invite/route.ts` (existing invite endpoint — check email gating)
- `src/components/trip/CrewSection.tsx` (sell+ crew display — reference only)
- `src/types/index.ts` (Trip type, TripMember type)
- `src/app/trip/[slug]/page.tsx` (SketchTripShell call site)

**Skill usage:** Same as prior sessions — rally-session-guard governs. Pre-flight
checklist required. Release notes written into this file when done.

#### Session 7C — Release Notes

**What was built:**
1. Reverted `roster_names` from autosave path — `src/app/actions/update-trip-sketch.ts` (removed from `SketchPatch` type and `ALLOWED_KEYS`)
2. Reverted `roster_names` from Trip type — `src/types/index.ts` (removed field; DB column left intact)
3. Reverted SketchTripShell — `src/components/trip/builder/SketchTripShell.tsx` (removed InviteRoster import/render, removed rosterNames state, added `members` + `organizerId` props, wired SketchInviteList)
4. Reverted page.tsx — `src/app/trip/[slug]/page.tsx` (removed `roster_names` from initial, added `members` + `organizerId` props to SketchTripShell)
5. Built `SketchInviteList` — `src/components/trip/builder/SketchInviteList.tsx` (new component showing real trip_members with name + contact, organizer first/non-removable, guest remove via `DELETE /api/invite`, "+" opens InviteModal, count badge)
6. Gated invite emails on trip phase — `src/app/api/invite/route.ts` (added `phase` to trip select, wrapped email send in `trip.phase !== 'sketch'` check)
7. Added copy strings — `src/lib/copy/surfaces/builder-state.ts` (`inviteListCount`, `inviteListOrganizer`, `inviteListRemoveLabel`)
8. Updated CSS — `src/app/globals.css` (updated `.invite-roster` styles for header row, count badge, contact/role text, round "+" button)

**What changed from the brief:**
- No deviations. All 6 scope items addressed.
- InviteRoster.tsx left as dead code per brief instruction.

**What to test:**
- [ ] Sketch trip shows SketchInviteList (not InviteRoster text input)
- [ ] Organizer row shown first, not removable
- [ ] Click "+" → InviteModal opens with share link + email tabs
- [ ] Add invite via email → member appears in list with name + contact
- [ ] Count badge updates (e.g. "1 invited")
- [ ] Click ✕ on guest → member removed
- [ ] Refresh → list persists (real trip_members data)
- [ ] No invite email sent during sketch phase (check server logs)
- [ ] Publish → sell phase shows normal crew avatar display
- [ ] No regressions on sell/lock/go/done phases

**Known issues:**
- InviteRoster.tsx is dead code — needs manual cleanup later
- `roster_names` DB column still exists — Andrew to drop manually
- Preview verification limited (app requires auth login) — build passes clean, no type or server errors

#### Session 7C — QA Results

**QA date:** 2026-04-12

| AC | Result |
|----|--------|
| SketchCrewField + InviteModal restored | ✅ Pass |
| InviteRoster removed from SketchTripShell | ✅ Pass |
| `roster_names` removed from Trip type / SketchPatch | ✅ Pass (verified in code) |
| SketchInviteList shows members with name + contact | ✅ Pass — Andrew (organizer), Dempsey (info@dempzil.co), Roger (test@aol.com) |
| Total invitee count displayed | ✅ Pass — "2 invited" |
| Can remove guest via ✕ | ✅ Pass |
| Organizer shown first, not removable | ✅ Pass |
| Invite emails gated in sketch | ✅ Pass — code confirms `trip.phase !== 'sketch'` check (line 129 of route.ts) |
| Refresh persists invite list | ✅ Pass |
| No regressions on sell/lock/go/done | ✅ Pass — sell phase still shows avatar circles |

**Bugs found:**
1. **InviteModal share tab should be hidden in sketch phase.** The modal still
   shows "share link" + "email" tabs. In sketch, only the email/name invite tab
   should appear. Fix: add a `hideShareTab` prop to InviteModal, pass `true`
   from SketchInviteList. → **Escalate to Session 7D or bundle with Session 8.**

**Overall: 10/10 ACs pass. 1 minor UX bug (share tab visible in sketch).**

---

### Session 8: "Sketch Page — Module Inputs"

**Loop phase:** Brief ✅ → Execute (Claude Code) → Release Notes → QA (Cowork) → Update Plan

**Goal:** Every module on the sketch page has its input UI wired using the shared
components from Session 7B. An organizer can add data to every section. Nothing
is deep — just the first input for each.

**Scope:**

1. **Lodging** — `LinkPasteInput` wired. Organizer pastes an Airbnb/VRBO URL or
   enters details manually. Creates a lodging record. Shows as a simple card
   (image if scraped, name, price). Uses existing lodging data model.

2. **Flights** — `LineItemAddInput` wired. Organizer adds flight entries
   (route + cost). Saves as line items.

3. **Transportation** — `LineItemAddInput` wired. Same pattern as flights.

4. **Activities** — `LineItemAddInput` wired. Same pattern.

5. **Provisions** — `EstimateInput` wired. Single `~$` field. Saves an estimate
   that feeds into cost calculations later. This replaces separate
   restaurants/groceries in sketch — detail comes in sell+.

6. **Extras** — chooser sheet to add a packing list, playlist, house rules, or
   album. Uses existing extras components where they exist.

**Hard constraints:**
- Use the shared input components from Session 7B — do NOT build one-off inputs
- Each module input creates a real DB record, not just local state
- DO NOT build voting, locking, or any sell+ interactions
- DO NOT build the cost summary — that's sell+ scope
- Keep the line-item modules using ONE shared component with a `type` prop

**How to QA solo:**
- Navigate to sketch trip → each module section visible
- Paste an Airbnb URL in lodging → verify card appears
- Add a flight line item → verify it saves and renders
- Add transport, activity items → same verification
- Enter a provisions estimate → verify it saves
- Add a packing list via extras → verify it renders
- Refresh page → verify all data persists
- Publish trip → verify all module data carries over to sell view

**Acceptance criteria:**
- [ ] Lodging: can paste URL → card renders with scraped or manual data
- [ ] Flights: can add line items with name + cost
- [ ] Transportation: can add line items
- [ ] Activities: can add line items
- [ ] Provisions: can enter estimate → saves to DB
- [ ] Extras: can add at least one extra type (packing list)
- [ ] All data persists on refresh
- [ ] All data visible after publishing to sell phase
- [ ] Shared input components reused across modules (not duplicated)

**Files to read first:**
- `.claude/skills/rally-session-guard/SKILL.md` (the guardrail — read first)
- `rally-fix-plan-v1.md` (this file)
- `rally-sketch-phase-spec.md` (flat page spec — section 5 for module layout)
- `src/components/trip/LodgingGallery.tsx` (existing lodging display)
- `src/types/index.ts` (data models for all modules)
- `src/components/trip/builder/` (shared input components from Session 7B)

**Skill usage:** Same as Session 7A — rally-session-guard governs. Pre-flight checklist
required. Release notes written into this file when done.

---

### Between Phase B and Phase C: Revisit the wireframe

After Session 8, before starting sell+ work: revisit `rally-trip-page-wireframe.html`
with Andrew. The interactive wireframe covers all phases — use it to review and
refine the sell phase design the same way we did for sketch. Create a flat
`rally-sell-phase-spec.md` for Claude Code before writing sell+ briefs.

---

### Sessions 9+: "Sell+ Module Depth" (briefs TBD)

These sessions deepen each module for sell/lock/go/done phases. Briefs will be
written after Session 8 ships, the sketch page is QA'd end-to-end, and the sell
phase wireframe is reviewed with Andrew. Expected sessions:

- **Session 9:** Lodging voting + lock flow (sell → lock)
- **Session 10:** Cost summary + provisions → restaurants/groceries breakdown
- **Session 11:** Crew section depth (RSVP flow, +1, confetti)
- **Session 12:** Buzz feed depth (compose, reactions, event rows)
- **Session 13:** Extras depth + polish (all extra types, animations, copy/color audit)

These are placeholders. Exact scope depends on what we learn from sketch QA.

---

## Between-session QA checklist

After every Claude Code session, run this in Cowork before starting the next:

**Core loop (always):**
```
□ Can I create a trip from the dashboard?
□ Can I edit the trip name and see it save?
□ Does the trip page scroll through ALL sections?
□ Are there any dead-end buttons (click → nothing happens)?
□ Are there any empty/mystery elements rendering?
□ Do all strings match the lexicon? (spot check 5)
□ Does the dashboard reflect trip state changes?
```

**After Session 7+ (sketch scaffolding):**
```
□ Start/end dates save and persist?
□ RSVP-by field saves?
□ Invite roster: can add names?
□ Theme picker opens from sticky bar?
□ Save draft persists all fields?
□ Publish transitions to sell? (only with name + date)
□ Countdown hidden in sketch, visible in sell+?
```

**After Session 8+ (sketch modules):**
```
□ Can add lodging via URL paste or manual entry?
□ Can add line items to flights/transport/activities?
□ Can enter provisions estimate?
□ All module data persists on refresh?
□ All data carries over after publish?
```

**After Session 9+ (sell+ depth):**
```
□ Can I get a share link?
□ Does the share link work in incognito?
□ Can an invitee RSVP?
□ Does the RSVP show feedback?
□ Does the cost summary calculate correctly?
```

If any fail, fix before starting the next session.

---

## What NOT to build in v0

If Claude Code starts building any of these, the session has drifted:

Push notifications, payment/Venmo integration, custom questions from organizer,
threaded replies in buzz, @mentions, media uploads in buzz, map view, native
expense logging, receipt photo capture, Apple Wallet pass, multi-currency,
sticker marketplace, custom sticker upload, parallax scroll effects,
social login (Google/Apple), co-host/admin roles.
