# Rally — Session 3 (3A + 3B + 3C) Release Notes

**Branch:** `main` · **Scope:** DB migration bundle, debt cleanup (3A), three read-only surfaces — Buzz feed, Dashboard rebuild, Passport page (3B), three write-side workflows — Extras, Lodging voting, Lock flow (3C). Share back to CoWork.

Session 3 picks up after Session 2 shipped the builder, invitee pre-login, theme picker, and crew subsurface. 3A lands the database foundation; 3B builds the three surfaces that consume it; 3C wires the write paths that make those surfaces interactive.

---

## What shipped

### 3A — DB bundle + Session 2 debt cleanup · `66b0ab0`, `f8c63c6`

Five migrations and a code cleanup pass.

#### Migration 008 — `holding_rsvp.sql`
- Extends `rsvp_status` enum: `'in' | 'holding' | 'out' | 'pending'`.
- Backfills `'maybe'` → `'holding'` across `trip_members`.
- Drops the `dbRsvpToRally` / `rallyRsvpToDb` boundary mapper functions (enum values now match domain values directly).
- Follow-up fix (`f8c63c6`): drops column default before enum type swap to avoid Postgres cast error.

#### Migration 009 — `session3_columns.sql`
- Adds `trips.chassis_theme_id` column (text, nullable) for per-trip theme persistence without the theme join.
- Adds `trip_members.invite_opened_at` (timestamptz, nullable) for future crew subtext.

#### Migration 010 — `theme_backfill.sql`
- Backfills `chassis_theme_id` on all existing trips from `themes.template_name` via the known mapping.
- Seeds the 6 new theme rows (Boys Trip, Reunion, Festival, Desert, Camping, Tropical) with placeholder gradients.

#### Migration 011 — `auth_rate_limits.sql`
- Creates `auth_rate_limits` table for magic-link abuse prevention.
- `src/lib/auth/rate-limit.ts` rewritten to use DB-backed rate limiting instead of in-memory map.

#### Code cleanup
- Deleted `src/lib/__tests__/rsvp-boundary.test.ts` (boundary mappers removed).
- Removed all `dbRsvpToRally` / `rallyRsvpToDb` call sites across RSVP route, crew page, guest list, invitee shell, sticky bar, and RsvpSection.
- Added shared `isTripDone()` and `computeRallyPhase()` utilities to `src/lib/rally-types.ts` for use by dashboard and passport.
- Fixed theme picker tile styling (border + shadow) and category mapping.
- Fixed PostcardHero gradient overlay logic.

### 3B — Buzz feed, Dashboard rebuild, Passport page · `c104bf3`

Three read-only surfaces following the crew subsurface pattern (RSC, auth gate, chassis theming, `getCopy()` for all strings).

#### Migration 012 — `activity_log.sql`
Notification-grade event log designed to power buzz feed AND future notification channels:
- Columns: `id`, `trip_id`, `actor_id`, `event_type`, `target_id`/`target_type` (polymorphic FK), `metadata` (jsonb), `is_read`, `created_at`.
- 4 indexes: trip+time (buzz feed queries), actor (notification routing), event_type (channel routing), unread (badge counts).
- 13 event types: `rsvp_in`, `rsvp_holding`, `rsvp_out`, `plus_one_added`, `vote_cast`, `lodging_locked`, `activity_added`, `extra_added`, `theme_changed`, `phase_lock`, `phase_go`, `trip_created`, `cutoff_passed`.
- `ActivityEventType` union and `ActivityLogEntry` interface added to `src/types/index.ts`.

No write paths to `activity_log` yet — that's 3C scope. The table is ready for server actions to INSERT into.

#### Surface 1 — Buzz feed (`/trip/[slug]/buzz`)

- **`src/lib/buzz.ts`** — `getBuzzFeed(tripId, currentUserId, themeId)` merges `activity_log` events + `comments` into a unified `BuzzDay[]` feed grouped by calendar day. Pre-renders event text server-side via `getCopy()`.
- **`src/app/trip/[slug]/buzz/page.tsx`** — RSC. Auth gate mirrors crew page (redirect if unauthed or sketch). Day dividers, event rows (icon circle + flat text), post rows (chat bubbles, `.mine` variant flipped right). Reactions display-only (`pointer-events: none`). Compose bar rendered but disabled (3C scope).
- **`src/lib/copy/surfaces/buzz.ts`** — added `viewLink: 'the buzz →'` (35 event template keys already populated in Session 2).
- **Trip page change** — `<ActivityFeed>` import removed, replaced with `<Link className="buzz-link">` to `/trip/{slug}/buzz`.

#### Surface 2 — Dashboard (`/`)

- **`src/lib/dashboard.ts`** — `getDashboardData(userId)` queries trips where user is organizer OR member, deduplicates, computes `RallyPhase` per card (using `computeRallyPhase()`), resolves per-card theme from `chassis_theme_id` or `chassisThemeIdFromTemplate()` fallback. Returns `DashboardData` with cards, phase counts, user name.
- **`src/app/page.tsx`** — full rewrite from legacy client component to RSC chassis page. Auth gate (redirect to `/auth`). Structure: header (wordmark + SignOutButton), greeting, scoreboard chips (count per phase), phase sections ("what you're cooking" for active, "the archive" for done), per-card themed trip cards (`<div className="chassis dash-card" data-theme={cardThemeId}>`), sticky CTA to `/create`, empty state.
- Per card: countdown stamp (days out), trip name, meta line (destination · dates · member count), rally meter (sell-state only, progress bar), avatar pile, action CTA.
- **`src/lib/copy/surfaces/dashboard.ts`** — ~25 keys populated: page chrome, scoreboard, sections, card fields, actions, rally meter, empty state, CTA.

#### Surface 3 — Passport (`/passport`)

- **`src/lib/passport.ts`** — 4 queries:
  - `getPassportProfile(userId)` — user row (display_name, created_at).
  - `getPassportStats(userId)` — aggregates: done trip count, distinct co-travelers, distinct countries (best-effort parse from `trip.destination`).
  - `getPassportStamps(userId)` — done trips with per-stamp theme info for `data-theme`.
  - `getRideOrDies(userId)` — top 10 co-travelers by shared trip count.
- **`src/app/passport/page.tsx`** — RSC. Auth gate (redirect to `/auth`). Profile head (avatar + display name + handle/bio + est line), stat strip (3 big numbers with colored drop shadows), stamp grid (2-col CSS grid, per-trip `data-theme`, slight rotation via `--rot` custom property), ride-or-dies leaderboard, empty states, sticky CTA.
- **`src/lib/copy/surfaces/passport.ts`** — ~15 keys populated: profile, stats, stamps, leaderboard, empty states, CTA.

#### Design QA — Avatar contrast fix · `eb547eb`

- Extracted base `.chassis .av` rule from `.chassis .avatars .av` so all surfaces inherit the avatar primitive (width, height, border-radius, font, and critically `color: var(--ink)`).
- Previously only `.chassis .avatars .av` (trip page crew section) had the full styling. Dashboard `.dash-avs .av`, passport `.stamp-avs .av`, and buzz `.buzz-post-av` rendered white initials on light-themed cards because they inherited browser-default color instead of `var(--ink)`.
- Verified: all avatar initials now render dark text against their sticker backgrounds across all theme variants.

### 3C — Extras + Lodging voting + Lock flow (write-side workflows)

Three write-side workflows wired to the read-only surfaces from 3B. Every mutating action uses Zod validation, reads auth from the httpOnly cookie, and checks organizer status server-side where applicable. Every user-visible event INSERTs into `activity_log`, powering the buzz feed.

#### Cross-cutting: `logActivity` helper

- **`src/lib/activity-log.ts`** — shared helper for all server actions. Takes the calling action's Supabase client (avoids double `createClient()`). Non-fatal: if the primary mutation succeeded, a failed log insert doesn't fail the action. Wires 4 event types: `extra_added`, `vote_cast`, `lodging_locked`, `phase_lock`.

#### Workflow 1 — Extras drawer write-side

- **`src/app/actions/extras.ts`** — 5 server actions, all organizer-only:
  - `addPackingItem` — appends to `packing_list` JSONB. `stripHtml()`, 200-char cap.
  - `removePackingItem` — filters item from `packing_list` JSONB. No activity_log (no removal event type).
  - `setPlaylistUrl` — URL scheme allowlist (http/https only via Zod refine).
  - `setHouseRules` — `stripHtml()`, 1000-char cap.
  - `setAlbumUrl` — same URL allowlist as playlist.
- **`src/components/trip/ExtrasSections.tsx`** — rewritten with organizer edit affordances. When `isOrganizer`: packing list gets add/remove UI, playlist/album get editable URL inputs (save on blur/Enter), house rules gets a textarea. All strings through `getCopy()`. Non-organizer path unchanged (read-only). Uses `useTransition` for pending state, `router.refresh()` on success.
- **`src/lib/copy/surfaces/extras.ts`** — added 6 section label keys (`packing.label`, `playlist.label`, `rules.label`, `album.label`, `album.openCta.short`, `playlist.openCta.short`).

#### Workflow 2 — Lodging voting write-side

- **`src/app/actions/lodging.ts`** — 2 server actions:
  - `castLodgingVote` — any authenticated user. Guards: target option must belong to trip, voting not locked (`is_selected` check). Deletes all existing votes by this user for any lodging in the trip, then inserts new vote. One vote per user per trip.
  - `lockLodgingWinner` — organizer only. Sets `is_selected=false` on all trip lodging, then `is_selected=true` on winner. Once locked, voting is closed.
- **`src/components/trip/LodgingGallery.tsx`** — converted from server component to `'use client'` interactive gallery. Each card now shows vote tally + voter names, state-dependent vote/change button, and winner stamp or "not it" label when locked. Organizer sees a "lock the winner" button (disabled below 2 total votes). Vote buttons are outside the `<a>` wrapper to avoid navigation conflicts. All strings via `getCopy()` from `lodgingVoting` surface.
- Section header switches between `lodgingVoting.card.title.open` and `.locked` with a status pill.

#### Workflow 3 — Lock flow

- **`src/app/actions/lock-trip.ts`** — `lockTrip(tripId, slug)`. Organizer only. Three guards:
  1. Phase must be `sell` (wrong-phase error).
  2. `commit_deadline` must be set (no-deadline error).
  3. At least 1 `trip_members` row with `rsvp='in'` (no-members error).
  - CAS guard: `.eq('phase', 'sell')` on the update prevents double-lock race conditions.
- **`src/lib/copy/surfaces/lock-flow.ts`** — was empty, now populated with 16 keys: phase labels + subtitles (migrated from EditorToolbar), lock ceremony strings (gate, confirmation title/body/confirm/cancel), guard messages, post-lock banner strings.
- **`src/components/editor/EditorToolbar.tsx`** — deleted `PHASE_LABELS` and `PHASE_SUBTITLES` inline constants. Added `themeId` prop. Phase buttons now render via `getCopy(themeId, 'lockFlow.phase.${p}.label')`. All 8 `PanelLabel` strings ("Phase", "Commit deadline", "RSVP emojis", etc.) extracted to `builderState` surface.
- **`src/lib/copy/surfaces/builder-state.ts`** — added 8 editor panel label keys.
- **`src/app/trip/[slug]/page.tsx`** — T-3 / T-0 deadline nudge banners (sell phase, computed server-side from `commit_deadline`). Post-lock banner (lock phase) with `lockFlow.postLock.banner` and `.subtitle`.
- **`src/app/globals.css`** — added ~30 lines: `.deadline-banner`, `.deadline-banner--urgent`, `.lock-banner`, `.lock-banner-text`, `.lock-banner-sub`. All consume chassis custom properties.

#### Activity log coverage matrix

| Server Action | event_type | target_type | metadata |
|---|---|---|---|
| addPackingItem | `extra_added` | null | `{ extra_type: 'packing', item_text }` |
| setPlaylistUrl | `extra_added` | null | `{ extra_type: 'playlist' }` |
| setHouseRules | `extra_added` | null | `{ extra_type: 'rules' }` |
| setAlbumUrl | `extra_added` | null | `{ extra_type: 'album' }` |
| castLodgingVote | `vote_cast` | `lodging` | `{ option_name }` |
| lockLodgingWinner | `lodging_locked` | `lodging` | `{ option_name }` |
| lockTrip | `phase_lock` | null | `{}` |

With these INSERTs wired, the buzz feed now shows system events alongside user comments.

---

## CSS added (~480 lines in globals.css)

Three new surface blocks following the established pattern (all consume chassis custom properties):

- **`.buzz-*`** — buzz-surface, buzz-back, buzz-title/subtitle, buzz-day-divider, buzz-event (icon circle + text), buzz-post/.mine (chat bubbles), buzz-bubble, buzz-reactions (display-only pills), buzz-compose (disabled), buzz-link, buzz-empty.
- **`.dash-*`** — dash-surface, dash-header/wordmark/h1, dash-scoreboard/chip(.hot), dash-section, dash-card (`.chassis` nesting for per-card theme), dash-stamp (countdown badge with wiggle), dash-meter/fill (rally progress), dash-avs (avatar pile), dash-sticky, dash-empty.
- **`.passport-*`** — passport-surface, passport-head, passport-avatar (80px circle), passport-name/handle/est, passport-stats/stat-num(.trips/.rod/.countries with colored drop shadows), passport-grid (2-col), passport-stamp (per-trip data-theme, rotation), stamp-place/trip/meta/avs, passport-rod-list/row/rank, passport-empty, passport-sticky.

---

## Decisions locked this session

### 1. `activity_log` as notification foundation
Designed with `target_id`/`target_type` polymorphic FK, `is_read` flag, and 4 indexes. Not just a buzz data source — supports future notification badge counts, per-user notification routing, and event-type-based channel filtering. **Why:** building the table shape around only the buzz feed would require a migration when notifications ship.

### 2. Per-card theming via nested `.chassis` wrappers
Dashboard cards and passport stamps each get `<div className="chassis" data-theme={themeId}>` so CSS custom properties cascade correctly per trip. The page-level surface has no `data-theme` — it uses hardcoded light defaults. **Why:** a single `data-theme` at page level can only style one theme; the dashboard shows N trips with N different themes simultaneously.

### 3. Shared `computeRallyPhase()` utility
Both dashboard and passport need to distinguish "done" trips (phase='go' + date_end > 30 days ago). Extracted `isTripDone()` and `computeRallyPhase()` into `src/lib/rally-types.ts` rather than duplicating the logic. **Why:** the 30-day threshold is a product decision that should live in one place.

### 4. Buzz feed merges activity_log + comments
The feed combines system events (from `activity_log`) and user posts (from `comments` where `type='comment'`). Merged into a single chronological stream grouped by calendar day. **Why:** the buzz is one timeline, not two tabs. System events provide context between human posts.

### 5. Design QA done inline, not batched
White-on-white contrast fix shipped as a separate commit rather than accumulating into a QA phase. **Why:** fixing contrast immediately is lower risk than carrying a known visual bug through multiple sessions.

### 6. Base `.av` primitive extracted
Avatar styling was locked inside `.chassis .avatars .av` (trip page context). Extracted to `.chassis .av` so dashboard, passport, and buzz avatars inherit the primitive. **Why:** every new surface that uses `.av` outside `.avatars` would otherwise need to redeclare width, height, font, and color.

### 7. Zod validation for all server actions (3C)
Every new mutating server action uses Zod `safeParse()` before any DB access. This is a pattern upgrade from Session 1/2's manual whitelist approach (see `update-trip-sketch.ts`). Zod catches malformed UUIDs, oversized strings, and invalid URL schemes at the boundary. **Why:** manual whitelist validation is fragile and doesn't compose well across 8 new actions.

### 8. Non-fatal activity log inserts (3C)
`logActivity()` calls are wrapped in try/catch at every call site. If the primary mutation (e.g., updating `packing_list`) succeeded, a failed log insert does not cause the action to return `ok: false`. **Why:** the activity log is observability, not business logic. Users should never see an error because a log write failed.

### 9. One vote per user per trip (3C)
The `lodging_votes` table has a unique constraint on `(lodging_id, user_id)`, but the product requirement is one vote per user per *trip*. `castLodgingVote` enforces this by deleting all existing votes by the user across all lodging options in the trip before inserting the new one. **Why:** without this, a user could vote for multiple options by hitting different lodging IDs directly.

### 10. CAS guard on lock transition (3C)
`lockTrip` uses `.eq('phase', 'sell')` on the UPDATE query as a compare-and-swap guard. If two organizer tabs both try to lock simultaneously, only the first one succeeds — the second sees zero affected rows. **Why:** optimistic locking without a separate database lock.

---

## Spec deviations worth flagging

- **Buzz feed shows only comments until 3C.** `activity_log` table exists but has zero rows — no server action writes to it yet. The feed will show user posts from the `comments` table. System events appear once 3C wires the INSERT paths.
- **Buzz compose bar is rendered but disabled.** `opacity: 0.5`, `pointer-events: none`. Write path is 3C scope.
- **Buzz reactions are display-only.** No tap handler, `pointer-events: none`. Write path is 3C scope.
- **Dashboard has no archive/unarchive.** Read-only per 3B scope. The archive section renders done trips but has no action buttons.
- **Dashboard "done" computation is time-based, not explicit.** `isTripDone(phase, dateEnd)` returns true when phase='go' AND `date_end + 30 days < now`. There is no explicit "mark as done" action. This means trips in the "go" phase will auto-graduate to "done" in the archive section after 30 days.
- **Passport country count is best-effort.** Parses `trip.destination` by splitting on comma and taking the last segment. Works for "Cape Cod, MA" or "Tortola, BVI" but may miscount for destinations without commas or with unusual formatting.
- **Passport "ride or dies" requires shared done trips.** Co-travelers are only counted from trips where both users have `rsvp='in'` AND the trip is done. Active trips don't contribute to the leaderboard.
- **No navigation link to `/passport` yet.** The page exists but isn't linked from the dashboard or trip page. Needs a nav element in a future session.

### 3C deviations

- **Lock ceremony has no confirmation modal yet.** The `lockTrip` action, guard logic, and ceremony copy strings all exist, but there's no confirmation dialog UI component. The EditorToolbar still uses a raw phase switcher that directly calls `onPhaseChange`. A proper ceremony modal (intercept sell→lock, show confirmation body, require organizer confirm) is a UI component — borderline "new surface." Flagged for 3D or v0.1.
- **Extras are organizer-only in v0.** All 5 extras actions check `organizer_id === user.id`. The scope doc said "organizer-editable by default, check PRD for crew-editable." No PRD guidance found, so defaulted to organizer-only. Trivially changeable by removing the organizer guard per-action.
- **`removePackingItem` has no activity_log event.** The `ActivityEventType` union has no removal event type. Only additions generate buzz feed entries. This is by design — removals are housekeeping, not social signals.
- **EditorToolbar uses `'just-because'` as default themeId.** The `ThemeId` union doesn't include `'default'`. `'just-because'` is the generic/fallback theme. The editor doesn't participate in chassis theming the same way trip pages do, so this is cosmetic — getCopy falls through to lexicon defaults regardless.

---

## Surfaces NOT touched this session (3D scope)

| Session | Surface | Status |
|---|---|---|
| 3D | Buzz compose + reactions write paths | Table ready, UI disabled, 3C deferred |
| 3D | Lock ceremony confirmation modal | Action + copy ready, no modal UI yet |
| 3D | Dashboard archive/unarchive | Read-only now |
| 3D | Navigation to /passport | Page exists, no link from dashboard/trip |
| 3D | Dead-code sweep | GuestList, ActivityFeed, Dashboard.tsx, etc. |
| 3D | Motion pass + a11y sweep + deploy | |

---

## Open questions / blockers

1. **No navigation to passport.** `/passport` renders but no link exists from dashboard or trip pages. Needs a nav bar or profile icon.
2. ~~**`activity_log` needs writers.**~~ **Resolved in 3C.** 7 server actions now INSERT into `activity_log`. Buzz feed shows system events alongside comments.
3. **Dashboard marquee ticker.** The plan included a `.dash-marquee` / `.dash-marquee-track` animated ticker strip. Not implemented — the scoreboard chips serve the same purpose. Can add if wanted.
4. **Theme backfill for test data.** `chassis_theme_id` was manually backfilled on 4 test trips via Supabase admin API. New trips created via the builder should get `chassis_theme_id` set by `commitTripTheme` (wired in Session 2 Phase 6). Verify this path works end-to-end.
5. **CoWork prompt evolution.** Shared a prompt addition for contrast-aware theming on multi-theme surfaces. CoWork will address in the next prompt iteration.
6. **Lock ceremony needs a modal.** `lockTrip` action and copy are ready, but there's no confirmation dialog intercepting the sell→lock transition. The EditorToolbar phase switcher still fires directly. This is the highest-priority 3D item.
7. **Buzz compose still disabled.** Compose bar + reactions are rendered but `pointer-events: none`. This was deferred from 3C. Decide if it's 3D or v0.1.
8. **Extras crew-editability.** All extras actions are organizer-only. If crew members should be able to add packing items, that's a one-line guard removal per action.

---

## How to verify

### Build + types
```sh
npx tsc --noEmit      # silent
npx next lint         # clean
```

### Buzz feed
1. Navigate to a non-sketch trip, find "the buzz →" link.
2. Tap it → `/trip/<slug>/buzz`. Feed shows posts from `comments` table grouped by day.
3. Compose bar visible but disabled (greyed out).
4. Empty state renders for trips with no comments.

### Dashboard
1. Visit `/` while signed in.
2. Scoreboard shows phase counts. "what you're cooking" section lists active trips.
3. Each card has its own theme (check: card backgrounds differ per trip).
4. Sell-state cards show rally meter progress bar.
5. Avatar initials are visible (dark text on light sticker backgrounds — contrast fix verified).
6. Empty state renders for users with zero trips.

### Passport
1. Visit `/passport` while signed in.
2. Profile head shows avatar initial, display name, est line.
3. Stat strip shows 3 numbers (may be 0 for test users with no done trips).
4. Stamp grid shows done trips with per-trip theming and slight rotation.
5. Ride-or-dies leaderboard shows top co-travelers (empty state if no done trips).

### Contrast regression
- On dashboard: avatar initials ("A", "R", etc.) are dark text on all card themes.
- On passport stamps: avatar initials in stamp-avs are dark text.
- On trip page crew section: existing avatar styling unchanged.

### 3C — Extras
1. Open a non-sketch trip as the organizer.
2. Scroll to extras. All four sections visible with edit affordances (add input, edit buttons).
3. Add a packing item → appears in list. Reload → persists.
4. Set a playlist URL → link renders. Set house rules → text renders. Set album URL → link renders.
5. Open the same trip as a non-organizer → read-only, no inputs or edit buttons.
6. Check `activity_log` table → rows with `event_type='extra_added'` for each mutation.

### 3C — Lodging voting
1. Seed a trip with 2+ lodging options.
2. As user A, tap "tap to vote" on option 1 → button changes to "your pick", tally shows 1 vote.
3. As user A, tap "change my vote" on option 2 → vote moves, tallies update.
4. As user B, vote for option 1.
5. As organizer, "lock the winner" button appears (enabled with 2+ total votes). Lock option 1.
6. After lock: winner shows key stamp, loser shows "not it", vote buttons gone.
7. Check `activity_log` → `vote_cast` rows and `lodging_locked` row.

### 3C — Lock flow
1. Create a trip in sell phase. Try to lock without a cutoff date → blocked (`no-deadline` error).
2. Set a cutoff date. Try to lock with 0 RSVP'd-in members → blocked (`no-members` error).
3. Add 1 RSVP'd-in member. Lock → trip transitions to lock phase.
4. Post-lock banner renders: "locked in. it's happening."
5. EditorToolbar phase labels render from copy system (no inline PHASE_LABELS).
6. Fake clock to 2 days before cutoff on a sell-phase trip → T-3 banner appears.
7. Check `activity_log` → `phase_lock` row.

---

## Commits

```
eb547eb Fix avatar contrast: extract base .chassis .av rule
c104bf3 Session 3B: Buzz feed, Dashboard rebuild, Passport page
f8c63c6 Fix 008 migration: drop column default before enum type swap
66b0ab0 Session 3A: DB bundle + Session 2 debt cleanup
(3C)    Session 3C: Extras + Lodging voting + Lock flow write-side
```

### 3C files summary

**New (4):** `src/lib/activity-log.ts`, `src/app/actions/extras.ts`, `src/app/actions/lodging.ts`, `src/app/actions/lock-trip.ts`

**Modified (8):** `src/lib/copy/surfaces/lock-flow.ts`, `src/lib/copy/surfaces/extras.ts`, `src/lib/copy/surfaces/builder-state.ts`, `src/components/trip/ExtrasSections.tsx`, `src/components/trip/LodgingGallery.tsx`, `src/components/editor/EditorToolbar.tsx`, `src/app/trip/[slug]/page.tsx`, `src/app/globals.css`

**Build status:** `tsc --noEmit` clean, `eslint` 0 errors (6 emoji-literal warnings, pre-existing pattern).
