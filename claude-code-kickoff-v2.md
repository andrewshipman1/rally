# Rally — Claude Code Kickoff v2 (Redesign Pass)

**Paste this as your opening prompt in a fresh Claude Code session.** It replaces `claude-code-all-prompts.md`, `claude-code-all-prompts copy.md`, `claude-code-master-prompt.md`, and `claude-code-qa-fixes.md` — all four are now deprecated. Do not paste those alongside this.

---

## Context

Rally is a group travel planning app — "Partiful for group trips." A v0 build already exists in this repo (Next.js 14 App Router, Supabase, Tailwind). It was built against an earlier design direction and now needs a full **redesign pass** against a new design system that's been completed and checked in.

**Your job this session is not to rebuild from scratch.** It's to overlay the new design system onto the existing v0, starting with the foundation (chassis, types, auth, trip page). Two more sessions will follow this one to handle the remaining surfaces and polish — scope for those is in §5 below.

## Read these files first, before writing any code

All source-of-truth lives in the repo root. **Read them in this order, fully:**

1. `rally-migration-scope-v0.md` — scope, decisions locked in §7, dangling items in §9. Read every `TODO(prd):` marker.
2. `rally-brand-brief-v0.md` — voice, position, the wordmark lock, the sticker kit lock.
3. `rally-microcopy-lexicon-v0.md` — every user-facing string, sectioned by surface (§5.1–§5.26). **This is typed data, not suggestions.** See §8 "Notes for Claude Code" at the bottom for the `lib/copy.ts` pattern.
4. `rally-theme-content-system.md` — 17 themes with palettes and string packs. Each theme is a palette + ~20 strings.
5. `rally-phase-1-directions.html` — the chassis kernel (CSS custom properties, dual-mode light/dark, the primitives every surface uses).
6. `rally-phase-1.5-color-flex.html` — theme variable application proof.
7. `rally-phase-2-theme-system.html` — trip page reference. *Note: this file predates the smart-link image decision — add an image slot to itinerary cards per lexicon §5.4 when building.*
8. `rally-phase-11-auth.html` — magic-link auth spec, 4 states.

Don't skim. The phase HTMLs are working mockups with the full CSS kernel inline; treat them as the visual + structural source of truth. If a phase HTML disagrees with the old v0 code, **the phase HTML wins.**

## Hard rules (non-negotiable)

1. **No inline user-facing strings.** Every string lives in `lib/copy.ts` keyed by surface. Themed strings are functions `(vars: ThemeVars) => string`. Enforce with a lint rule.
2. **Theme variables only.** No hardcoded colors in components. Everything reads from CSS custom properties (`--stroke`, `--surface`, `--on-surface`, `--bg`, `--ink`, `--accent`, `--accent2`, `--sticker-bg`). See phase 1.
3. **RSVP chips are locked global.** The icons 🙌 / 🧗 / — are not themeable. Only the viewer-side button CTA text is. See lexicon §5.10.
4. **No localStorage identity.** The old v0 stored guest identity in localStorage. Rip it out. Replace with server-issued httpOnly cookies signed with the user ID. See §2 below.
5. **Three-state RSVP (in / holding / out).** Not binary. See lexicon §5.10. The old v0's `maybe` field should be migrated to `holding`.
6. **Wordmark is Shrikhand `rally!`, lowercase, bang in accent color.** Never `Rally` or `RALLY`. See brand brief.
7. **Footer is `made with rally`** everywhere except the live trip page, which gets the poetic footer from §5.4.
8. **After every phase, stop and tell me what you built.** Don't chain phases without a checkpoint.

## This session's scope (Session 1 of 3 — Foundation)

Work through these in order. Checkpoint after each.

### 1. Chassis kernel → global styles
Port the CSS dual-mode kernel from `rally-phase-1-directions.html` into `src/styles/chassis.css` (or wherever the global sheet lives). Wire all 17 theme palettes from `rally-theme-content-system.md` as CSS-variable overrides. Every existing component should consume these variables.

### 2. Types refactor
- Update `src/types/index.ts` to match the three-state RSVP (`'in' | 'holding' | 'out'`).
- Add `Theme` type matching the theme content system structure: `{ id, palette, copy: ThemedCopy }` where `ThemedCopy` is a union of the per-surface string functions.
- Add `ThemeVars` type enumerating every variable from lexicon §5.22.
- Migrate the DB: rename `maybe` → `holding` in the enum, add any missing theme fields. Write the migration SQL.

### 3. `lib/copy.ts` module + sweep
- Create `src/lib/copy.ts` with every string from lexicon §5.1–§5.26, typed and keyed by surface.
- Create `src/lib/copy.global.ts` with `footer.made_with` and `share_link.copy`.
- Create `src/themes/*.ts` — one file per theme, each exporting `palette` + `copy` (the themed string functions).
- **Sweep the entire existing codebase** and replace every inline user-facing string with an import from `copy.ts`. This is the mechanical but critical part.

### 4. Auth overhaul — phase 11 spec
Follow `rally-phase-11-auth.html` and lexicon §5.24:
- Magic link only. 15-minute expiry, single-use, 30-day rolling session, 30s resend cooldown, 5/hour rate limit.
- Build the 4 states: landing, sent, expired, invalid.
- **Replace localStorage guest identity with httpOnly cookies.** The cookie is set on successful magic-link confirm and read server-side on every mutating endpoint (`/api/rsvp`, `/api/comments`, etc.). Return 401 if missing/invalid.
- **Backend provider is still TBD** (`TODO(prd): auth-backend-confirm`) — Andrew hasn't decided between Supabase Auth, Clerk, Resend-only custom JWT, or custom. Build it behind an interface so the provider can swap. Flag this at the checkpoint.
- Add input validation with Zod on every mutating endpoint. Rules in the old `claude-code-qa-fixes.md` §2 still apply — strip HTML tags from text inputs, URL scheme allowlist, SSRF protection on link enrichment, cost field bounds.

### 5. Trip page rebuild — phases 1, 1.5, 2
Rebuild the trip page using the chassis + theme variables + lexicon strings:
- Hero as postcard (edge-to-edge cover, see brand brief).
- Two countdowns: days-until-trip (hero) and days-until-cutoff (secondary).
- Lodging as gallery not card.
- Smart-link image primitive on itinerary cards (§5.4) — the image IS the link.
- Sticky bottom RSVP bar with three-state chips.
- Organizer card below hero.
- Cost breakdown: "split shared" mode only for v0 (the per-line-item toggle from old G9 is deferred).
- Countdown must be hydration-safe: `useState(null)` + compute only in `useEffect`, render `--` during SSR.
- Reactive after RSVP: `router.refresh()` on successful submit, guest count + per-person cost update without a reload.

### 6. Session 1 checkpoint
Stop. Tell me what's built, what you touched in the DB, what's left from this session's scope, and flag the auth backend decision.

## What's NOT in this session

Explicitly deferred to Session 2 or 3. Do not touch unless I say so:

- **Session 2 (Surfaces):** Builder (phase 4), Invitee pre-login (phase 5), Theme picker (phase 6), Crew subsurface (phase 9), Buzz feed (phase 10).
- **Session 3 (Polish):** Extras drawer (phase 7), Lodging voting (phase 8), Passport (phase 3.5), Dashboard (phase 3), motion pass, a11y sweep, remaining P1-P2 fixes, deploy.

## Session roadmap (for your awareness)

| Session | Focus | Phase specs | Est. scope |
|---|---|---|---|
| **1 (this one)** | Foundation | 1, 1.5, 2, 11 | chassis, types, copy.ts, auth overhaul, trip page |
| 2 | Surfaces | 4, 5, 6, 9, 10 | builder, invitee, theme picker, crew, buzz |
| 3 | Polish | 3, 3.5, 7, 8 | dashboard, passport, extras, lodging voting, motion, a11y, deploy |

Each session starts with the same file-reading sweep (§1 above) so context is fresh.

## Questions / blockers

Only one item needs Andrew's input before code ships (not before code starts):
- `TODO(prd): auth-backend-confirm` — provider choice. Spec is provider-agnostic; build against an interface.

Everything else has a decision in the scope doc §7 or the brand brief. If you find a gap, flag it at the next checkpoint — don't guess.

**Start by reading the 8 files in §1. Then give me a 5-bullet summary of what you found before writing any code.**
