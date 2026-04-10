# Rally — Claude Code Kickoff, Session 3A (DB bundle + Session 2 debt)

**Paste this as your opening prompt in a fresh Claude Code session.** Sessions 1 and 2 are complete. This is the first of four Session 3 sub-sessions. Do not attempt to do 3B, 3C, or 3D in this session — each has its own kickoff prompt and its own fresh context.

---

## Context

You are picking up a Rally redesign mid-build. Sessions 1 and 2 shipped the foundation + five surfaces (builder, invitee, theme picker, crew, and the trip page chassis). Session 2 left a specific pile of debt that must be closed before any new surface work can happen. That's your job this session.

**Session 3 has been broken into four sub-sessions.** This one (**3A**) is the foundation pass: schema migrations, code tied to those migrations, Session 2 deferrals, E2E verification, and the rate-limit storage swap. Everything downstream (3B buzz/dashboard/passport, 3C extras/voting/lock, 3D sweep/deploy) depends on 3A landing cleanly.

The master plan for all of Session 3 lives in `session-3-master-scope.md`. Read it first.

## Before you write a single line of code

Work through this preflight in order. Each step is mandatory. Report findings at each step before moving on.

### Preflight 1 — Read the scope doc, release notes, and the surfaces you're touching

Read these files fully. Nothing else. Do not read phase HTMLs outside this list — 3B, 3C, 3D have their own allowlists and reading ahead will balloon context.

1. `session-3-master-scope.md` — the master plan. Your work in this session is strictly the **3A section**. Everything else is out of scope.
2. `SESSION-1-RELEASE.md` — what Session 1 shipped and what debt it left.
3. `SESSION-2-RELEASE.md` — what Session 2 shipped, phase-by-phase deferrals, the 5 items from Phase 6 that slipped.
4. `rally-microcopy-lexicon-v0.md` — only §5.10 (RSVP lock), §5.17 (invitee inviter row + eyebrow), §5.25 (crew subtext vocabulary). Do not read the whole file.
5. `rally-phase-5-invitee.html` — for the Phase 5 inviter row + eyebrow fix.
6. `rally-phase-9-crew.html` — for the crew subtext wiring.
7. `rally-theme-content-system.md` — only the 6 themes Migration 007 shipped with placeholder gradients: Boys Trip, Reunion, Festival, Desert, Camping, Tropical. You're replacing their palettes with the real values from this doc.

After reading, give me a 5-bullet summary: what's in Session 2's deferred pile, what schema state you expect to find, what the boundary mapper looks like today, what the crew row is falling back to right now, and which 4 lexicon keys are orphaned.

### Preflight 2 — Verify schema state

Before writing any migration, inspect the current DB state:

1. List existing migration files in `supabase/migrations/`. Confirm the next free slot is 008 (or adjust if Session 2 took 008 already).
2. Dump the `rsvp_status` enum — confirm it still has `'maybe'` and does not yet have `'holding'`. If it already has `'holding'`, the migration has already landed and the boundary mapper is dead weight — skip straight to task 4.
3. List columns on `trips` and `trip_members` — confirm `chassis_theme_id`, `invite_opened_at`, `decline_reason`, `plus_one_name` do not yet exist.
4. Count rows where `rsvp_status = 'maybe'` in `trip_members` — this is what migration 003 is about to backfill. Report the count.

### Preflight 3 — `tsc --noEmit` and lint baseline

Run `tsc --noEmit` on the current branch. If there are errors, fix them before doing anything else. Session 2's kickoff required clean tsc at checkpoint; if it's not clean, Session 2 shipped with drift and that's task zero.

Run the linter. Record the warning count per file. At the end of 3A this number should not have grown.

## Hard rules (same as Sessions 1 and 2 — do not relax)

1. **No inline user-facing strings.** Everything through `copy.ts`.
2. **Theme variables only.** No hardcoded colors. Inside any `[data-theme]` container, text color must use `var(--ink)` / `var(--on-surface)` / `var(--accent)` — never hardcoded `white` or `#fff`. Light-themed palettes exist and white text on them is invisible. (This matters most in 3B's dashboard/passport, but set the pattern correctly now.)
3. **Chassis kebab-case** for theme IDs everywhere (see task 7).
4. **Checkpoint after every atomic task**, not just every phase. For migrations specifically, checkpoint after each migration file lands and has been applied.
5. **One task, one commit.** No mega-commits. If task 5 (crew subtext wiring) depends on task 2 (008 migration), they're still two commits.
6. **30-minute rule on deferrals.** If a deferred item would take under 30 minutes to close, it's not real debt — close it. Any deferral requires justification.
7. **Do not touch 3B/3C/3D scope.** If you find yourself editing `dashboard.ts`, the extras drawer, the lock flow, or the buzz feed, stop — you're out of scope for this session.

## This session's scope (3A — DB bundle + Session 2 debt cleanup)

Work through these in order. Checkpoint after each numbered task.

### Task 1 — `003_holding_rsvp.sql`

Write and apply a migration that:

- Adds `'holding'` to the `rsvp_status` enum.
- Backfills every row where `rsvp_status = 'maybe'` to `rsvp_status = 'holding'`.
- Drops `'maybe'` from the enum. (Postgres enum value removal is non-trivial — you may need to recreate the type. Do this carefully and test the rollback path on a scratch DB first.)

**Checkpoint:** Report row counts before/after, confirm the enum definition, run a SELECT against trip_members to verify no `'maybe'` rows remain.

### Task 2 — `008_session3_columns.sql` (or next free slot)

Add these columns:

- `trips.chassis_theme_id text` — the Session 1 chassis theme identifier. Distinct from the legacy `theme_id` foreign key. Nullable for now; backfill will come from the theme picker write path.
- `trip_members.invite_opened_at timestamptz` — set by the invitee page on first authed load.
- `trip_members.decline_reason text` — set when an invitee declines with a reason.
- `trip_members.plus_one_name text` — set when an invitee brings a +1.

**Checkpoint:** Confirm the columns exist, confirm they're nullable, confirm nothing crashed.

### Task 3 — Migration 007 backfill

Migration 007 shipped with placeholder gradients for 6 themes (Boys Trip, Reunion, Festival, Desert, Camping, Tropical). Pull the real palette values from `rally-theme-content-system.md` and write a new migration (or UPDATE statements if 007 hasn't been released) that replaces the placeholders.

**Checkpoint:** Screenshot the theme picker with all 17 tiles — confirm none of the 6 formerly-placeholder tiles look like gradient noise.

### Task 4 — Delete the RSVP boundary mapper

Session 2 was built against `dbRsvpToRally()` / `rallyRsvpToDb()` in `src/lib/rsvp-boundary.ts` (or similar). Once task 1 lands, these functions are dead weight.

- Delete the module.
- Delete the contract test suite Session 2 wrote (`src/lib/__tests__/rsvp-boundary.test.ts`).
- Find every consumer (grep for `dbRsvpToRally`, `rallyRsvpToDb`, `toLegacy`, `toNew`) and replace with direct use of the `'in' | 'holding' | 'out'` values.
- Run `tsc --noEmit`. Fix any fallout.

**Checkpoint:** Report file count touched, confirm no references remain, confirm the test suite is deleted.

### Task 5 — Wire crew row subtext to new columns

`src/app/trip/[slug]/crew/page.tsx` currently falls back to `formatDistanceToNow(updated_at)` for every row and ignores opened/unopened/decline reason entirely. After task 2, the columns exist. Implement the full lexicon §5.25 vocabulary:

- `rowSubOpened` — for invitees who opened but haven't RSVP'd
- `rowSubUnopened` — for invitees who haven't opened the link
- `rowSubOutReason` — for decliners with a reason
- `plusOneSubtext` — for +1 rows (nested under the inviter)

Do not show "anonymous" for +1s. Use the `plus_one_name` column.

**Checkpoint:** Open `/trip/<slug>/crew` on a seeded trip with rows in every state and verify the subtext populates correctly.

### Task 6 — Phase 5 inviter row + eyebrow

Session 2 deferred this as "Phase 5.5 polish." It is not polish — it's brand-critical copy (lexicon §5.17). Close it now.

- Add an `inviteeOverride` slot to `PostcardHero`, mirroring the existing `sketchOverrides` pattern.
- Wire `inviteeState.inviterRow` → `"{inviter_first} called you up"`.
- Wire `inviteeState.eyebrow` → `"★ for {trip_title_short}"`.
- Test in incognito on a seeded trip.

**Checkpoint:** Screenshot the pre-login invitee state and compare against `rally-phase-5-invitee.html`.

### Task 7 — Orphan lexicon keys

Four known mismatches between lexicon keys and chassis theme IDs:

- `bachWeekendGuys` — lexicon key has no matching chassis ID
- `girlsTrip` — same
- `desert-trip` — chassis ID has no lexicon tagline entry
- `camping-trip` — same

**Decision locked:** chassis-id kebab-case everywhere. Rename camelCase lexicon keys → kebab-case to match the chassis registry. Add missing lexicon entries for `desert-trip` and `camping-trip` using the taglines in `rally-theme-content-system.md`.

**Checkpoint:** Run the theme picker and confirm every tile has a tagline. Grep for any remaining camelCase theme key — should be zero.

### Task 8 — Retune `themeCategories` mapping

Current mapping is "best-guess" per Phase 6 notes. Lock as:

| Filter | Themes |
|---|---|
| weekends | ski-chalet, lake-weekend, city-weekend, wine-country, birthday-trip, just-because, bachelorette, bach-weekend |
| big-trips | euro-summer, beach-trip, tropical, festival, desert-trip, camping-trip |
| milestones | bachelorette, bach-weekend, couples-trip, reunion, birthday-trip |
| chill | wellness-retreat, lake-weekend, wine-country, couples-trip |
| all | (all 17) |

Overlap is intentional — filters are OR, not mutually exclusive. Bachelorette, bach-weekend, and birthday-trip double-expose in weekends + milestones.

**Checkpoint:** Run the theme picker, click each filter, verify the tile set matches the table above.

### Task 9 — E2E: authed `?first=1` + `commitTripTheme`

Create a trip via `/create` while signed in. Verify the theme picker opens, pick a non-default theme, lock it, reload the page, confirm persistence. Confirm `trips.chassis_theme_id` was written to the row.

### Task 10 — E2E: authed crew subsurface

Open `/trip/<slug>/crew` on a signed-in session with a trip that has members in every RSVP state plus at least one +1. Verify:

- Shrikhand title renders
- Four sections in order (summary, in, holding, out)
- Organizer row has 👑
- Viewer row has "you" tag
- Subtext populates from the new columns (task 5)

### Task 11 — E2E: authed Phase 5 invitee state post-fix

Open a trip in incognito, verify the new inviter row and eyebrow render correctly (task 6).

### Task 12 — Rate-limit storage → Supabase-backed

Session 1's in-memory rate limiter cannot survive a multi-instance deploy. Replace with a Supabase-backed store.

- New table: `auth_rate_limits` with columns `email text primary key`, `attempt_count int`, `window_started_at timestamptz`.
- Write-path: on each magic-link request, upsert into this table, compare against the 5/hour rule and the 30s cooldown.
- Read-path: the existing rate-limit check in the auth endpoint points at this table instead of the in-memory map.
- Delete the in-memory implementation.

**Checkpoint:** Simulate 6 requests in a row and verify the 6th is rejected. Wait 60 minutes (or fake the clock) and verify it resets.

### Task 13 — Session 3A final checkpoint

Stop. Tell me:

- What's built (files touched, files new, migrations applied).
- Any task that couldn't be closed and why (must pass the 30-min rule).
- `tsc --noEmit` status. Should be clean.
- Lint warning count delta from preflight 3. Should be zero or negative.
- Anything that surfaced that's now 3B/3C/3D scope.
- Whether the 4 E2E verifications (tasks 9–11) all passed.

## What's NOT in this session

Explicitly deferred to 3B/3C/3D. Do not touch:

- **Phase 10 Buzz feed** — 3B.
- **Phase 3 Dashboard rebuild** — 3B.
- **Phase 3.5 Passport** — 3B.
- **Phase 7 Extras write-side** — 3C.
- **Phase 8 Lodging voting write-side** — 3C.
- **Lock flow** — 3C.
- **Dead-code sweep** — 3D.
- **Motion, a11y, deploy** — 3D.

If you find yourself reading a file in those categories, you're off scope. Stop.

## Open blockers

- `TODO(prd): auth-backend-confirm` — not a 3A blocker, it's a 3D blocker.
- Decisions D1–D4 in `session-3-master-scope.md` — D2 and D3 are needed for tasks 7 and 8. The defaults in the master scope (kebab-case, mapping as written) are what this prompt assumes. If Andrew hasn't overridden them, proceed with defaults.

## Start here

1. Run preflights 1–3 in order. Report at each step.
2. After preflight 3 passes, start task 1.
3. Checkpoint after every task. Do not chain.

**Begin with preflight 1 — read the files listed and give me the 5-bullet summary.**
