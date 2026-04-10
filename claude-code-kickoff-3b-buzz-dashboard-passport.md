# Rally — Claude Code Kickoff, Session 3B (Buzz + Dashboard + Passport)

**Paste this as your opening prompt in a fresh Claude Code session.** Session 3A must be fully closed before you start this. If `tsc --noEmit` is not clean or any 3A task is open, stop and finish 3A first.

---

## Context

Session 3A shipped: the DB bundle (003_holding_rsvp, 008 columns, 007 palette backfill), boundary mapper deletion, crew subtext wiring, Phase 5 invitee fix, orphan lexicon keys, retuned theme categories, E2E verification, and the Supabase-backed rate limiter.

Your job this session (**3B**) is three read-heavy surfaces that share the crew subsurface pattern from Session 2:

- **Phase 10 — Buzz feed** (`/trip/[slug]/buzz`)
- **Phase 3 — Dashboard rebuild** (`/dashboard` or `/`)
- **Phase 3.5 — Passport page** (new surface, no v0 predecessor)

All three templates off the Session 2 crew subsurface: same `_data.ts` loader pattern, same `redirect()` gate for unauth, same chassis-styled subsurface block in `globals.css`. If you find yourself writing new chassis primitives, you're doing it wrong — reuse.

The master plan lives in `session-3-master-scope.md`. Read it for context on what's in 3C and 3D so you don't accidentally step into their scope.

## Before you write a single line of code

### Preflight 1 — Read the surfaces you're touching

Read these files fully. Nothing else.

1. `session-3-master-scope.md` — specifically the **3B section**.
2. `SESSION-1-RELEASE.md` + `SESSION-2-RELEASE.md` — know what's shipped.
3. `rally-microcopy-lexicon-v0.md` — only §5.15 (passport), §5.26 (buzz), and the dashboard section (check the table of contents). Do not read the whole file.
4. `rally-phase-3-dashboard.html`
5. `rally-phase-3-5-passport.html`
6. `rally-phase-10-activity.html`
7. `src/app/trip/[slug]/crew/page.tsx` — **this is your template.** Read its `_data.ts` loader, the subsurface CSS class it uses from `globals.css`, and the auth gate pattern.
8. `src/lib/buzz.ts` — already populated by Session 2. Confirm the events and posts it exposes.

After reading, give me a 5-bullet summary: the crew pattern you're copying, the shape of `buzz.ts`, the new data access needed for dashboard and passport, any chassis primitive gap, and any lexicon key gap.

### Preflight 2 — Verify Session 3A actually landed

Before writing any surface code, confirm:

- `trips.chassis_theme_id` exists and has real values (not null) for at least one seeded trip.
- `rsvp_status` enum has `'holding'` and does not have `'maybe'`.
- No `dbRsvpToRally` / `rallyRsvpToDb` references remain (grep).
- `tsc --noEmit` is clean on the current branch.

If any of these fail, stop and report. Do not work around them.

## Hard rules

1. **No inline user-facing strings.** Everything through `copy.ts`.
2. **Theme variables only.** No hardcoded colors.
3. **Reuse the crew subsurface template.** Do not rebuild the loader / gate / subsurface block pattern from scratch.
4. **Dashboard trip cards use `chassis_theme_id`** (from 3A) to theme each card. This is what 3A's schema work was for.
5. **Theme-aware text colors only inside `[data-theme]` containers.** Every text element and avatar initial inside a themed container MUST use `var(--ink)`, `var(--on-surface)`, or `var(--accent)` — never hardcoded `white`, `#fff`, or any fixed light color. Dashboard cards and passport stamps can resolve to light-themed palettes (e.g., `just-because`, `birthday-trip`) where white text becomes invisible. `--ink` is set per theme to guarantee contrast against `--bg`. **If text sits inside a `[data-theme]` container, its color comes from a CSS custom property.**
6. **Checkpoint after every surface**, not after all three.
6. **30-minute rule on deferrals.** If it's <30 min, close it.
7. **No write-side work.** All three surfaces this session are read-only. If you find yourself wiring a server action, you're in 3C scope. Stop.

## This session's scope (3B — Buzz + Dashboard + Passport)

### Surface 1 — Phase 10 Buzz feed

`/trip/[slug]/buzz` — reverse-chron mixed feed of system events + short chat posts. Replaces the `ActivityFeed.tsx` component on the trip page with a `the buzz →` link.

- Template off `src/app/trip/[slug]/crew/page.tsx`.
- `_data.ts` loader pulls from `src/lib/buzz.ts` (already populated).
- Two row types: **event** (flat text, sticker-colored icon, no bubble) and **post** (chat bubble, accent color if mine, flipped right if mine).
- Day dividers (today, yesterday, weekday + date).
- Event strings templated server-side from the activity log — lexicon §5.26 has the full list.
- Post content rendered as plain text. No markdown, no links, no media.
- Reactions display only — **the compose box and the "tap to react" write paths are 3C scope.** Read-only surface for this session. The compose box can render as a disabled placeholder.
- Replace `ActivityFeed.tsx` on the trip page with a `the buzz →` link to the new route.

**Checkpoint:** Open `/trip/<slug>/buzz` on a seeded trip with at least 5 events and 3 posts. Confirm the interleave, day dividers, and event string rendering. Screenshot and compare against `rally-phase-10-activity.html`.

### Surface 2 — Phase 3 Dashboard rebuild

`/dashboard` (or wherever the organizer's home lives today). Lists trips across phase states (sketch, sell, lock, go, done).

- Template off the crew subsurface (same chassis wrapper, same auth gate).
- Replaces `src/components/dashboard/Dashboard.tsx` (legacy).
- Pull strings from the dashboard lexicon section.
- Each trip card uses `chassis_theme_id` from the row to theme itself. This means each card renders with the chassis variables for that trip's theme — a Ski Chalet trip card looks different from a Beach Trip card.
- Section headers for each phase state. Empty states per lexicon.
- No create-new-trip flow work — that's the builder, it already exists.

**Checkpoint:** Seed a test user with at least one trip in each phase state. Open the dashboard. Confirm each card is themed correctly. Screenshot and compare against `rally-phase-3-dashboard.html`.

### Surface 3 — Phase 3.5 Passport

`/passport` or `/profile` — new surface, no v0 predecessor. This is a build from scratch, not a refactor.

- Template off the crew subsurface for the wrapper/gate.
- Sections (per `rally-phase-3-5-passport.html` and lexicon §5.15):
  - Profile head (avatar, name, handle)
  - Stat strip: Shrikhand numbers for trips / ride or dies / countries
  - Passport stamp grid (one stamp per completed trip)
  - Ride or dies leaderboard
  - Empty states for each section (new user has zero everything)
- New component: stamp card. Reuses theme variables.
- New query: stat aggregation (count distinct trips, count distinct co-travelers, count distinct destinations). Put this in `src/lib/passport.ts`.
- No editing — read-only v0. Profile edit is v0.1.

**Checkpoint:** Seed a user with varied trip history (completed + in-progress + zero state). Open the passport. Verify stat strip, stamp grid, leaderboard, and empty states all render. Screenshot and compare against `rally-phase-3-5-passport.html`.

### Final checkpoint

Stop. Tell me:

- What's built (files touched, files new).
- Any phase HTML deviations and why.
- Remaining 3B debt (must pass the 30-min rule).
- `tsc --noEmit` status + lint status.
- What new 3C/3D items surfaced.

## What's NOT in this session

Explicitly deferred to 3C or 3D. Do not touch:

- **Buzz compose + react write paths** — 3C (wires to server actions).
- **Phase 7 Extras drawer** — 3C.
- **Phase 8 Lodging voting write-side** — 3C.
- **Lock flow** — 3C.
- **Dead-code sweep** — 3D. Leave `ActivityFeed.tsx` in the tree; 3D deletes it in a batched commit. Just stop referencing it from the trip page.
- **Motion, a11y, deploy** — 3D.

## Start here

1. Run preflights 1–2. Report at each step.
2. Build Buzz → checkpoint → Dashboard → checkpoint → Passport → checkpoint → final checkpoint.
3. Do not chain.

**Begin with preflight 1.**
