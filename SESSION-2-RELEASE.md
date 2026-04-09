# Rally — Session 2 (Surfaces) Release Notes

**Branch:** `main` · **Scope:** the surfaces pass from the kickoff v2 prompt — Phases 4 (Builder), 5 (Invitee pre-login), 6 (Theme picker), 9 (Crew subsurface). Share back to CoWork.

Session 2 picked up after Session 1 had already shipped its release notes but not yet committed all of its code. The first commit of this session is the bundled `Session 1 + 2 Phase 4` mega-commit (a80edbc) that landed both the Session 1 chassis foundation and the Phase 4 builder work in one push. Phases 5, 6, 9 followed as their own commits. Phase 10 (Buzz feed) — the fifth surface on the original Session 2 roadmap — is **deferred to Session 3**.

---

## What shipped

### Phase 4 — Builder (trip editor) · `a80edbc`

The editor IS the trip page in sketch state per §5.16. The old `/edit/[id]` flow is being retired; sketch-phase trips now render an inline-editable chassis directly at `/trip/[slug]`.

- `src/app/actions/update-trip-sketch.ts` — server action for live autosave of sketch fields. Authenticates the caller, scopes by `share_slug`, accepts a partial patch, returns `{ ok: true }` or `{ ok: false, error }`.
- `src/components/trip/builder/SketchTripShell.tsx` — the new sketch-phase shell. Owns the `.chassis` wrapper itself (so the theme picker can drive live preview via React state without the trip page wrapping it twice). Mounts `SketchHeader`, `SketchCountdownEmpty`, `SketchCrewField`, `BuilderStickyBar`, and (via portal) the theme picker sheet.
- `src/components/trip/builder/SketchHeader.tsx` — chassis-styled inline-edit header. Trip name (Shrikhand), tagline (Caveat), destination + date range, all with click-to-edit affordances.
- `src/components/trip/builder/InlineField.tsx` — generic primitive: read view → click → input → blur-saves. Used by all the sketch fields.
- `src/components/trip/builder/SketchCrewField.tsx` — invite-by-email row. Renders the dashed `field-crew` chassis primitive with a `+` add button and the inviter helper line.
- `src/components/trip/builder/SketchCountdownEmpty.tsx` — empty-state countdown shown when `date_start` is unset. Uses the same Shrikhand day-block as `ChassisCountdown` with em-dash placeholders.
- `src/components/trip/builder/BuilderStickyBar.tsx` — sticky sketch-phase CTA. Disabled until `hasNonOrganizerMember(members)` returns true (gated by `src/lib/builder/ungate.ts`).
- `src/lib/builder/useDebouncedAutosave.ts` — 500ms debounced patch dispatcher with optimistic state + rollback on server error. Surfaces save status to the sticky bar.
- `src/lib/builder/ungate.ts` — the "trip is ready to leave sketch" predicate. Currently `hasNonOrganizerMember` only; more checks land in Session 3 lock-flow work.
- `src/lib/copy/surfaces/builder-state.ts` (53 lines) — populated. Field placeholders, empty-state copy, save-status pills, sticky-bar CTAs per §5.16.
- Trip page short-circuit (`src/app/trip/[slug]/page.tsx`): when `trip.phase === 'sketch'`, render `SketchTripShell` and return — never fall through to the live trip subtree.
- **Mega-commit context:** the `a80edbc` commit also lands the Session 1 chassis kernel, all 17 themes, the full lexicon scaffolding, the rewritten `globals.css`, the new auth surface, and the rebuilt `/trip/[slug]/page.tsx`. Those are all Session 1 deliverables that had been documented in `SESSION-1-RELEASE.md` but not yet committed. They are listed in the Session 1 release notes; this entry only covers the Phase 4 builder additions on top.

### Phase 5 — Invitee pre-login state · `55d446b`

Login-gate (NOT RSVP-gate) view rendered when an unauthenticated viewer hits `/trip/[slug]` on a non-sketch trip. The hero, countdown, and going row stay visible; the plan summary is blurred behind a "sign in to see the plan" overlay.

- `src/components/trip/InviteeShell.tsx` — composes `PostcardHero` + `ChassisCountdown` as-is, plus an inline going row with a dashed "you?" empty avatar slot. Wraps `LockedPlan` and mounts `InviteeStickyBar`.
- `src/components/trip/LockedPlan.tsx` — renders real flight/lodging/activity/total rows underneath `filter: blur(4px)`, `pointer-events: none`, `aria-hidden`, with an absolutely-positioned overlay pill ("sign in to see the plan ↑"). Real content is there for screen-reader diversity but blurred and inert.
- `src/components/trip/InviteeStickyBar.tsx` — client island. Primary CTA is a plain `Link` to `/auth?trip=<slug>` (pulsing accent). Soft-decline "can't make it" opens a tiny confirm modal that interpolates the inviter's first name. No DB write — the viewer has no identity yet.
- Trip page short-circuit (`src/app/trip/[slug]/page.tsx`): added ahead of the existing sketch short-circuit. Reuses `cost`, `inCount`, `goingMembers` already in scope.
- `src/lib/copy/surfaces/invitee-state.ts` — gains `cantMakeItConfirmYes` / `cantMakeItConfirmNo` for the modal buttons (the rest of the surface was already populated in the mega-commit).
- Phase 5 chassis CSS appended to `globals.css` under a clearly marked block: `.invitee-*` classes for the dashed "you?" slot, the locked-plan overlay pill, and the sticky bar CTA pulse.

### Phase 6 — Theme picker sheet · `615154f`

Replaces the legacy inline `ThemePicker.tsx` with a full-screen sheet that opens automatically on first visit to a new sketch trip (`?first=1`).

- `src/components/trip/theme-picker/ThemePickerSheet.tsx` — full-screen portal sheet. Owns its own inner `.chassis` wrapper so the cascade reaches the portaled subtree. Holds `previewThemeId` + `committedThemeId` React state. Esc dismisses + reverts; CTA fires `commitTripTheme` server action only when `preview !== committed`.
- `src/components/trip/theme-picker/ThemePickerTile.tsx` — single-column, text-forward tile per the corrected mockup spec: Shrikhand 26px title + Caveat 18px tagline rendered directly on the full-tile gradient, 2.5px ink border, 3px/3px/0 hard drop shadow.
- `src/lib/themes/categories.ts` — maps each `ThemeId` to one of `weekends / big trips / milestones / chill`. Drives the 5-pill filter row (`all` + the four categories).
- `src/app/actions/commit-trip-theme.ts` — server action that authenticates the caller, looks up `theme_id` via `templateNameFromChassisId`, and updates `trips.theme_id`. Mirrors the proven `updateTripSketch` shape.
- `src/lib/themes/from-db.ts` — gains `templateNameFromChassisId(themeId): string` for the reverse mapping commitTripTheme needs.
- `src/components/trip/builder/SketchTripShell.tsx` — now owns the `.chassis` wrapper plus `previewThemeId` / `committedThemeId` state. Auto-opens the sheet on `?first=1` after trip creation. Previewing a tile mutates `data-theme` on the wrapper directly — pure CSS recalc, no React re-render of the underlying surface.
- `src/components/editor/TripForm.tsx` — drops the legacy inline picker. After successful trip creation, routes to `/trip/[slug]?first=1` so the sheet auto-opens.
- `src/app/create/page.tsx` — no longer fetches themes (the sheet pulls from the static registry).
- **Deleted:** `src/components/editor/ThemePicker.tsx`.

### Phase 9 — Crew subsurface · `2ad91e6`

Read-only `/trip/[slug]/crew` page grouped by RSVP state. Replaces the inline `GuestList` card on the trip page with a `the crew →` link.

- `src/app/trip/[slug]/crew/page.tsx` — server component. Auth + fetch + render. Groups `trip.members` via `dbRsvpToRally(m.rsvp)` into four buckets (`in / holding / out / pending`); within each bucket, organizer first then alpha by `display_name`. Renders four `.crew-section` blocks with section headers/captions from `rsvp.crew.section.*` + `rsvp.crew.caption.*`. Inline `CrewRow` helper renders avatar + name + 👑 (organizer) + "you" (viewer) + subtext. Sketch trips and unauthenticated viewers `redirect()` back to `/trip/[slug]`.
- `src/app/trip/[slug]/_data.ts` — extracted shared `getTrip(slug)` loader. The trip page and the crew subsurface both import it; Next.js dedupes the Supabase query within one request.
- `src/lib/copy/surfaces/crew.ts` — adds `viewLink: 'the crew →'` and `emptyStatePending: "nobody's sitting on it"`.
- `src/lib/copy/surfaces/rsvp.ts` — adds `crew.section.pending: 'pending'` and `crew.caption.pending: "hasn't weighed in yet"` (the lexicon previously only had section/caption keys for in/holding/out).
- `src/app/globals.css` — new `/* ───── crew subsurface (§5.25) ───── */` block: `.crew-link` (rounded sticker pill), `.crew-surface`, `.crew-back`, `.crew-title` (Shrikhand 38px), `.crew-subtitle`, `.crew-summary` + `.crew-tally`, `.crew-section`, `.crew-rows` + `.crew-row`, `.crew-row-av` (resets the cascade overlap), `.crew-row-name` + `.crew-row-host` + `.crew-row-you`, `.crew-row-sub`. All consume `var(--bg)` / `var(--ink)` / `var(--accent)` / `var(--sticker-bg)` / `var(--surface)` / `var(--on-surface)` so themes drive everything.
- Trip page edit (`src/app/trip/[slug]/page.tsx`): the `<GuestList>` block is replaced with a centered `<Link href={'/trip/' + slug + '/crew'} className="crew-link">{getCopy(themeId, 'crew.viewLink')}</Link>`. The `GuestList` import is dropped.
- **Row subtext fallback (v0):** the lexicon defines copy for rsvp'd-when, opened-but-no-rsvp, unopened-invite, and out-reason states. The DB only tracks `updated_at` and `plus_one: boolean` today. Implementation:
  - `rowSubRsvpd` → `formatDistanceToNow(updated_at, { addSuffix: true })` for `in`/`holding`/`out` rows.
  - `rowSubOpened` / `rowSubUnopened` → skipped (no `invite_opened_at` column). Pending rows render no subtext.
  - `rowSubOutReason` → skipped (no `decline_reason` column).
  - `plusOneSubtextAnon` → always used when `plus_one === true` (no `plus_one_name` column).

---

## Decisions locked this session

### 1. Theme picker mockup correction
First pass rendered mini-swatch tiles in a multi-column grid with a separate rally wordmark + sticker badge. After a re-read of the mockup HTML, switched to a single-column, text-forward list: theme name in Shrikhand 26px + tagline in Caveat 18px rendered directly on the full-tile gradient. **Why:** the mockup is the source of truth and the first pass had drifted from it; the rewrite was small and the second pass now matches pixel-for-pixel.

### 2. Sketch trip's `.chassis` wrapper moved to `SketchTripShell`
Previously the trip page wrapped the sketch render in `<div className="chassis" data-theme={...}>`; the shell sat inside that. Phase 6 moved the wrapper into `SketchTripShell` itself so the theme picker can mutate `data-theme` via React state and have CSS cascade pick it up without going through the page-level render. **Why:** the picker preview-in-place mechanic depends on a single React-owned wrapper; double-wrapping would shadow the data-theme attribute.

### 3. Crew subsurface row subtext degrades gracefully
The lexicon has copy for invite-tracking states the DB doesn't track yet (opened/unopened, decline reason, plus-one name). Chosen: graceful fallback — use what we have (`updated_at`, `plus_one: boolean`), skip what we don't. **Why:** rendering literal "hasn't opened the invite" copy without actually knowing would mislead. The Session 3 DB work adds the missing columns; subtext upgrades automatically once they're in.

### 4. `getTrip` extracted to `_data.ts` instead of duplicated
The crew subsurface needs the same Supabase query as the trip page. Extracted into `src/app/trip/[slug]/_data.ts`. **Why:** Next.js request-scoped dedupes the query for free, so co-locating beats either copy-pasting or wiring a context provider. The leading underscore keeps it out of the route table.

### 5. `GuestList` left in place as dead code (matches Session 1 pattern)
Phase 9 stops importing `GuestList.tsx` but doesn't delete it, the same way Session 1 left `AuthFlow.tsx` and friends. **Why:** the dead-code sweep is a single batched commit at the end of Session 2/3 (per Session 1 release notes §189) — keeping each phase commit small and reversible is more valuable than scattering deletes.

### 6. Phase 10 (Buzz feed) deferred to Session 3
The original Session 2 roadmap was Phases 4, 5, 6, 9, 10. We shipped 4, 5, 6, 9. **Why:** the four committed phases consumed the session budget. Buzz is a fresh subsurface in the same shape as crew (`/trip/[slug]/buzz`, replaces `ActivityFeed`, pulls `buzz.ts`) — the crew implementation is a clean template for it.

---

## Spec deviations worth flagging

- **Theme picker entry surface is the sketch trip itself, not a standalone screen.** The mockup shows the picker as a full-screen sheet; we honor that, but the entry button (`pick the vibe`) lives on the sketch trip and the auto-open uses `?first=1` rather than a dedicated route. There is no `/trip/[slug]/theme` URL.
- **Crew subsurface has no edit affordances.** Read-only per §5.25. Adding/removing members happens in the builder. Nudge buttons are not yet a feature anywhere.
- **Crew subsurface "pending" bucket invented its own lexicon keys.** `crew.section.pending` / `crew.caption.pending` / `crew.emptyStatePending` did not exist in the lexicon — added them in this phase. They are additive (no existing key changed) and follow the same shape as the in/holding/out triple.
- **`commitTripTheme` and the `?first=1` auto-open are unverified end-to-end** because the dev browser session has no Supabase auth. The state machine, error surfacing, server-action wiring, and CSS cascade are all verified; only the authenticated DB write and the post-creation redirect were not exercised. The code path mirrors `updateTripSketch` (proven in Phase 4).
- **Crew subsurface is unverified end-to-end** for the same reason. Auth gating (sketch redirect, unauth redirect) returns 307 cleanly via direct `curl`; the rendered body is not browser-validated. Server logs are clean on every navigation tested.
- **`themeCategories` mapping is best-guess.** Filter pills work, but the assignment of each theme to `weekends / big trips / milestones / chill` is product-call territory. Easy to retune in `src/lib/themes/categories.ts` if you have stronger opinions.
- **Lexicon orphan tagline keys:** `bachWeekendGuys` and `girlsTrip` exist in the theme lexicon with no matching chassis ID; `desert-trip` and `camping-trip` have no lexicon tagline entry. Both fall back to the registry `theme.vibe`. Flagged in Phase 6 plan; not addressed here.
- **Migration 007's 6 new theme gradients are still placeholders.** Session 3 DB work.
- **`EditorToolbar` still has its own inline `ThemePanel` (3-col grid) for the `/edit/[id]` admin path.** That path is being retired so we left it untouched.

---

## Surfaces NOT touched this session

The Session 3 roadmap from `SESSION-1-RELEASE.md` carries forward unchanged, plus Buzz which slipped from Session 2.

| Session | Surface | Lexicon stub | V0 code still live |
|---|---|---|---|
| 3 | Buzz feed (§5.26) | `buzz.ts` (populated) | `src/components/trip/ActivityFeed.tsx` |
| 3 | Dashboard | `dashboard.ts` | `src/components/dashboard/Dashboard.tsx` |
| 3 | Extras drawer | `extras.ts` (populated, read-only on trip page) | `src/components/trip/ExtrasSections.tsx` |
| 3 | Lodging voting write-side | `lodging-voting.ts` (populated, read-only) | `LodgingGallery.tsx` renders votes as-is |
| 3 | Passport (§5.15) | `passport.ts` | none yet |
| 3 | Lock flow | `lock-flow.ts` | partially in `src/components/editor/EditorToolbar.tsx` |

---

## Open questions / blockers

1. **`?first=1` auto-open and `commitTripTheme` need an authed run-through.** Both are wired and the state machine is verified, but the actual Supabase writes have not been exercised against a real session. Lowest-friction validation: create a trip via `/create` while signed in and watch the picker open + lock the vibe.
2. **Crew subsurface row rendering needs an authed eyeball pass.** Same reason. Direct curls confirm 307 redirects on the auth gate; an authed `/trip/<slug>/crew` view should confirm Shrikhand title, four sections in order, organizer 👑, viewer "you" tag, and the `formatDistanceToNow` subtext.
3. **`invite_opened_at`, `decline_reason`, `plus_one_name` columns** — needed before crew row subtext can show the full lexicon vocabulary. Batch with the Session 3 schema work (`003_holding_rsvp.sql` + `chassis_theme_id`).
4. **Migration 007 placeholder gradients.** Trips against the 6 new themes (Boys Trip, Reunion, Festival, Desert, Camping, Tropical) still render fallback values until the gradients are filled in. Session 3 DB pass.
5. **Phase 10 (Buzz feed)** needs to slot into Session 3 ahead of dashboard work since both consume the same `Comment` data.

---

## How to verify

End-to-end checks after pulling this branch.

### Build + types
```sh
npm run build         # should complete
npx tsc --noEmit      # silent
```

### Phase 4 — Builder
1. While signed in, visit `/create`, fill in the trip form, submit.
2. You should land on `/trip/<slug>?first=1` with the chassis sketch shell rendered (NOT the legacy `/edit/[id]` view).
3. The theme picker sheet should auto-open. (See Phase 6 below.)
4. Close the sheet. Click the trip name → it becomes an input. Type a new name and blur. Network tab: a 500ms-debounced POST to the `update-trip-sketch` action with the patch.
5. The sticky bar CTA stays disabled until you add at least one non-organizer member via `SketchCrewField`.

### Phase 5 — Invitee pre-login
1. Open an incognito window. Visit a non-sketch trip URL (e.g. `/trip/zVf9nvgG`).
2. You should see the postcard hero + countdown + going row in full color, with the plan summary blurred behind an overlay pill.
3. Sticky bar bottom: a pulsing `see the plan →` link to `/auth?trip=<slug>` plus a soft-decline `can't make it` button.
4. Tap `can't make it` → confirm modal interpolates the inviter's first name. Confirm fires no DB write (the viewer has no identity).

### Phase 6 — Theme picker
1. On a sketch trip, click `pick the vibe`. Sheet opens with 17 tiles + 5 filter pills.
2. Tap `milestones` — the visible set narrows to 3 tiles (Bachelorette, Birthday trip, Reunion weekend).
3. Tap a tile — the chassis re-themes instantly (background, ink, accent, sticker color all swap). The sheet's own portal chassis re-themes too. The CTA flips to `lock the vibe →`.
4. Hit Esc — sheet closes, chassis reverts to the committed theme.
5. With a tile previewed, click `lock the vibe →` — the server action persists, the sheet closes, the new theme is now committed.

### Phase 9 — Crew subsurface
1. On a non-sketch trip, scroll to where `GuestList` used to live. There's a centered `the crew →` pill instead.
2. Tap it. You land on `/trip/<slug>/crew` with:
   - Back-link top-left, Shrikhand title, Caveat subtitle with `N rallied · <trip_name>`.
   - Three summary tally pills (`X in · X holding · X out`).
   - Four sections in order: `in / holding / out / pending` with section title + caption + member rows OR the empty-state line.
   - Organizer row has 👑, viewer's own row has "you".
3. Direct-load `/trip/<sketch_slug>/crew` → 307 redirect to `/trip/<sketch_slug>` (sketch gate).
4. Direct-load `/trip/<non_sketch_slug>/crew` in an incognito window → 307 redirect to `/trip/<non_sketch_slug>` (unauth gate).

### Regression check for legacy surfaces
- `/edit/[id]` still loads — `EditorToolbar` inline ThemePanel kept for the admin path until that path is retired in Session 3.
- Dashboard `/` still loads. Visually untouched from v0 — Session 3.

---

## Next session preview (Session 3)

Per the kickoff roadmap plus the items that slipped from Session 2.

- **Phase 10 — Buzz feed.** `/trip/<slug>/buzz` reverse-chron mixed feed (system events + short posts). Replaces `ActivityFeed` on the trip page with a link. Pulls `buzz.ts` (already populated). The crew implementation in this session is a clean template — same `_data.ts` loader, same `redirect()` gate shape, same chassis-styled subsurface block in `globals.css`.
- **Dashboard.** Pulls `dashboard.ts`. Replaces `src/components/dashboard/Dashboard.tsx`.
- **Passport (§5.15).** New surface, no v0 predecessor.
- **Extras drawer.** Replaces `src/components/trip/ExtrasSections.tsx`. Lexicon already populated.
- **Lodging voting write-side.** Wires the existing `LodgingGallery` votes display to a server action; lexicon already populated.
- **Lock flow.** Pulls the lock-deadline + commit ceremony copy out of `EditorToolbar` and into a chassis-styled flow.
- **DB migration bundle:** `003_holding_rsvp.sql` (extends rsvp_status enum, backfills `'maybe'` → `'holding'`, drops the boundary mappers), the `chassis_theme_id` column on `trips`, the missing `invite_opened_at` / `decline_reason` / `plus_one_name` columns, the 6 new theme seeds + Migration 007 gradient backfill.
- **Dead-code sweep:** delete `GuestList.tsx` (orphaned this session), `AuthFlow.tsx`, `Countdown.tsx`, `StickyRsvpBar.tsx`, `CoverHeader.tsx`, `CollageAvatars.tsx`, `LodgingCarousel.tsx`, `ThemePicker.tsx` (already deleted in Phase 6), and the legacy `/edit/[id]` admin path.
- **Motion pass + a11y sweep + deploy.**

---

## Commits

```
2ad91e6 Session 2 Phase 9: crew subsurface
615154f Session 2 Phase 6: theme picker sheet
55d446b Session 2 Phase 5: invitee pre-login state
a80edbc Session 1 + 2 Phase 4: chassis rebuild + trip builder
```

**Files changed:** see `git diff --stat 19dad9e..HEAD` for the full list across all four commits. No DB migrations ran this session — `003_holding_rsvp.sql` and `chassis_theme_id` are still pending Session 3.
