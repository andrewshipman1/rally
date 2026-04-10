# Rally Design QA — Deep Visual Audit

**Target:** rally-gold.vercel.app  
**Source of truth:** `rally-brand-brief-v0.md`, `rally-microcopy-lexicon-v0.md`, `rally-theme-content-system.md`  
**Method:** Open the live site in Chrome, screenshot every surface, and compare pixel-by-pixel against the spec docs. Flag every deviation.

---

## Your job

You are a design QA specialist auditing Rally's deployed web app. Open rally-gold.vercel.app in Chrome and systematically walk every user-facing surface. For each surface:

1. **Screenshot it** at mobile width (390px)
2. **Read the matching spec section** from the docs listed above
3. **Compare** every visible element: copy, color, spacing, typography, hierarchy, interaction states
4. **Log** every deviation as a finding with severity (P0/P1/P2)

**Severity key:**
- **P0** — Wrong data, broken feature, or crash. User sees incorrect content.
- **P1** — Spec says X, live shows Y. Visible to every user.
- **P2** — Visual polish, spacing, animation timing, minor deviation.

---

## Surface checklist

### 1. Auth (`/auth`)

Open in an incognito/logged-out window.

**Check against lexicon §5.1 + brand brief:**
- [ ] Wordmark: `rally!` in Shrikhand, lowercase, `!` in accent pink (#ff2e7e)
- [ ] Tagline: `how friend groups get to "let's go"` in Caveat (handwriting font)
- [ ] Email input placeholder: `your email`
- [ ] Button: `let me in` — check font, size, color, hover state
- [ ] Footer: `made with rally!` with pink bang
- [ ] Enter a valid email and submit. Verify sent state:
  - Heading: `check your inbox`
  - Body: `we just sent the door.`
  - Icon: 📬 with float animation
  - Resend link: `didn't get it? send another`
- [ ] Error states: try submitting empty, invalid email. Check error copy matches spec.
- [ ] Overall feel: does it feel like a door, not a form? (brand brief: "the auth page is a velvet rope")

### 2. Dashboard (`/`)

Log in and land on the dashboard.

**Check against lexicon §5.2 + brand brief:**
- [ ] Wordmark: `rally!` with pink bang in Shrikhand
- [ ] Greeting: `hey {name} 👋` — verify name interpolation
- [ ] H1: `where to next? ✈️`
- [ ] Scoreboard chips:
  - Format is **word first**: `cooking 3`, `locked 1`, NOT `3 cooking`
  - No "drafts" chip — sketch trips are merged into "cooking"
  - Hot chip (cooking with action needed) has accent background + pulse?
  - `done {n}` chip if any past trips exist
- [ ] Section headers: `what you're cooking` / `the archive`
- [ ] Trip cards — for each card check:
  - **Theme cascade**: `data-theme` attribute present? Card bg/text follow theme palette?
  - **Countdown stamp** (top-right corner):
    - Sketch: `?` / `soon` on light grey background
    - Sell/Go: `{n}` / `days out`
    - Lock: 🔒 / `locked`
    - Done: should show `✓` / `done` (check if implemented)
  - **Trip name**: bold, visible. If empty, falls back to destination.
  - **Meta line**: `{destination} · {dates} · {n} person/people` — verify `1 person` not `1 people`
  - **Rally meter** (sell cards only): progress bar with `rallied so far` label and `{n} / {target}` count
  - **Avatar stack**: member initials, max 5 + overflow `+N`
  - **Card action**: `keep building →` (sketch), `tap in →` (sell), `view trip →` (lock/go), `re-live it →` (done)
- [ ] Sticky CTA at bottom: `start a trip 🔥`
- [ ] Empty state (if no trips): emoji + `no trips yet` + `start one and see where it goes`

### 3. Trip page — sell phase (`/trip/[slug]`)

Open a trip that is in sell phase (e.g., a beach-trip themed trip).

**Check against lexicon §5.4-5.6 + theme content system + brand brief:**

#### Hero (PostcardHero)
- [ ] Marquee strip scrolling with theme phrases (e.g., "toes in · sunscreen check · beers on the beach")
- [ ] Sticker: theme-specific (e.g., `sand szn 🏖️` for beach-trip)
- [ ] Wordmark: `rally!` with bang in accent color — uses theme accent, not hardcoded pink
- [ ] Eyebrow: `★ {organizer} is calling` — **lowercase**, NOT ALL CAPS
- [ ] Trip name: large Shrikhand heading
- [ ] Tagline or destination below title
- [ ] Cover image (if set): edge-to-edge, above the header block

#### Countdowns
- [ ] **Hero countdown** (top): sensory/anticipation string from theme
  - Beach-trip: `days until toes in`
  - Ski-chalet: `days until first chair`
  - NOT `days to lock it in` (that's the deadline countdown)
- [ ] **Secondary countdown** (near RSVP): `days to lock it in` (deadline)
- [ ] Both countdowns tick down correctly (check the number matches actual days)
- [ ] FOMO flag on hero countdown (if theme defines one)

#### RSVP / Sticky bar
- [ ] Three-state sticky bar at bottom: in / holding / out
- [ ] **Chip icons are global** (never themed): 🙌 / 🧗 / —
- [ ] **Button text IS themed**:
  - Beach-trip: `sand szn 🏖️` / `checking the calendar 📅` / `can't make it 🥲`
  - Verify at least 3 different theme trips show different RSVP text
- [ ] Active state styling (pressed pill)
- [ ] Confetti on "in" tap
- [ ] Toast confirmation after RSVP

#### Going row
- [ ] Label: `who's coming 👇` (NOT `{n} going 👇`)
- [ ] Avatar stack of confirmed members

#### Content sections
- [ ] Lodging gallery: house cards with images, swipeable
- [ ] Cost breakdown: `what it runs` heading, per-person line
- [ ] Flights: search CTA if present
- [ ] Polls: `quick votes` section
- [ ] Activity: `what's happening` section
- [ ] Crew link: navigates to `/trip/[slug]/crew`
- [ ] Buzz link: navigates to `/trip/[slug]/buzz`

#### Footer
- [ ] Poetic footer: `rally is a doorway, not an app. close it and go pack.`

#### Theme integrity
- [ ] All text inside `[data-theme]` uses `var(--ink)` / `var(--on-surface)` / `var(--accent)` — NO hardcoded `#fff` or `white`
- [ ] Background follows `var(--bg)`
- [ ] Sticker background uses `var(--sticker-bg)`
- [ ] Borders use `var(--stroke)` or `var(--ink)`

### 4. Trip page — lock phase

Open a locked trip.

- [ ] Eyebrow: `locked in`
- [ ] Countdown: sensory signature (theme-specific), NOT deadline
- [ ] Tagline: `we're going 🚀`
- [ ] Lock banner: `the cabin is booked. the crew is set. nothing left to do but show up.`
- [ ] Sticker: locked variant (e.g., `we're going 🌊` for beach-trip)

### 5. Trip page — multiple themes

Open trips with at least 3 different themes and verify each renders with its own:
- [ ] Color palette (bg, ink, accent, sticker-bg all different)
- [ ] Marquee phrases (theme-specific)
- [ ] Sticker text (theme-specific)
- [ ] RSVP button labels (theme-specific, NOT defaults)
- [ ] Countdown signature (theme-specific sensory phrase)

**Critical theme to check:** Tortola trip should render as `tropical` (green palette, palm tree emoji), NOT `beach-trip` (teal/coral palette). If it shows beach-trip colors, this is a P0 data issue.

### 6. Invitee view (logged-out on a sell-phase trip)

Open a trip URL in incognito.

**Check against lexicon §5.17:**
- [ ] Inviter row: `{name} called you up` with mini avatar
- [ ] Sticker: `you're invited 💌`
- [ ] Eyebrow: `★ for {trip_name}` — lowercase
- [ ] Going label: `{n} already in (1 seat with your name) 👇`
- [ ] Locked plan section: blurred/locked with `🔒 locked` pill
- [ ] Overlay message: `sign in to see the plan ↑`
- [ ] Primary CTA: `see the plan →`
- [ ] Secondary CTA: `can't make it`
- [ ] Footer: `made with rally!`

### 7. Passport (`/passport`)

- [ ] Wordmark: `rally!` with pink bang
- [ ] Avatar: user initial on themed background
- [ ] Name, bio (or placeholder), est line with year + countries
- [ ] Stat strip: trips / ride or dies / countries
- [ ] Stamps grid: tilted stamp cards with trip info
- [ ] Ride or dies leaderboard
- [ ] CTA: `start a new one 🔥`

### 8. Buzz (`/trip/[slug]/buzz`)

- [ ] Back link to trip page
- [ ] Title: themed buzz heading
- [ ] Feed: system events + chat messages grouped by day
- [ ] Day dividers with date labels
- [ ] Event rows: icon + text + timestamp
- [ ] Comment bubbles: author name, text, reactions
- [ ] Compose bar (disabled):
  - Avatar shows **user's initial** (NOT "?")
  - Placeholder text in Caveat font
  - Send icon in Shrikhand
  - 50% opacity (disabled state)

### 9. Crew (`/trip/[slug]/crew`)

- [ ] Back link to trip page
- [ ] Summary chips: `{n} in`, `{n} holding`, `{n} out`
  - **Contrast check**: text must be readable against pill background (dark bg + light text OR light bg + dark text, 4.5:1 ratio minimum)
- [ ] Crew rows grouped by RSVP state: in → holding → out → pending
- [ ] Section captions: `locked and loaded` / `thinking about it` / `catch the next one` / `hasn't weighed in yet`
- [ ] Each row: avatar (initial), name, host/you badges, subtext (RSVP timing)
- [ ] Organizer always listed first within each group

---

## Cross-cutting checks

### Typography
- [ ] Shrikhand: wordmark, countdown numbers, send button, section headers
- [ ] Caveat: taglines, handwritten elements, compose placeholder
- [ ] DM Sans: body text, meta lines, buttons, chips
- [ ] No font loading flashes (FOUT) — check if `next/font` or `@font-face` with `font-display: swap` is working

### Voice rules (brand brief "Six Hard Rules")
- [ ] **Lowercase by default** — scan every heading, button, label, toast. Nothing should be UPPERCASE unless it's an acronym.
- [ ] **Sentence fragments** — no full sentences with periods in UI labels
- [ ] **Verbs over nouns** — `let me in` not `login`, `start a trip` not `trip creator`
- [ ] **One emoji max per string** — no emoji spam
- [ ] **Never break the fourth wall** — Rally never refers to itself in trip-context strings (no "Rally thinks..." or "powered by Rally" on trip pages)

### Color system
- [ ] Light mode only for v0 (no dark mode toggle)
- [ ] Accent color: per-theme, used for bang, CTAs, active states
- [ ] Ink: near-black, used for all body text
- [ ] Background: per-theme light tone
- [ ] Surface/on-surface: card surfaces (typically dark with light text)

### Spacing & layout
- [ ] Max-width container: ~430px centered (mobile-first, not desktop-optimized)
- [ ] Consistent padding: 18px horizontal on most surfaces
- [ ] Card border-radius: 14-18px with 2.5px solid borders + 4px shadow offsets
- [ ] Sticker rotation: slight tilts (-2° to 3°) per brand brief
- [ ] Animation: subtle entrance animations (fade-up), confetti on RSVP "in"

### Navigation
- [ ] Dashboard → trip page (tap card)
- [ ] Trip page → buzz (tap buzz link)
- [ ] Trip page → crew (tap crew link)
- [ ] Buzz/crew → trip page (back link)
- [ ] Trip page → passport (is navigation wired? flag if missing)

---

## Output format

For each finding, log:

```
## [SEVERITY] Surface — Short description

**Spec says:** {exact spec reference}
**Live shows:** {what you actually see}
**Screenshot:** {attach or describe}
**Fix:** {suggested fix if obvious}
```

Group findings by surface. Sort by severity within each group (P0 first).

At the end, provide a summary table:

| # | Sev | Surface | Issue | 
|---|-----|---------|-------|
| 1 | P0  | ...     | ...   |

---

## What's out of scope

- Desktop layout (v0 is mobile-first, desktop is a known gap)
- Email templates (separate QA pass)
- Write paths (compose, reactions, inline editing — all v0.1)
- Lock ceremony modal (v0.1)
- Performance / Lighthouse scores (separate task)
- Accessibility beyond color contrast (separate audit)
