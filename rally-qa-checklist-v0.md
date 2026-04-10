# Rally v0 — Visual QA Checklist

**Purpose:** Regression check for post-Session-4 verification. Run this after all fixes from `claude-code-kickoff-session-4-qa-fixes.md` are shipped.

**How to use:** Open rally-gold.vercel.app in Chrome and systematically walk every user-facing surface. For each surface:
1. Screenshot it at mobile width (390px)
2. Read the matching spec section from the docs in the repo: `rally-brand-brief-v0.md`, `rally-microcopy-lexicon-v0.md`, `rally-theme-content-system.md`
3. Compare every visible element: copy, color, spacing, typography, hierarchy, interaction states
4. Log every deviation as a finding with severity (P0/P1/P2)

**Severity key:**
- **P0** — Wrong data, broken feature, or crash
- **P1** — Spec says X, live shows Y. Visible to every user.
- **P2** — Visual polish, spacing, animation timing, minor deviation

---

## Surfaces to audit

### 1. Auth (`/auth`) — open logged-out

- Wordmark: `rally!` in Shrikhand, `!` in accent pink
- Tagline: `how friend groups get to "let's go"` in Caveat
- Button: `let me in`
- Submit a valid email → sent state: heading `check your inbox`, body `we just sent the door.`
- Footer: `made with rally!` with pink bang
- Try empty/invalid email, check error copy

### 2. Dashboard (`/`) — logged in

- Wordmark: `rally!` with pink bang
- Greeting: `hey {name} 👋`, H1: `where to next? ✈️`
- Scoreboard chips: word-first format (`cooking 3` not `3 cooking`), no "drafts" chip
- Trip cards: theme colors via `data-theme`, countdown stamps (sketch = `?/soon`), `1 person` not `1 people`, rally meter on sell cards, avatar stack, empty name fallback to destination
- Sticky CTA: `start a trip 🔥`

### 3. Trip page — sell phase (`/trip/[slug]`)

- Marquee scrolling with theme phrases
- Sticker: theme-specific
- Wordmark: `rally!` with bang in theme accent color
- Eyebrow: `★ {organizer} is calling` — lowercase, NOT ALL CAPS
- Hero countdown: sensory signature per theme (e.g., `days until toes in` for beach-trip), NOT `days to lock it in`
- Secondary countdown: `days to lock it in` (deadline)
- RSVP sticky bar: chip icons global (🙌/🧗/—), button text themed (beach-trip = `sand szn 🏖️`)
- Going label: `who's coming 👇`

### 4. Trip page — multiple themes

Open at least 3 different themed trips. Verify each has unique: palette, marquee, sticker, RSVP labels, countdown signature. Critical: Tortola trip must render as `tropical` (green), not `beach-trip` (teal/coral).

### 5. Invitee view (incognito on a sell-phase trip)

- `{name} called you up` with mini avatar
- Sticker: `you're invited 💌`
- Going label: `{n} already in (1 seat with your name) 👇`
- Locked plan with `🔒 locked` pill and `sign in to see the plan ↑`
- CTAs: `see the plan →` / `can't make it`
- Footer: `made with rally!`

### 6. Passport (`/passport`)

- Wordmark with pink bang, avatar, stats strip, stamps grid, ride or dies

### 7. Buzz (`/trip/[slug]/buzz`)

- Compose bar avatar shows user's initial (NOT "?")
- Feed grouped by day, events + comments

### 8. Crew (`/trip/[slug]/crew`)

- Summary chips: readable contrast (dark bg + light text)
- Rows grouped by RSVP state, organizer first

---

## Cross-cutting checks

- Lowercase everywhere — no ALL CAPS headings, buttons, or labels
- Typography: Shrikhand (wordmark, countdowns), Caveat (taglines), DM Sans (body)
- Theme integrity: all text inside `[data-theme]` uses CSS vars (`--ink`, `--on-surface`, `--accent`), no hardcoded `#fff`
- Voice rules: sentence fragments, verbs over nouns, one emoji max per string, Rally never refers to itself on trip pages

---

## Output format

For each finding:

```
## [P0/P1/P2] Surface — Short description
**Spec says:** ...
**Live shows:** ...
**Fix:** ...
```

End with a summary table: # | Sev | Surface | Issue

---

## Out of scope

Desktop layout, email templates, write paths (compose/reactions), lock ceremony modal, performance/Lighthouse, accessibility beyond contrast.
