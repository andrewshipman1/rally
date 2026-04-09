# Rally v0 — Release Notes

**Ship date:** April 2026
**Sessions:** 1 (foundation) → 2 (surfaces) → 3A (DB + debt) → 3B (read surfaces) → 3C (write workflows) → 3D (sweep + polish)

---

## What shipped

### Core chassis
- 17 themes with full CSS variable system (`--bg`, `--ink`, `--accent`, `--accent2`, `--surface`, `--on-surface`, `--stroke`, `--sticker-bg`)
- Three font stacks per theme (display, body, hand)
- Responsive phone-frame layout with marquee, postcard hero, countdown, sticky RSVP bar
- `getCopy(themeId, 'surface.key')` copy resolution: theme override → lexicon default → fallback
- 26 copy surface files, fully extracted (zero `jsx-no-literals` warnings)

### Surfaces (11 total)
| Phase | Surface | Route |
|-------|---------|-------|
| 1-2 | Trip page | `/trip/[slug]` |
| 3 | Dashboard | `/` |
| 3.5 | Passport | `/passport` |
| 4 | Builder (sketch) | `/trip/[slug]` (sketch phase) |
| 5 | Invitee pre-login | `/trip/[slug]` (unauthenticated) |
| 6 | Theme picker | Sheet on builder |
| 7 | Extras drawer | Inline on trip page |
| 8 | Lodging voting | Inline on trip page |
| 9 | Crew | `/trip/[slug]/crew` |
| 10 | Buzz | `/trip/[slug]/buzz` |
| 11 | Auth (magic link) | `/auth` |

### Auth
- Supabase Auth with magic-link flow
- Four states: landing, sent (with cooldown), expired, invalid
- Rate limiting via `auth_rate_limits` table (Supabase-backed, not in-memory)
- Guest cookie fallback for RSVP without full auth
- Profile setup flow at `/auth/setup`

### Write-side workflows
- RSVP (three-state: in / holding / out) with optimistic UI
- Extras: packing list CRUD, playlist/rules/album URL management
- Lodging voting with tally bars + organizer lock
- Trip lock flow with deadline gates + CAS guards
- Activity log integration across all mutations

### Motion
- Scroll-triggered fade-ins via `<Reveal>` (IntersectionObserver)
- Hero entrance animations (sticker pop, title slide-up, tagline slide-up)
- Avatar cascade (40ms stagger per avatar)
- Countdown pulse on final day
- RSVP confetti on success
- Date poll scale animation on selection
- All animations respect `prefers-reduced-motion: reduce`

### Accessibility
- Focus-visible ring on all interactive elements
- aria-labels on icon-only buttons throughout
- Keyboard navigation for theme picker (arrow keys + Enter/Escape)
- aria-expanded on collapsible sections
- role="alert" on locked-plan overlay
- WCAG AA contrast on all 17 themes (4 accent colors adjusted)

### Database
- 12 migrations (001–012)
- Tables: trips, members, lodging, flights, transport, restaurants, activities, groceries, polls, poll_votes, packing_list_items, auth_rate_limits, activity_log

---

## Known issues / v0.1 deferrals

- **Staging environment** — no staging exists; deploy is direct to prod. Standing up staging is v0.1 scope.
- **Email templates** — current templates are functional placeholders. Branded redesign with Shrikhand wordmark deferred to v0.1 (CoWork task).
- **OG image generation** — link previews use basic meta tags, no dynamic OG images
- **SMS auth / SSO** — magic-link email only
- **Push notifications** — not implemented
- **Analytics** — `track()` calls exist but no provider wired
- **Device management** — no session list / revoke
- **Landing page** — `/` is the dashboard (requires auth); no public marketing page
- **Font loading** — Google Fonts loaded via `<link>` tags in individual pages; should move to `next/font` in layout
- **GroupChat compose** — buzz feed is read-only; compose UI is a placeholder

---

## How to run locally

```bash
# 1. Clone and install
git clone <repo-url> && cd rally
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in Supabase + Resend credentials

# 3. Run Supabase locally (optional)
npx supabase start
npx supabase db push

# 4. Start dev server
npm run dev
# → http://localhost:3000
```

---

## How to add a new theme

1. Create `src/lib/themes/<theme-id>.ts` — export a `RallyTheme` object with colors, fonts, strings (marquee, sticker, countdownSignature, fomoFlag, RSVP button labels)
2. Register it in `src/lib/themes/index.ts` — add to the `themes` array and `themesById` map
3. Add a `[data-theme="<theme-id>"]` block in `src/app/globals.css` setting the 8 CSS variables
4. Add the theme to a category in `src/lib/themes/categories.ts`
5. Map the DB template name in `src/lib/themes/from-db.ts`

---

## How to add a new lexicon string

1. Find or create the appropriate surface file in `src/lib/copy/surfaces/`
2. Add the key with a default string value (or a template function taking `ThemeVars`)
3. Use `getCopy(themeId, 'surfaceName.key')` in the component
4. For theme-specific overrides, add the key path to the theme's `strings` object

---

## Sources of truth

| What | Where |
|------|-------|
| Theme definitions | `src/lib/themes/*.ts` |
| Theme CSS variables | `src/app/globals.css` `[data-theme]` blocks |
| Copy / lexicon | `src/lib/copy/surfaces/*.ts` |
| Copy resolution | `src/lib/copy/get-copy.ts` |
| Auth flow | `src/components/auth/AuthSurface.tsx` |
| Rate limiting | `src/lib/auth/rate-limiter.ts` + `auth_rate_limits` table |
| Trip data loading | `src/app/trip/[slug]/_data.ts` |
| Phase computation | `src/lib/rally-types.ts` (`computeRallyPhase`) |
| DB schema | `supabase/migrations/` |
| Email sending | `src/lib/email.ts` |
| Server actions | `src/app/actions/` |
