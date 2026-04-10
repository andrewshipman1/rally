# Rally — Session 3 Master Scope

**Status:** 3A ✅ 3B ✅ 3C next · **Date:** April 2026 · **Source-of-truth for:** everything left between Session 2 and v0 launch.

This document consolidates every deferred item from Sessions 1 and 2 plus the originally-planned Session 3 work. It's the single reference that the 3A/3B/3C/3D sub-session prompts link back to. If an item isn't listed here, it isn't in Session 3 scope.

## Why this is broken into 4 sub-sessions

The original Session 3 was specced as one session covering phases 3, 3.5, 7, 8, plus the DB migration, legacy cleanup, motion pass, a11y, rate-limit Redis swap, and deploy. That's two sessions' worth of work. Session 2 also slipped Phase 10 (Buzz) onto the pile and added its own deferred tail.

Instead of one mega-session that will blow context or force Claude Code into shortcuts, Session 3 is four sub-sessions in dependency order:

| Sub | Focus | Status | Why it's here |
|---|---|---|---|
| **3A** | DB bundle + Session 2 debt | ✅ Shipped (`66b0ab0`, `f8c63c6`) | Everything downstream depends on schema state + Session 2 surfaces being verified end-to-end |
| **3B** | Buzz + Dashboard + Passport | ✅ Shipped (`c104bf3`, `eb547eb`) | Three read-heavy surfaces that share the crew subsurface pattern |
| **3C** | Extras + Lodging voting + Lock flow | **Next** | Three write-side workflows that depend on 3A's schema changes |
| **3D** | Sweep + motion + a11y + deploy | Blocked on 3C | Final polish pass. Cannot start until 3A–3C are green. |

Each sub-session is its own fresh Claude Code session with its own kickoff prompt, file-read allowlist, and checkpoint discipline.

## Guardrails (apply to all four sub-sessions)

1. **Fresh Claude Code session per sub.** Do not chain 3A → 3B in the same session — context will balloon and the subagent delegation pattern that's been working breaks down.
2. **Preflight file read allowlists.** Each prompt specifies exactly which files to read. Do not read phase HTMLs outside the sub's scope. If Claude Code thinks it needs more, it stops and asks.
3. **Checkpoint after every atomic task, not just every phase.** For the DB bundle specifically, checkpoint after each migration file lands.
4. **30-minute rule on deferrals.** If a deferred item would take under 30 minutes to close, it's not real debt — close it. Any deferral must justify why it's >30 min work.
5. **Commit discipline.** One phase, one commit. No mega-commits. Session 2's `a80edbc` bundling Session 1 + Phase 4 was a one-time exception; do not repeat.
6. **No surface work until `tsc --noEmit` is clean on the current branch.** Debt compounds when types drift.

## Complete item inventory

### 3A — DB bundle + Session 2 debt cleanup ✅

**Shipped in commits `66b0ab0` and `f8c63c6`.** Full details in `SESSION-3-RELEASE.md`.

**Schema migrations shipped (5 total, numbered 008–012 at runtime):**

1. ✅ **Migration 008 — `holding_rsvp.sql`** — Extended `rsvp_status` enum to `'in' | 'holding' | 'out' | 'pending'` (added `'holding'`, dropped `'maybe'`, backfilled all rows). Follow-up `f8c63c6` fixed a Postgres cast error by dropping column default before enum type swap.
2. ✅ **Migration 009 — `session3_columns.sql`** — Added `trips.chassis_theme_id` (text, nullable) and `trip_members.invite_opened_at` (timestamptz, nullable).
3. ✅ **Migration 010 — `theme_backfill.sql`** — Backfilled `chassis_theme_id` on existing trips from `themes.template_name`. Seeded 6 new theme rows (Boys Trip, Reunion, Festival, Desert, Camping, Tropical).
4. ✅ **Migration 011 — `auth_rate_limits.sql`** — DB-backed rate limiting table. `src/lib/auth/rate-limit.ts` rewritten to use it. In-memory map deleted.
5. ✅ **Migration 012 — `activity_log.sql`** — *(Landed in 3B commit but is foundation work.)* Notification-grade event log: `id`, `trip_id`, `actor_id`, `event_type`, `target_id`/`target_type` (polymorphic FK), `metadata` (jsonb), `is_read`, `created_at`. 4 indexes (trip+time, actor, event_type, unread). 13 event types defined in `ActivityEventType`. **No writers yet — 3C server actions must INSERT into this table.**

**Code changes shipped:**

6. ✅ **Boundary mapper deleted.** `dbRsvpToRally()` / `rallyRsvpToDb()` removed from all consumers (RSVP route, crew page, guest list, invitee shell, sticky bar, RsvpSection). Test suite deleted.
7. ✅ **Crew subtext wired.** Implemented lexicon §5.25 vocabulary (`rowSubOpened`, `rowSubUnopened`, `rowSubOutReason`, `plusOneSubtext`) using `invite_opened_at`, `decline_reason`, `plus_one_name` columns.
8. ✅ **Phase 5 inviter row + eyebrow.** `inviteeOverride` slot added to `PostcardHero`. Wired `"{inviter_first} called you up"` and `"★ for {trip_title_short}"` per lexicon §5.17.
9. ✅ **Orphan lexicon keys reconciled.** camelCase keys renamed to kebab-case per D3. Missing entries added for `desert-trip` and `camping-trip`.
10. ✅ **`themeCategories` mapping locked** per D2 spec (weekends, big-trips, milestones, chill, all with intentional double-exposure).
11. ✅ **Shared phase utilities.** `isTripDone()` and `computeRallyPhase()` extracted to `src/lib/rally-types.ts` for dashboard + passport reuse.
12. ✅ **Theme picker fixes.** Tile border + shadow styling, category mapping, PostcardHero gradient overlay logic.

**E2E verification:** All three checks passed (theme commit persistence, crew subsurface, Phase 5 invitee state).

**Note for 3C:** Migration numbering in the kickoff prompts (e.g., `003_holding_rsvp.sql`) is stale — Claude Code assigned 008–012 at runtime. The actual migration files in `supabase/migrations/` are the source of truth.

### 3B — Buzz + Dashboard + Passport ✅

**Shipped in commits `c104bf3` and `eb547eb`.** Full details in `SESSION-3-RELEASE.md`. ~450 lines of new CSS in `globals.css`.

13. ✅ **Phase 10 — Buzz feed** (`/trip/[slug]/buzz`). RSC with auth gate. `getBuzzFeed()` merges `activity_log` events + `comments` into `BuzzDay[]` grouped by calendar day. Event rows (icon + flat text), post rows (chat bubbles, `.mine` flipped right). Reactions display-only (`pointer-events: none`). Compose bar rendered but disabled. Trip page `<ActivityFeed>` replaced with `<Link>` to buzz route. **Note:** `activity_log` has zero rows until 3C wires INSERT paths — feed currently shows only comments.
14. ✅ **Phase 3 — Dashboard rebuild** (`/`). Full RSC rewrite from legacy client component. Auth gate. Per-card theming via nested `.chassis` `data-theme` wrappers using `chassis_theme_id`. Scoreboard chips (phase counts), phase sections, rally meter (sell-state), avatar pile, sticky CTA, empty state. `computeRallyPhase()` from 3A used for card phase assignment.
15. ✅ **Phase 3.5 — Passport page** (`/passport`). New surface. Profile head, stat strip (3 Shrikhand numbers with colored drop shadows), 2-col stamp grid (per-trip `data-theme`, CSS rotation), ride-or-dies leaderboard, empty states. 4 queries in `src/lib/passport.ts`. **Note:** no nav link to `/passport` exists yet — needs a nav element in 3D or v0.1.

**Design QA — Avatar contrast fix (`eb547eb`):**

Extracted base `.chassis .av` rule so all surfaces inherit the avatar primitive (width, height, border-radius, font, `color: var(--ink)`). Dashboard, passport, and buzz avatars were rendering white initials on light-themed cards. Fixed by ensuring all avatar initials use `var(--ink)` instead of browser-default color. This fix prompted a new hard rule: **inside any `[data-theme]` container, text color must use theme-aware CSS custom properties (`var(--ink)`, `var(--on-surface)`, `var(--accent)`) — never hardcoded white or `#fff`.** Rule is now documented in `rally-theme-content-system.md` and the 3B kickoff prompt.

**Spec deviations to know about:**

- Buzz feed shows only comments until 3C wires `activity_log` INSERT paths.
- Dashboard "done" computation is time-based (`isTripDone`: phase='go' AND date_end + 30 days < now), not an explicit "mark as done" action.
- Passport country count is best-effort (parses `trip.destination` by comma, takes last segment).
- Passport "ride or dies" only counts shared *done* trips.
- Buzz compose/reactions write paths may slip to v0.1 — see 3C kickoff.

### 3C — Extras + Lodging voting + Lock flow *(next)*

**Prerequisites confirmed:** 3A schema landed (migrations 008–012), 3B surfaces green, `tsc --noEmit` clean. Kickoff prompt: `claude-code-kickoff-3c-extras-voting-lock.md`.

**Critical cross-cutting requirement for all 3C server actions:** Every server action that represents a user-visible event (RSVP change, vote cast, lodging locked, phase transition, extra added) **must INSERT into `activity_log`** alongside its primary write. The 13 event types are defined in `ActivityEventType` (`src/types/index.ts`). Until this is wired, the buzz feed only shows comments. This is not optional — the table was designed as notification infrastructure, not just buzz data.

**Hard rule reminder:** Inside any `[data-theme]` container, text color must use `var(--ink)` / `var(--on-surface)` / `var(--accent)` — never hardcoded white or `#fff`. See `rally-theme-content-system.md` §0.

16. **Phase 7 — Extras drawer write-side.** Wire the four extras (packing list, playlist URL, house rules text, shared album link) to server actions. Lexicon §5.21 is already populated. Read-only renderer exists; add the write path.
17. **Phase 8 — Lodging voting write-side.** Wire the existing `LodgingGallery` votes display to server actions (cast vote, change vote, organizer locks winner). Lexicon §5.20 is already populated. `LodgingGallery` currently renders vote counts read-only — no voting UI.
18. **Lock flow.** Organizer-only workflow for the sketch → sell → lock phase transition. Includes the cutoff date requirement gate, the "lock it in" ceremony, the T-3 / T-0 deadline nudges (§5.18), and the post-lock confirmation. Pull copy out of `EditorToolbar` into a chassis-styled flow. Lexicon §5.9 covers the lock flow strings.

**Open question for 3C:** Buzz compose + reactions write paths. The 3C kickoff says these "will either land in 3C as a late add or slip to v0.1." Decide at 3C checkpoint 1 whether there's time. If deferred, the compose bar stays disabled and reactions stay `pointer-events: none`.

### 3D — Sweep + motion + a11y + deploy

**Blocked on 3C.** Cannot start until all 3C write-side workflows are green.

19. **Dead-code sweep.** Delete in one batched commit: `GuestList.tsx`, `AuthFlow.tsx`, `Countdown.tsx`, `StickyRsvpBar.tsx`, `CoverHeader.tsx`, `CollageAvatars.tsx`, `LodgingCarousel.tsx`, `ActivityFeed.tsx`, `Dashboard.tsx` (legacy), `ExtrasSections.tsx` (if replaced in 3C), the legacy `/edit/[id]` admin path, and `EditorToolbar`'s inline `ThemePanel`.
20. **Legacy lint cleanup.** The `react/jsx-no-literals` warnings Session 1 wired up should be zero by the end of 3D. Any legacy component still warning gets its strings swept into `copy.ts` or the component itself gets deleted.
21. **Motion pass.** Scroll-triggered fade-ins on each trip page section (staggered), hero text load animation, avatar pop-in, countdown pulse, RSVP confetti, date poll selection scale, guest list slide-in. See original `claude-code-all-prompts.md` Prompt 10 in `_archive/` for the list.
22. **A11y sweep.** Focus states on every interactive element, `aria-label` on icon-only buttons, keyboard navigation for the theme picker sheet, contrast audit on all 17 themes, screen-reader pass on the blurred locked-plan state.
23. **Final QA pass.** Run through every surface with a real authed session. Compare each to its phase HTML spec side-by-side. Fix visual drift. Include regression check on all shipped surfaces (trip page, auth, buzz, dashboard, passport, crew, builder, invitee, theme picker).
24. **Navigation to `/passport`.** Page exists but no link from dashboard or trip pages. Add a nav element (profile icon or similar).
25. **Resend SMTP setup.** Per D1: custom email templates + custom Site URL configured during 3D.
26. **`DEPLOY.md` runbook.** Per D4: 3D writes the deploy runbook.
27. **Deploy.** Vercel direct to prod per D4. Requires: Resend configured, no `tsc` errors, no lint warnings, all items above closed. Mitigations: rigorous final QA, immediate post-deploy smoke test, Supabase point-in-time recovery confirmed on.

## Open decisions Andrew owes before the sub-sessions can finish

| # | Decision | Blocks | Default if undecided |
|---|---|---|---|
| D1 | ~~`auth-backend-confirm` — Supabase Auth vs. Clerk vs. Resend-only custom vs. other~~ **LOCKED 2026-04-08** — Supabase Auth with Resend plugged in as the SMTP provider. Custom email templates + custom Site URL configured during 3D. Resend setup is a 3D task, not post-launch. | 3D deploy | — |
| D2 | ~~Does the `themeCategories` mapping above match product intent, or do you want to retune?~~ **LOCKED 2026-04-08** — mapping above is confirmed, double-exposure is intentional, chill stays lean. | 3A item 8 | — |
| D3 | ~~Naming convention for theme keys across lexicon + registry — chassis-id kebab-case or camelCase?~~ **LOCKED 2026-04-08** — chassis-id kebab-case everywhere. Lexicon keys conform to the chassis registry, not the other way around. | 3A item 7 | — |
| D4 | ~~Does Session 3 ship to production, or is 3D deploy → staging and a separate session handles prod?~~ **LOCKED 2026-04-08** — 3D deploys direct to prod for v0. No Supabase staging project exists yet, and standing one up is v0.1 scope. Mitigations: rigorous final QA in section 5, immediate post-deploy smoke test as first real user, confirm Supabase point-in-time recovery is on, and 3D writes `DEPLOY.md` as the runbook. Staging environment is a v0.1 task. | 3D scope | — |
| D5 | ~~Theme-aware text colors inside `[data-theme]` containers — hard rule or guideline?~~ **LOCKED 2026-04-09** — Hard rule. Every text element and avatar initial inside a `[data-theme]` container must use `var(--ink)` / `var(--on-surface)` / `var(--accent)` — never hardcoded white or `#fff`. Light-themed palettes make white text invisible. Documented in `rally-theme-content-system.md` §0 and 3A/3B kickoff prompts. | All sessions | — |

## What's NOT in Session 3 (explicit out-of-scope)

- SMS auth, Google / Apple SSO, phone-based account recovery — all v1.
- Push notifications — v1.
- Analytics instrumentation beyond basic Vercel pageviews — v0.1.
- Device / session management UI — v2.
- OG image generation for link previews — can be bundled into 3D if time permits, otherwise v0.1.
- Landing page (the marketing site) — separate project.
- Brand book consolidation — post-handoff deliverable.
- Investor pitch deck — post-handoff deliverable.

## Estimated timeline

3A and 3B each landed in a single Claude Code session as planned. **Remaining: 3C (1 session) + 3D (1 session).** 3C is write-side wiring only — lower risk of scope expansion than the surface-building sessions. 3D is the final sweep and deploy.

## File map

| File | Purpose |
|---|---|
| `session-3-master-scope.md` | This file — the single reference |
| `claude-code-kickoff-3a-db-cleanup.md` | Sub-session 3A prompt |
| `claude-code-kickoff-3b-buzz-dashboard-passport.md` | Sub-session 3B prompt |
| `claude-code-kickoff-3c-extras-voting-lock.md` | Sub-session 3C prompt |
| `claude-code-kickoff-3d-sweep-deploy.md` | Sub-session 3D prompt |

Each sub-session prompt is self-contained and references this scope doc by filename for anything it needs to cross-reference.
