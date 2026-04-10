# Rally — Session 4 Kickoff: Post-v0 QA Fixes

**Date:** April 2026 · **Prereq:** Session 3D complete (deployed to rally-gold.vercel.app) · **Branch:** `main`

This session fixes every issue found during the post-deploy visual QA of rally-gold.vercel.app. Every item is verified against the source-of-truth spec docs: `rally-microcopy-lexicon-v0.md`, `rally-theme-content-system.md`, `rally-brand-brief-v0.md`, and `SESSION-3-RELEASE.md`.

**Severity key:**
- **P0** — Wrong data / broken feature. User sees incorrect content.
- **P1** — Copy or brand violation visible to every user. Spec says X, live says Y.
- **P2** — Visual polish, missing feature that was specced, or minor deviation.

---

## Guardrails

1. **Read before writing.** Before touching any file, read it first. This session is surgical — no rewrites, no new surfaces.
2. **One commit per fix group.** Group fixes by surface. Dashboard fixes = 1 commit. Trip page fixes = 1 commit. Etc.
3. **`tsc --noEmit` clean after every commit.** No regressions.
4. **Copy changes go through `getCopy()`.** Do not hardcode strings in JSX. Every string must live in the appropriate `src/lib/copy/surfaces/*.ts` file.
5. **Theme-aware text rule (hard rule from 3B).** Inside any `[data-theme]` container, text color must use `var(--ink)` / `var(--on-surface)` / `var(--accent)` — never hardcoded white or `#fff`. See `rally-theme-content-system.md` §0.

---

## Files to read before starting

Read these files in order before touching any code:

1. `rally-microcopy-lexicon-v0.md` — §5.1 (auth), §5.2 (dashboard), §5.10 (RSVP), §5.17 (invitee)
2. `rally-theme-content-system.md` — §0 (hard rules), then the `rsvp.in` / `rsvp.holding` / `rsvp.out` strings for all 17 themes
3. `rally-brand-brief-v0.md` — wordmark rules, voice rules
4. `src/lib/copy/surfaces/dashboard.ts`
5. `src/lib/copy/surfaces/auth.ts` (or wherever auth strings live)
6. `src/lib/copy/surfaces/trip-page.ts`
7. `src/lib/copy/get-copy.ts` — understand the resolution chain
8. `src/app/page.tsx` — dashboard RSC
9. `src/app/trip/[slug]/page.tsx` — trip page
10. `src/components/auth/AuthSurface.tsx` — auth flow
11. `src/app/passport/page.tsx` — passport page
12. `src/app/trip/[slug]/buzz/page.tsx` — buzz page
13. `src/app/trip/[slug]/crew/page.tsx` — crew page

---

## Issue catalog

### Group 1 — Auth surface

**File:** `src/components/auth/AuthSurface.tsx` + `src/lib/copy/surfaces/auth.ts`

| # | Sev | What's wrong | Spec says | Live shows | Fix |
|---|-----|-------------|-----------|------------|-----|
| A1 | P1 | Tagline uses forbidden phrase | §5.1: subhead = `how friend groups get to "let's go"` | `the group trip planner for people who actually go` | Update copy surface. The live string comes from the lexicon's *landing page* section (§5.X), not the auth section (§5.1). Auth should use §5.1. **Note:** the brand brief says "Never the word 'trip planner'" but the lexicon's own landing section uses it — spec-internal contradiction worth flagging to Andrew, but the auth fix is unambiguous. |
| A2 | P1 | Login button wrong copy | §5.1: primary button = `let me in` | `send me a link` | Update copy surface. |
| A3 | P2 | Sent-state copy diverges | §5.1: `check your inbox. we just sent the door.` | `check your email` / `we sent a link to {email}. tap it to let yourself in.` | Update both the heading and body in the sent state to match lexicon. |
| A4 | P2 | Footer missing bang | Brand brief: bang is never optional in the wordmark | `made with rally` (no !) | Update footer to `made with rally!` — the "!" should render in accent color per wordmark rules. |

### Group 2 — Dashboard

**File:** `src/app/page.tsx` + `src/lib/copy/surfaces/dashboard.ts` + `src/lib/dashboard.ts`

| # | Sev | What's wrong | Spec says | Live shows | Fix |
|---|-----|-------------|-----------|------------|-----|
| D1 | P1 | Wordmark missing bang | Brand brief: wordmark is always `rally!` with "!" in accent color | `rally` (no !) | Add "!" to wordmark. Style the bang in `var(--accent)` or `#ff2e7e`. |
| D2 | P1 | Pluralization bug | English grammar | `1 people` on cards with 1 member | Add pluralization helper: `{n} ${n === 1 ? 'person' : 'people'}`. Affects `dashboard.ts` data layer or the template in the copy surface. |
| D3 | P1 | Scoreboard chip vocabulary wrong | §5.2: chips are `your move {n}`, `cooking {n}`, `holding {n}`, `locked {n}`, `done {n}`. No "drafts" chip exists. | `4 drafts` / `2 cooking` | Remove "drafts" chip entirely OR map sketch-phase trips into "cooking" count. The lexicon has no "drafts" state — sketch trips should either be counted as "cooking" or not shown in the scoreboard. Check `computeRallyPhase()` for what maps to sketch vs sell. |
| D4 | P1 | Scoreboard chip format inverted | §5.2: format is `cooking {n}` (word first) | `2 cooking` (number first) | Flip the template: `cooking {n}` not `{n} cooking`. Same for all chips. |
| D5 | P2 | No countdown stamps on sketch cards | §5.2: sketch stamp = `?` / `soon` (light grey bg) | No stamp visible on sketch-state cards | Add the stamp component to sketch-phase cards. Stamp num = `?`, stamp sub = `soon`, color = light grey. |
| D6 | P2 | No rally meter on sell cards | §5.2: sell-state cards show rally meter (progress bar with `{n} / {target} ride or dies`) | No progress bar visible | Wire the rally meter component. May already exist in CSS (`.dash-meter`, `.dash-meter-fill`) but not rendered in the JSX. Check if the data layer provides the RSVP counts needed. |
| D7 | P2 | Empty trip name on one card | Data issue — Aspen,CO card has no trip name | Card shows `Aspen,CO` as meta but no bold title | This is a data issue (the trip's `name` field is empty in the DB). Not a code fix. Flag for manual data cleanup or add a fallback: if no trip name, render destination as the title. |
| D8 | P2 | Sketch cards not visually differentiated by theme | Cards should show per-theme styling | All sketch cards look the same (beige/cream) despite different `data-theme` values | Verify `chassis_theme_id` is set on sketch-phase trips. If it's null for sketch trips (only set after theme picker in sell phase), this is expected — sketch cards haven't picked a theme yet. If themes ARE set, check that the CSS custom properties are cascading into the card background. |

### Group 3 — Trip page (copy + theming)

**Files:** `src/app/trip/[slug]/page.tsx` + `src/lib/copy/surfaces/trip-page.ts` + `src/lib/copy/get-copy.ts` + component files for countdown, RSVP, going label

| # | Sev | What's wrong | Spec says | Live shows | Fix |
|---|-----|-------------|-----------|------------|-----|
| T1 | P0 | Wrong theme on Tortola trip | DB `chassis_theme_id` should be `tropical` | `data-theme="beach-trip"` rendered | Investigate: either the DB has the wrong `chassis_theme_id` value for this trip, or the `chassisThemeIdFromTemplate()` fallback is mapping incorrectly. Check `src/lib/themes/from-db.ts` for the tropical → theme-id mapping. If the backfill (migration 010) seeded the wrong value, fix the data. If the mapping function is wrong, fix the function. |
| T2 | P1 | Anticipation countdown missing | Brand brief: "Two countdowns, not one." Hero countdown = days until trip. Secondary = days until commit deadline. | Both countdowns say `days to lock it in` (both are deadline countdowns) | The hero countdown should use a theme-aware sensory string. E.g., for beach-trip: `{n} days until toes in`. Check `rally-theme-content-system.md` for each theme's `countdown.sensory` or equivalent string. The countdown component needs to distinguish between the two countdown types and pull different copy for each. |
| T3 | P1 | RSVP buttons not using theme-specific copy | Theme content system defines per-theme RSVP strings (e.g., beach-trip: `sand szn 🏖️` / `checking the calendar 📅` / `can't make it 🥲`) | All trips show default `I'm so in` regardless of theme | **Root cause found.** Key-path mismatch in getCopy resolution. RsvpSection calls `getCopy(themeId, 'rsvp.prompt.in.button')`. getCopy strips surface `rsvp`, walks `theme.strings.prompt.in.button` → undefined (miss). Falls through to lexicon default. But beach-trip theme has the override at `theme.strings.rsvp.in.buttonLabel` — completely different path. Two mismatches: (1) theme re-nests under `rsvp` but getCopy already stripped that surface, (2) key is `buttonLabel` vs `button`. Fix: flatten all 17 theme files from `strings.rsvp.{state}.buttonLabel` to `strings.prompt.{state}.button` so the path matches after surface-stripping. OR rename lexicon keys + component calls to match the theme structure. See detailed instructions in Fix T3 section below. |
| T4 | P1 | Going label wrong | §5.17: going label = `who's coming 👇` (general) or `{n} already in (1 seat with your name) 👇` (invitee view) | `1 going 👇` | Update the going label in the trip page copy surface. For authenticated organizer/member view, use `who's coming 👇`. For invitee pre-login view, use the §5.17 pattern. |
| T5 | P2 | Eyebrow text in ALL CAPS | Brand brief voice rules: lowercase by default | `★ ANDREW SHIPMAN IS CALLING` | The eyebrow is rendering in uppercase — either via CSS `text-transform: uppercase` or hardcoded caps in the copy string. Fix: ensure the string is lowercase (`★ andrew shipman is calling`) and remove any `text-transform: uppercase` on the eyebrow element. |

### Group 4 — Passport

**File:** `src/app/passport/page.tsx` + `src/lib/copy/surfaces/passport.ts`

| # | Sev | What's wrong | Spec says | Live shows | Fix |
|---|-----|-------------|-----------|------------|-----|
| P1 | P1 | Wordmark missing bang | Brand brief: always `rally!` | `rally` (no !) | Same fix as D1. If the wordmark is a shared component, fix it once. If each surface renders its own wordmark, fix in passport. |

### Group 5 — Buzz

**File:** `src/app/trip/[slug]/buzz/page.tsx`

| # | Sev | What's wrong | Spec says | Live shows | Fix |
|---|-----|-------------|-----------|------------|-----|
| B1 | P1 | Compose bar avatar shows "?" | Should show current user's initial (e.g., "A" for Andrew) | `?` placeholder | The compose bar is disabled but still visible. The avatar should show the authenticated user's initial, not a fallback "?". Check if the user data is being passed to the compose bar component. |

### Group 6 — Crew

**File:** `src/app/trip/[slug]/crew/page.tsx` + `src/app/globals.css`

| # | Sev | What's wrong | Spec says | Live shows | Fix |
|---|-----|-------------|-----------|------------|-----|
| C1 | P1 | Filter chip contrast | WCAG AA requires 4.5:1 contrast ratio for text | Filter chips ("1 in", "1 holding", "0 out") have light text on light pill backgrounds — very hard to read | Audit the `.crew-filter-chip` (or equivalent) CSS. The pill background and text color need more contrast. Use `var(--ink)` for text or darken the background. Test against the trip's theme palette. |

### Group 7 — Cross-cutting / shared component fixes

| # | Sev | What's wrong | Spec says | Live shows | Fix |
|---|-----|-------------|-----------|------------|-----|
| X1 | P1 | Wordmark component missing bang globally | Brand brief: bang is never optional | Dashboard and passport show `rally` without `!` | If a shared `<Wordmark>` or similar component exists, fix it once. If each surface has its own wordmark rendering, create a shared component: `rally` in `--ink` + `!` in `var(--accent)`. Audit every surface that renders the wordmark: auth (correct), dashboard (broken), passport (broken), footer (broken). |
| X2 | P2 | Footer "made with rally" missing bang | Brand brief | All footers show `made with rally` | Update to `made with rally!` with the bang in accent color. |

---

## Fix order (dependency-aware)

**Commit 1 — Shared wordmark fix (X1, X2, D1, P1, A4)**
Create or fix the shared wordmark component/string. This unblocks multiple surfaces at once. Also fix footer strings.

**Commit 2 — Auth copy fixes (A1, A2, A3)**
Update `src/lib/copy/surfaces/auth.ts` with correct lexicon strings. Three string replacements.

**Commit 3 — Dashboard fixes (D2, D3, D4, D5, D6, D7, D8)**
- Add pluralization helper for member counts
- Fix scoreboard chip vocabulary and format
- Add countdown stamps to sketch cards
- Wire rally meter on sell cards (if CSS exists but JSX is missing)
- Add fallback for empty trip names

**Commit 4 — Trip page copy + theming (T1, T2, T3, T4, T5)**
- Investigate and fix Tortola theme mapping (P0 — do this first in the commit)
- Split the countdown into two types: anticipation vs. deadline
- Wire `getCopy()` for theme-specific RSVP button labels
- Fix going label
- Fix eyebrow casing

**Commit 5 — Buzz + Crew fixes (B1, C1)**
- Pass user initial to compose bar avatar
- Fix crew filter chip contrast

**Commit 6 — Verify**
- `tsc --noEmit` (must be silent)
- `npx next lint` (must be clean)
- Manual spot-check: load dashboard, trip page (beach-trip theme), trip page (tropical theme), passport, auth, buzz, crew — verify each fix visually

---

## Detailed fix instructions

### Fix X1 — Shared wordmark

Search the codebase for every place "rally" appears as a rendered wordmark. Likely locations:
- `src/app/page.tsx` (dashboard header)
- `src/app/passport/page.tsx` (passport header)
- `src/components/auth/AuthSurface.tsx` (auth — this one is already correct with the bang)
- Any footer component

The wordmark must always be `rally!` where the `!` is rendered in `var(--accent)` (or `#ff2e7e` as fallback). In Shrikhand font. Lowercase. The auth page already does this correctly — use it as the reference implementation.

If no shared component exists, create one: `src/components/shared/Wordmark.tsx`. Simple component that renders `<span className="wordmark">rally<span className="wordmark-bang">!</span></span>`. Add CSS:
```css
.wordmark { font-family: var(--font-display); }
.wordmark-bang { color: var(--accent); }
```

### Fix T1 — Tortola theme mapping (P0)

This is the highest-priority fix. Steps:
1. Check the `trips` table for the Tortola trip. What is the value of `chassis_theme_id`?
2. If it's `beach-trip`, the data is wrong. Update it to `tropical`.
3. If it's `tropical`, check `src/lib/themes/from-db.ts` — does `tropical` map correctly to a theme object?
4. Check `src/lib/themes/index.ts` — does a `tropical` theme exist in the `themes` array and `themesById` map?
5. Check `src/app/globals.css` — does `[data-theme="tropical"]` exist with its own CSS variable block?

Migration 010 seeded the Tropical theme row. Verify the full chain: DB value → `from-db.ts` mapping → theme object → CSS variables.

### Fix T2 — Two countdowns

The brand brief says:
> "Two countdowns, not one. The hero countdown is *days until the trip itself* (anticipation). The secondary countdown is *days until commit deadline* (organizer urgency)."

Each theme has a sensory countdown string. Check `rally-theme-content-system.md` for each theme's countdown copy. Examples:
- beach-trip: `{n} days until toes in`
- ski-chalet: `{n} days until first chair`
- euro-summer: `{n} days until too much olive oil`

The hero (top) countdown should use this sensory string. The secondary countdown (near the RSVP section) should use `{n} days to lock it in` or similar deadline language.

Implementation:
1. Add a `countdown.sensory` key to each theme's strings in `src/lib/themes/*.ts` (or to the copy surface)
2. Modify the hero countdown component to pull `getCopy(themeId, 'countdown.sensory')` and interpolate `{n}`
3. Keep the secondary countdown as-is (deadline-focused)

### Fix T3 — Theme-specific RSVP buttons (key-path mismatch)

**Root cause:** `getCopy(themeId, path)` strips the first segment (surface name) and walks `theme.strings` with the remainder. The RsvpSection component calls `getCopy(themeId, 'rsvp.prompt.in.button')` → surface=`rsvp`, key=`prompt.in.button` → walks `theme.strings.prompt.in.button` → **undefined** (miss) → falls through to lexicon default.

But the beach-trip theme file (`src/lib/themes/beach-trip.ts`) has the override at `theme.strings.rsvp.in.buttonLabel`. Two path mismatches:
1. Theme re-nests under `rsvp` but getCopy already stripped that surface segment
2. Key is `buttonLabel` in theme vs `button` in lexicon

**Fix approach (choose one):**

**Option A (recommended — fewer files touched):** Rename the theme strings. In all 17 theme files under `src/lib/themes/*.ts`, change:
```ts
// FROM:
strings: {
  rsvp: {
    in:      { buttonLabel: 'sand szn 🏖️' },
    holding: { buttonLabel: 'checking the calendar 📅' },
    out:     { buttonLabel: "can't make it 🥲" },
  }
}
// TO:
strings: {
  prompt: {
    in:      { button: 'sand szn 🏖️' },
    holding: { button: 'checking the calendar 📅' },
    out:     { button: "can't make it 🥲" },
  }
}
```

This way `getCopy('beach-trip', 'rsvp.prompt.in.button')` → strips `rsvp` → walks `theme.strings.prompt.in.button` → **hit** → returns `sand szn 🏖️`. ✅

Also update the `Theme` type definition in `src/lib/themes/types.ts` to match the new shape.

**Option B:** Keep theme structure, change component + lexicon. Rename `rsvp.prompt.in.button` to `rsvp.rsvp.in.buttonLabel` everywhere. Uglier path name but zero theme file changes. Not recommended.

**Verify with:** After fix, `getCopy('beach-trip', 'rsvp.prompt.in.button')` should return `sand szn 🏖️`. Test at least 3 themes (beach-trip, ski-chalet, euro-summer) to confirm all return their theme-specific strings.

### Fix D3/D4 — Scoreboard chips

The lexicon §5.2 defines exactly 5 chip types:
1. `your move {n}` — hot variant, pulses. For trips needing organizer action.
2. `cooking {n}` — active trips in sell/lock state
3. `holding {n}` — appears when any invitee is in holding state
4. `locked {n}` — locked-phase trips
5. `done {n}` — past trips

There is NO "drafts" chip. Sketch-phase trips should either:
- Be counted under "cooking" (if you treat sketch as an active state), OR
- Not appear in the scoreboard at all (scoreboard only counts trips that have been shared)

The format is word-first: `cooking 2` not `2 cooking`. The `your move` chip uses a `.hot` accent variant.

### Fix D2 — Pluralization

Add a utility function (or inline ternary):
```ts
const pluralize = (n: number, singular: string, plural: string) => 
  `${n} ${n === 1 ? singular : plural}`;
```

Apply to member count on dashboard cards: `pluralize(count, 'person', 'people')`.

Check if this bug also appears on the trip page (it showed "1 going" which is correct grammar, but verify the trip page doesn't have `{n} people` anywhere).

---

## What's NOT in this session

- New surfaces or features (no new pages, no new components)
- Buzz compose / reactions write paths (v0.1)
- Lock ceremony confirmation modal (v0.1 unless prioritized)
- Navigation to `/passport` (separate task)
- Email template redesign (v0.1)
- Font loading optimization (`next/font`) (v0.1)
- Mobile viewport testing at 360/375/390/414 (separate QA pass)
- Desktop layout improvements (brand brief flags this but it's a design task)

---

## How to verify (post-fix checklist)

### Auth (`/auth`)
- [ ] Tagline reads `how friend groups get to "let's go"`
- [ ] Button reads `let me in`
- [ ] Sent state heading reads `check your inbox`
- [ ] Sent state body includes `we just sent the door`
- [ ] Footer reads `made with rally!` with pink bang

### Dashboard (`/`)
- [ ] Wordmark reads `rally!` with pink bang
- [ ] Cards with 1 member say `1 person` not `1 people`
- [ ] Scoreboard chips: no "drafts" chip; format is `cooking {n}` / `locked {n}` etc.
- [ ] Sketch cards have countdown stamp: `?` / `soon`
- [ ] Sell cards have rally meter progress bar
- [ ] Empty trip names fall back to destination

### Trip page (`/trip/[slug]`)
- [ ] Tortola trip renders with `data-theme="tropical"` (not beach-trip)
- [ ] Hero countdown uses theme-sensory string (e.g., "84 days until toes in" for beach-trip)
- [ ] Secondary countdown uses deadline string ("X days to lock it in")
- [ ] RSVP buttons show theme-specific labels (e.g., "sand szn 🏖️" for beach-trip in-button)
- [ ] Going label reads `who's coming 👇`
- [ ] Eyebrow text is lowercase

### Passport (`/passport`)
- [ ] Wordmark reads `rally!` with pink bang

### Buzz (`/trip/[slug]/buzz`)
- [ ] Compose bar avatar shows user's initial, not "?"

### Crew (`/trip/[slug]/crew`)
- [ ] Filter chips have sufficient contrast (dark text on pill backgrounds)

### Build
- [ ] `tsc --noEmit` silent
- [ ] `npx next lint` clean

---

## Reference docs

| Doc | Location | What it covers |
|-----|----------|---------------|
| Microcopy lexicon | `rally-microcopy-lexicon-v0.md` | Every string in the app by surface |
| Theme content system | `rally-theme-content-system.md` | 17 themes × 20 strings each (RSVP, marquee, sticker, countdown) |
| Brand brief | `rally-brand-brief-v0.md` | Wordmark rules, voice rules, personality |
| Session 3 release notes | `SESSION-3-RELEASE.md` | What shipped, known deviations |
| v0 release notes | `V0-RELEASE.md` | Full shipped feature list |
| Session 3 master scope | `session-3-master-scope.md` | Scope decisions, what's in/out |
