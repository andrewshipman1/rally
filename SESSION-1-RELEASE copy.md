# Rally — Session 1 (Foundation) Release Notes

**Branch:** `main` · **Scope:** the foundation pass from the kickoff v2 prompt (chassis kernel, types, lexicon, auth, trip page). Share back to CoWork.

This session picked up from a previous timed-out run. Scaffolding for `src/lib/copy/`, `src/lib/themes/`, `src/lib/rally-types.ts`, and the 8 chassis vars in `globals.css` was already on disk. Session 1 finished what was started and delivered the end-to-end chassis on the trip page and auth flow.

---

## What shipped

### Chassis kernel
- `src/app/layout.tsx` — Shrikhand / Caveat / DM Sans / Instrument Serif loaded via `next/font/google`, exposed as `--font-display` / `--font-hand` / `--font-body` / `--font-serif`.
- `src/app/globals.css` — complete rewrite. All 17 `[data-theme="<id>"]` CSS blocks, the full primitive library (`.chassis .wordmark/.eyebrow/.title/.tagline/.countdown/.cd-flag/.cd-num/.cd-label/.going/.av/.sticky/.house/.marquee/.live-row`), postcard hero cover, smart-link source pill, lodging gallery grid, sticky three-state chips, poetic footer, the 11-keyframe motion kernel (`wiggle`, `wiggle-left`, `bounce`, `pulse-shadow`, `pop-in`, `pop-in-left`, `slide-up-bounce`, `pop-avatar`, `marquee-scroll`, `blink-dot`, `hover-wobble`), dual-mode wiring via `[data-mode="dark"]`, and a `prefers-reduced-motion` carve-out. Legacy animations preserved for un-rebuilt surfaces with a `DELETE IN SESSION 3` marker.

### Themes (17 of 17)
- `src/lib/themes/types.ts` — `Theme`, `ThemeId` union, `ThemePalette` (8 keys), `ThemeStrings`, `ThemeVars`, `Templated` (scaffolded in prior session, unchanged).
- `src/lib/themes/{just-because, bachelorette, boys-trip}.ts` — already existed.
- New: `birthday-trip, couples-trip, wellness-retreat, reunion-weekend, festival-run, beach-trip, ski-chalet, euro-summer, city-weekend, wine-country, lake-weekend, desert-trip, camping-trip, tropical`. Each with palette + full `ThemeStrings` pulled from `rally-theme-content-system.md` §03–§16.
- `src/lib/themes/index.ts` — all 17 registered in `themesById`; `getTheme()` is now total.
- `src/lib/themes/from-db.ts` — new mapper that translates the legacy DB `themes.template_name` to a chassis `ThemeId`. Used by the trip page render until the DB schema gains a `chassis_theme_id` column in Session 3.

### Lexicon (15 of 25 surfaces backfilled this session)
- **Populated:** `auth.ts` (§5.24), `rsvp.ts` (§5.10 + exported `RSVP_CHIP_ICONS` constant for the locked-global chip icons), `trip-page-shared.ts` (§5.4), `trip-page-{sketch,sell,lock,go}.ts` (§5.5–5.8), `common.ts`, `errors.ts` (§5.12), `toasts.ts` (§5.13), `cutoff.ts` (§5.19), `nudges.ts` (§5.18), `lodging-voting.ts` (§5.20), `extras.ts` (§5.21), `emails.ts` (§5.14).
- **New:** `src/lib/copy.global.ts` — `globalCopy.footer.madeWith` + `globalCopy.shareLink.copy` per kickoff §3.
- **Stubbed (Session 2/3):** `dashboard.ts, create-trip.ts, landing.ts, passport.ts, builder-state.ts, invitee-state.ts, theme-picker.ts, crew.ts, buzz.ts, lock-flow.ts, empty-states.ts` — still `Record<string, Templated> = {}` per plan.

### Auth (phase 11)
- `src/lib/auth/provider.ts` — new `AuthProvider` interface: `sendMagicLink / verifyMagicLink / getSession / signOut`. Provider-agnostic per `TODO(prd):auth-backend-confirm`.
- `src/lib/auth/supabase-provider.ts` — `SupabaseAuthProvider` wrapping the existing `@supabase/ssr` client. Handles new-vs-returning user detection via the `users` table. One default export (`authProvider`) — swap this line to change the backend.
- `src/lib/auth/rate-limit.ts` — in-memory limiter enforcing 30s cooldown + 5 sends/email/hour. Flagged as needing Redis/Supabase-backed storage for multi-instance production deploys.
- `src/app/api/auth/magic-link/route.ts` — new POST endpoint. Zod-validated email. Checks the limiter BEFORE hitting the provider so every backend honors the same constraints.
- `src/app/auth/callback/route.ts` — rewritten to route through the provider interface. Returns `/auth/expired`, `/auth/invalid`, `/auth/setup`, `/trip/<slug>`, or `/` depending on result + trip param.
- `src/app/auth/{page,expired/page,invalid/page}.tsx` — three route pages mounting the new `AuthSurface` with the right state.
- `src/components/auth/AuthSurface.tsx` + `auth-surface.css` — the phase 11 four-state UI (landing → sent → expired → invalid). Cream/ink light mode only per spec. All copy via `getCopy('auth.*')`. 30s cooldown wired with `useEffect` interval, hydration-safe (initial `0`, set only on mount). Submits `{ email, trip }` to preserve invite targets through the magic-link round trip.
- `src/lib/guest-auth.ts` — `MAX_AGE` tightened from 90 days to 30 days rolling. New `refreshGuestCookie()` helper; the trip page calls it on every authenticated hit so active users never drop.
- **Left in place for now:** the old `src/components/auth/AuthFlow.tsx` and `src/app/auth/setup/page.tsx` (profile setup). The new signin route no longer uses `AuthFlow`; it's dead code but left untouched to keep the diff focused. Delete in Session 2.

### Trip page
- `src/app/trip/[slug]/page.tsx` — rewritten. Wraps the whole surface in `<div className="chassis" data-theme={chassisThemeIdFromTemplate(...)}>`, mounts the new chassis primitives at the top, keeps the carry-over typed component cards intact inside the chassis scope. Boundary mappers (`dbRsvpToRally`) translate the viewer's RSVP to `'holding'` at render time; the sticky bar maps back via `rallyRsvpToDb` on submit. All Session 1 strings come from `getCopy(themeId, ...)`.
- New components:
  - `PostcardHero.tsx` — marquee strip + header with wordmark/eyebrow/title/tagline/sticker, edge-to-edge cover image, phase-driven sticker/eyebrow copy.
  - `ChassisCountdown.tsx` — single big day number + accent flag, hydration-safe (`useState(null)` → `useEffect`, renders `--` during SSR).
  - `LodgingGallery.tsx` — chassis `.house` cards in a grid (2-col on ≥480px), replaces the old `LodgingCarousel`.
  - `SmartLinkCard.tsx` — reusable smart-link image primitive per §5.4 (image IS the link, source-domain pill, full-bleed 16:9). Not yet wired into itinerary cards — those are still legacy until Session 2.
  - `StickyRsvpBarChassis.tsx` — three-state pills with GLOBAL chip icons + THEMED button labels. Optimistic update + `router.refresh()` so the going row and per-person cost reflect the new RSVP without a reload.
  - `PoeticFooter.tsx` — trip-page-only footer ("rally is a doorway, not an app. close it and go pack.") per §5.4.
- **Kept untouched** (these render inside `.chassis` but still use legacy styles until Session 2/3 rebuilds them): `OrganizerCard`, `Description`, `ExtrasSections`, `FlightCard`, `TransportCard`, `RestaurantCard`, `ActivityCard`, `GroceriesCard`, `CostBreakdown`, `DatePoll`, `GuestList`, `ActivityFeed`, `AddToCalendarButton`.
- **Visually orphaned in the new surface but still mounted:** `Countdown.tsx` (the old d/h/m/s timer), `StickyRsvpBar.tsx`, `CoverHeader.tsx`, `CollageAvatars.tsx`. No longer imported by the trip page. Safe to delete in Session 2.

### ESLint
- `eslint.config.mjs` — added `react/jsx-no-literals` as `warn` with `allowedStrings` for design-system glyphs (`rally`, `!`, `★`, `↗`, `↑`, `→`, `←`, `·`, `—`, `🙌`, `🧗`, `📬`, `🗝️ the spot`). Rule fires on bare JSX text children only; strings inside `{}` expressions pass (so `getCopy()` calls are accepted).
- All Session 1 surfaces lint clean. Legacy Session 2/3 components produce warnings (not errors) that will get cleared as those surfaces are rebuilt.

---

## Decisions locked this session

The three AskUserQuestion answers at the top of the session:

### 1. RSVP enum: keep boundary mapper, defer DB migration
The legacy DB enum (`'in','out','maybe','pending'`) stays. Chassis code uses `'holding'`. `rally-types.ts` translates at every read/write. No migration 003 this session.
**Why:** zero-risk, the mapper was already in place from the previous session, and kickoff's "rename maybe → holding" clashed with the scaffolding that was already built. A proper migration lands in a later session when the DB touch is batched with other schema work.

### 2. Auth backend: keep Supabase, wrap behind interface, tighten cookie + add cooldown/rate limit
Supabase Auth stays as the provider. `AuthProvider` interface means a single-line swap when `TODO(prd):auth-backend-confirm` resolves. Guest cookie MAX_AGE dropped 90 → 30 days rolling. Rate limiter enforces 30s cooldown and 5/hr per email.
**Why:** the existing Supabase magic link already does the hard work; building the interface costs ~50 lines and preserves the swap. Full provider replacement would have eaten the whole session without functional gain.

### 3. Inline-string sweep: scoped to touched surfaces + ESLint rule
Only swept components touched in Steps 4–5 (auth UI + trip page chassis). Added `react/jsx-no-literals` as warn to catch new inline strings going forward. Session 2/3 components still produce warnings but don't fail the build.
**Why:** sweeping components that are scheduled for full rebuild in Session 2 is throwaway work. The lint rule is the real enforcement going forward.

---

## Spec deviations worth flagging

Flagging these because each is a small but deliberate departure from the literal text of one of the 8 spec docs.

- **17 themes, not 11.** The phase 2 mockup (`rally-phase-2-theme-system.html`) shows 11 named themes with classes `.t1–.t11`. The theme content system (`rally-theme-content-system.md`) enumerates 17. `ThemeId` union is 17. I shipped 17 — phase 2 predates the final count. The 6 themes missing from phase 2 (Boys Trip, Reunion, Festival Run, Desert, Camping, Tropical) use CSS `[data-theme]` blocks with palettes from the theme content system.
- **Legacy DB theme seeds don't cover the 6 new themes.** `002_typed_components.sql:513` seeds 11 system themes + Minimal. Trips created against `template_name = 'Boys Trip'` (etc.) won't find a row until a follow-up seed migration lands. `chassisThemeIdFromTemplate()` falls back to `'just-because'` for any unmapped template. Flag for Session 3 DB work.
- **DB migration `003_holding_rsvp.sql` deliberately NOT written.** Per locked decision #1. Boundary mappers do the work. Migration deferred.
- **90-day cookie → 30-day rolling is behavior-breaking for anyone currently signed in.** Existing `rally_guest` cookies with 90-day maxAge will continue to work until they expire; new writes use 30d. The `refreshGuestCookie()` helper on the trip page load slides the expiry forward, so active users are fine. Inactive users (>30d no visit) will drop.
- **Phase 2 mockup predates the smart-link image decision.** It doesn't show itinerary cards with the source-domain pill. I built the `SmartLinkCard` primitive per lexicon §5.4 but it's not yet wired into the itinerary (FlightCard/ActivityCard/etc. are still legacy). Session 2 hooks them up.
- **Lodging is a gallery, not a carousel.** `LodgingGallery.tsx` renders a vertical stack (single column mobile, 2-col ≥480px). The old `LodgingCarousel.tsx` is orphaned in code but not deleted yet (Session 2 cleanup).
- **Old `AuthFlow.tsx` left in place as dead code.** No longer imported by the live auth route. Delete in Session 2.
- **Countdown granularity changed from d/h/m/s to whole days.** The phase 2 mockup is a single big day number in Shrikhand; the legacy `Countdown.tsx` was a d/h/m/s timer. New `ChassisCountdown.tsx` ticks once per minute (day-precision is all the chassis needs).
- **Auth surface is light-mode only.** Per phase 11 spec — cream bg (`#fdf8ec`), ink text, does NOT consume chassis vars. The door must read consistently regardless of the user's theme picker state. Its styles live in `src/components/auth/auth-surface.css` with the `auth-` prefix so they don't conflict with `.chassis .*`.
- **Trip page still mounts the v0 typed component cards** (`FlightCard`, `TransportCard`, `RestaurantCard`, `ActivityCard`, `GroceriesCard`, `CostBreakdown`, `DatePoll`, `GuestList`, `ActivityFeed`, `ExtrasSections`, `AddToCalendarButton`). These render inside `.chassis` so the surrounding context works, but their internals are legacy (glass cards, old fonts, inline strings). Rebuilt in Session 2/3. They produce lint warnings that I intentionally left as warnings — not marked with `TODO(session-N)` disables since the next session will replace the files wholesale.
- **"Minimal" theme cut** per scope §7. Any existing trips against it fall through to `just-because`.

---

## Surfaces NOT touched this session

The kickoff §5 Session-roadmap tables deferred these explicitly. They still render the v0 UI. Each corresponding lexicon surface is an empty `Record<string, Templated> = {}` stub so the lexicon assembly types-checks; Session 2/3 fills them.

| Session | Surface | Lexicon stub | V0 code still live |
|---|---|---|---|
| 2 | Builder (trip editor) | `builder-state.ts`, `create-trip.ts` | `src/components/editor/*` |
| 2 | Invitee pre-login | `invitee-state.ts` | (part of trip page logic) |
| 2 | Theme picker (phase 6) | `theme-picker.ts` | `src/components/editor/ThemePicker.tsx` |
| 2 | Crew subsurface (§5.25) | `crew.ts` | `src/components/trip/GuestList.tsx` (mounted on trip page) |
| 2 | Buzz feed (§5.26) | `buzz.ts` | `src/components/trip/ActivityFeed.tsx` (mounted on trip page) |
| 2 | Dashboard | `dashboard.ts` | `src/components/dashboard/Dashboard.tsx` |
| 3 | Extras drawer | `extras.ts` (populated, read-only on trip page) | `src/components/trip/ExtrasSections.tsx` (mounted on trip page) |
| 3 | Lodging voting write-side | `lodging-voting.ts` (populated, read-only) | `LodgingGallery.tsx` renders votes as-is, no voting UI |
| 3 | Passport (§5.15) | `passport.ts` | none yet |
| 3 | Lock flow | `lock-flow.ts` | partially in `src/components/editor/EditorToolbar.tsx` |

---

## Open questions / blockers

1. **`TODO(prd):auth-backend-confirm`** — Andrew needs to pick between Supabase Auth, Clerk, Resend-only custom JWT, or fully custom. Spec is provider-agnostic; `AuthProvider` interface means this is a one-line swap. Resolving this decision does not block Session 2.

2. **Rate-limit storage** — currently in-memory Map in `src/lib/auth/rate-limit.ts`. Fine for single-instance dev/preview. Multi-instance production (Vercel serverless functions, multiple Node replicas, etc.) will double-count or under-count. Needs a shared store: Redis/Upstash, or a `magic_link_attempts` Supabase table. Decision needed before production deploy. Lowest-friction option if staying on Supabase: a simple table with RLS + two queries per send.

3. **DB seed for 6 new themes.** Trips created via the organizer picker against Boys Trip / Reunion / Festival / Desert / Camping / Tropical won't find a themes-table row and will render as just-because. Seed migration needs to land before the theme picker ships in Session 2.

4. **Legacy DB rsvp_status enum.** Per locked decision we kept it. A real `003_holding_rsvp.sql` migration (add `'holding'` value, backfill `'maybe'` → `'holding'`, drop the boundary mappers) should happen in the same session as the chassis_theme_id column add — batch the schema work.

5. **Wordmark `rally!` is two DOM nodes** (`<h1><span>rally</span><span class="bang">!</span></h1>` in auth, `rally!` as plain text in trip header). The PostcardHero renders it from `common.wordmark` without splitting the bang off. This is intentional: the split only matters on the auth landing screen where the bang sits in a specific accent color against a neutral bg; on the trip page the whole wordmark is already in `var(--accent)`. If Andrew wants the bang to always be a different accent from the rest of the wordmark, that's a small follow-up (one `<span>` split + a `.bang` class on `.wordmark`).

---

## How to verify

End-to-end checks after pulling this branch. None should require the checkpoint to move.

### Build + types
```sh
npm run build         # should complete
npx tsc --noEmit      # should be silent
```

### Lint
```sh
npx eslint 'src/app/trip/**' 'src/app/auth/**' 'src/components/auth/AuthSurface.tsx' 'src/components/trip/PostcardHero.tsx' 'src/components/trip/ChassisCountdown.tsx' 'src/components/trip/SmartLinkCard.tsx' 'src/components/trip/LodgingGallery.tsx' 'src/components/trip/StickyRsvpBarChassis.tsx' 'src/components/trip/PoeticFooter.tsx'
# → clean (0 errors, 0 warnings)

npx eslint src/components/trip
# → warnings on legacy components (RsvpSection, CollageAvatars, etc.) — expected; Session 2/3 clears them
```

### Visual chassis check
Start the dev server:
```sh
npm run dev
```
1. Create or open a trip. The `/trip/<slug>` page should render:
   - Marquee scrolling at the top
   - Wordmark "rally!" in Shrikhand, accent color, wiggling slowly
   - Eyebrow pill + title in Shrikhand + handwritten tagline
   - One big countdown card on a charcoal block (day number in Shrikhand, `--` flashes briefly on load then hydrates)
   - Going row with avatars cascading in on load
   - Sticky three-chip RSVP bar at the bottom: 🙌 / 🧗 / —
   - Poetic footer ("rally is a doorway, not an app...")
2. Theme swap via DB or `data-theme` inspector: the chassis vars should flip cleanly — colors change, fonts stay, nothing reflows.
3. `prefers-reduced-motion: reduce` in DevTools should kill the wiggle/blink/pulse idle loops.

### Auth flow
1. Visit `/auth` — four-state landing UI, Shrikhand `rally!`, Caveat subhead, black pill button.
2. Enter an email, click "send me a link" → state transitions to "check your email". Resend link shows "hang on — 30s" countdown.
3. Open the actual email (Resend → your inbox), click the link within 15 minutes → redirected to `/` (dashboard) or `/trip/<slug>` if the invite included a `trip` param.
4. Send 6 magic links in rapid succession to the same email → the 6th returns 429 with `error: 'cooldown'` or `'hourly_limit'`.
5. Visit `/auth/expired` and `/auth/invalid` directly → error stickers + "send a new one" CTA.

### RSVP round trip
1. As an authed guest, tap the "hold my seat 🧗" chip in the sticky bar.
2. Network tab: `POST /api/rsvp` with `{ status: 'maybe' }` (the boundary mapper translates chassis 'holding' → DB 'maybe').
3. After `router.refresh()`, the going row count updates without a full reload.
4. Change to "i'm in 🙌" → POST with `status: 'in'`, count updates again.
5. Verify in Supabase: the `trip_members.rsvp` column reads `'maybe'` for the holding row, `'in'` for the committed row.

### Regression check for legacy surfaces
- Dashboard (`/`), builder (`/create`, `/edit/<id>`), crew, and editor pages still load. They look visually untouched from v0 — expected; Session 2 rebuilds them.

---

## Next session preview (Session 2)

Per the kickoff roadmap: **Surfaces**. Phases 4, 5, 6, 9, 10.

- **Phase 4 — Builder (trip editor).** Rebuild `src/app/edit/[id]/page.tsx` + `src/components/editor/*` against the chassis. The editor IS the trip page in sketch state per §5.16. Pulls `builder-state.ts` + `create-trip.ts` lexicon surfaces.
- **Phase 5 — Invitee pre-login.** The login-gate UI that non-users see when they tap an invite link without a session. The top half is the §5.17 sticker / inviter row / "sign in to see the plan" overlay; the bottom is the existing trip page with a blur. Pulls `invitee-state.ts`.
- **Phase 6 — Theme picker.** The organizer's "pick the vibe" surface. Grid of 17 tiles, live preview swapping via `data-theme` on a wrapper (no React re-render — the picker preview-in-place mechanic depends on this being pure CSS). Pulls `theme-picker.ts`.
- **Phase 9 — Crew subsurface.** `/trip/<slug>/crew` — read-only expanded guest list grouped by RSVP state. Replaces `GuestList` on the trip page with a link to the subsurface. Pulls `crew.ts`.
- **Phase 10 — Buzz feed.** `/trip/<slug>/buzz` — reverse-chron mixed feed (system events + short posts). Replaces `ActivityFeed` on the trip page with a link. Pulls `buzz.ts`.

Session 2 should also:
- Delete the now-dead `AuthFlow.tsx`, `Countdown.tsx`, `StickyRsvpBar.tsx`, `CoverHeader.tsx`, `CollageAvatars.tsx`, `LodgingCarousel.tsx`.
- Seed the 6 missing DB themes (Boys Trip, Reunion, Festival, Desert, Camping, Tropical) as a `003_new_themes.sql` migration.
- Wire the `SmartLinkCard` primitive into at least one itinerary card (lodging is already using the `.house` primitive; lean on the same pattern).

Session 3 handles: dashboard, passport (§5.15), extras drawer, lodging voting write-side, lock flow, the DB migration bundle (`003_holding_rsvp.sql` + `chassis_theme_id` column), motion pass, a11y sweep, deploy.

---

**Files changed:** 24 edited, 32 new. Run `git diff --stat main` for the full list. No DB migrations ran this session (boundary mapper strategy).
