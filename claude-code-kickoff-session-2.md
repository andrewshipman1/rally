# Rally — Claude Code Kickoff, Session 2 (Surfaces)

**Paste this as your opening prompt in a fresh Claude Code session.** Session 1 is complete (see `SESSION-1-RELEASE.md`). This session builds the five surface pages that depend on the chassis + types + lexicon foundation that already landed.

---

## Context

You are picking up a Rally redesign mid-build. Session 1 shipped the foundation: chassis kernel, 17 themes, `lib/copy.ts`, auth overhaul, and a rebuilt trip page. Everything compiles, lint is clean on Session 1 surfaces, and `SESSION-1-RELEASE.md` documents what landed and what's still debt.

Your job this session is **Session 2 (Surfaces):** builder, invitee pre-login, theme picker, crew subsurface, and buzz feed. Five phase specs, one session.

## Before you write a single line of code

Work through this preflight in order. Each step is mandatory. Report findings at each step before moving on.

### Preflight 1 — Read the design system (fresh context)

Read these files fully. Don't skim. If you read them during Session 1, read them again — context is fresh each session.

1. `rally-migration-scope-v0.md` — §7 decisions, §9 dangling items.
2. `rally-brand-brief-v0.md` — wordmark lock, sticker kit lock.
3. `rally-microcopy-lexicon-v0.md` — **pay special attention to §5.16 (builder), §5.17 (invitee), §5.20 (lodging voting strings — some are used by the builder), §5.21 (extras — same), §5.22 (theme variable catalog), §5.23 (theme picker), §5.25 (crew), §5.26 (buzz).** These are the surfaces you're building against.
4. `rally-theme-content-system.md` — 17 themes, palettes + string packs.
5. `rally-phase-4-builder.html`
6. `rally-phase-5-invitee.html`
7. `rally-phase-6-theme-picker.html`
8. `rally-phase-9-crew.html`
9. `rally-phase-10-activity.html` (buzz)
10. `SESSION-1-RELEASE.md` — know what shipped and what's still debt.

If a phase HTML disagrees with any existing code, **the phase HTML wins.**

### Preflight 2 — Verify the lexicon stubs state

Open `src/lib/copy.ts`. For the Session 2 surfaces (builder, invitee, theme picker, crew, buzz, and the builder-adjacent lodging-voting/extras entries), check whether the string objects are:

- **Option A — empty `{}` or partial stubs:** Populate them from the lexicon doc as **task zero** before any component work. Every string lives in `copy.ts` as a typed function; no inline literals. Report how many strings you added.
- **Option B — already scaffolded with lexicon content:** Skip population, just wire imports. Report that you verified and move on.

Either way, **do not start component work until `copy.ts` has content for every Session 2 surface.** The sweep cost is small; the cost of fixing it mid-component is high.

### Preflight 3 — Task zero: seed the 6 missing themes

Six themes are not yet in the DB: **Boys Trip, Reunion, Festival, Desert, Camping, Tropical.** The theme picker (phase 6) is the centerpiece of this session. If 6 of 17 tiles fall through to "just because" when selected, the picker is broken.

Write `supabase/migrations/007_new_themes.sql` that inserts these 6 themes with palettes matching `rally-theme-content-system.md`. (Migrations 001–006 are already taken — next free slot is 007.) Apply it. Verify all 17 themes are queryable before moving on. This runs before any picker work.

### Preflight 4 — Visual verification of Session 1

Before adding new surfaces on top of the chassis, confirm the Session 1 trip page actually looks right. Start the dev server, open a seeded trip at `/trip/[slug]`, and compare it side-by-side with `rally-phase-2-theme-system.html` opened in another tab. Check:

- Postcard hero is edge-to-edge (no boxed image on desktop).
- Both countdowns render (days-until-trip hero + days-until-cutoff secondary).
- Lodging gallery layout matches the phase 2 mockup.
- Sticky RSVP bar is three-state with the locked global chip icons 🙌 / 🧗 / —.
- Chassis theme swap works — try at least three themes and confirm the CSS variables cascade correctly.

If any of these don't match, **stop and fix before Session 2 work.** That's Session 1 debt, not Session 2 scope — but if it's broken, Session 2 builds on sand.

### Preflight 5 — Boundary mapper contract tests

The RSVP boundary mapper (legacy `maybe` ↔ new `holding`) was the big Session 1 architectural call. **Decision locked:** the mapper is **temporary**, with the DB migration happening in Session 3. Until then, it needs contract test coverage so drift fails at CI, not at runtime.

Write a unit test suite in `src/lib/__tests__/rsvp-boundary.test.ts` covering:

- Every legacy → new transition (`in`→`in`, `maybe`→`holding`, `out`→`out`, plus any null/undefined handling).
- Every new → legacy transition (same set in reverse).
- Round-trip invariant: `toLegacy(toNew(x)) === x` for every legacy value, and vice versa.
- One failing case for an unknown value (should throw or return a sentinel, not silently default).

Run the suite. It should pass. This is cheap insurance until the migration lands.

## Hard rules (same as Session 1 — do not relax)

1. **No inline user-facing strings.** Everything through `copy.ts`.
2. **Theme variables only.** No hardcoded colors.
3. **RSVP chip icons 🙌 / 🧗 / — are global.** Use `RSVP_CHIP_ICONS` from Session 1. Only button CTA text is themeable.
4. **Wordmark is Shrikhand `rally!`** — lowercase, bang in accent color.
5. **Footer is `made with rally`** everywhere except the live trip page.
6. **Boundary mapper** — every RSVP read/write from a DB source passes through the mapper. No raw legacy values leaking into new components.
7. **After every phase, stop and checkpoint.** Don't chain all five phases without telling me what you built.

## This session's scope (Session 2 — Surfaces)

Build in this order. Checkpoint after each phase.

### 1. Phase 4 — Trip builder (`rally-phase-4-builder.html`)

The trip page IS the builder. No wizard, no modal, no separate form. Sketch state of the trip page with empty fields, inline editing, handwritten placeholder hints, and a disabled "send it to the group" CTA that ungates when the gates are met (see lexicon §5.16: name ≥3 chars + at least one date + at least one invited person other than organizer).

- Route: refactor `/edit/[id]` to render the chassis with the trip's selected theme (even in sketch state — default theme is "just because"). No white admin form.
- Inline field editing: tap title → input in place, same for tagline, when, where.
- Auto-save every edit. The ✏️ manual save button is a safety net, not the primary save path.
- Share-link copy button uses `copy.global.share_link.copy` + the copied toast.
- Sticker treatment on the "new rally ✨" eyebrow — use the uniform sticker recipe from the brand brief.
- Checkpoint: demo a new trip flow end-to-end from "untitled rally" to "send it to the group 🚀."

### 2. Phase 5 — Invitee pre-login (`rally-phase-5-invitee.html`)

The first screen a non-user sees. Login gate, not RSVP gate. Every string pulls dual duty: convert to a user AND communicate social obligation.

- Route: `/trip/[slug]` detects no auth session → renders the invitee state instead of the full trip page.
- Inviter row replaces the live-row: `{inviter_first} called you up`.
- "You're invited 💌" sticker, blurred/locked "the plan" section below.
- Two CTAs: primary `see the plan →` (triggers magic-link flow from Session 1 auth), secondary `can't make it` (logs a pre-login decline with the "before seeing the plan" asterisk in lexicon §5.17).
- **Post-sign-in transition:** locked section unblurs in place, sticky bar swaps to three-state RSVP, page becomes the full trip page. **Same chassis, new permissions.** Do not rebuild the trip page — just flip the auth state and let React re-render.
- Checkpoint: test the full invitee → auth → authenticated trip page flow.

### 3. Phase 6 — Theme picker (`rally-phase-6-theme-picker.html`)

The surface where the organizer chooses the vibe. Lives inside the builder as a full-page overlay (not a modal).

- Grid of all 17 theme tiles. Each tile = colored gradient background + Shrikhand 26px title + Caveat 18px tagline. No sticker, no filter chips on the tile itself, no meta row. See `copy.themePicker.tileTagline` for the 17 taglines.
- Filters: all / weekends / big trips / milestones / chill (OR within group).
- Search: matches on theme name + tagline.
- Selected tile shows `picked ✓` badge.
- Live preview rail on desktop / bottom sheet on mobile showing the chassis with the picked theme's CSS variables applied.
- CTA: disabled → `pick one to keep going` · picked → `lock the vibe →`.
- Confirmation toast: `vibe locked. {theme.name} it is.`
- Change-later hint below the CTA: `you can swap it later. nothing is final.`
- Checkpoint: verify all 17 tiles render their correct palette (this is where the preflight 3 migration pays off).

### 4. Phase 9 — Crew subsurface (`rally-phase-9-crew.html`)

Read-only v0. Anyone on the trip can open it. No nudges, kicks, role changes, or co-host promotion (see scope §7.4).

- Route: `/trip/[slug]/crew` or a subsurface route under the trip page.
- Summary block: counts of in / holding / out.
- Three sections (in / holding / out), each with a themeable caption (default captions in lexicon §5.25; per-theme overrides live in theme packs).
- Row pattern: avatar, name, optional "you" tag, optional 👑 host marker, chip icon (locked global), sub-text (rsvp'd when / opened / unopened / +1 info).
- Out rows stay visible but dimmed (opacity 0.55) with strikethrough. Never hidden, never collapsed.
- +1s are nested as sub-text under the inviter's row.
- Checkpoint: verify the boundary mapper is used on every RSVP read (this is the first surface post-Session-1 that reads crew-wide RSVP state).

### 5. Phase 10 — Buzz feed (`rally-phase-10-activity.html`)

Reverse-chron feed mixing system events (rsvps, votes, lock-ins) with short chat posts. Compose at the top, newest below. Reactions on every row. Visible to everyone on the trip regardless of RSVP state.

- Route: `/trip/[slug]/buzz` or a subsurface route.
- Two row types: **event** (flat text, sticker-colored icon, no bubble) and **post** (chat bubble, accent color if mine, flipped right if mine).
- Compose box at top. Placeholder is themeable (`compose_placeholder` in each theme pack — e.g. "what's the chair chat?" for ski).
- Day dividers (today, yesterday, weekday + date).
- Event strings templated server-side from the activity log (lexicon §5.26 has the full list).
- Post content is user-generated, rendered as plain text. **No markdown, no links, no media in v0.**
- Reactions: tap any row to react, one pill cluster per row. Default set from lexicon §5.26; each theme adds one signature reaction.
- **Deferred (do not build):** threading, @mentions, media, read receipts, muting, edit/delete.
- Checkpoint: demo the compose → post → event interleave with at least one reaction added.

### 6. Session 2 final checkpoint

Stop. Tell me:
- What's built (files touched, files new).
- Any phase HTML deviations and why.
- Remaining Session 2 debt (if you had to defer anything).
- What new Session 3 items surfaced that weren't on the original Session 3 list.
- `tsc --noEmit` status + lint status on new surfaces.

## What's NOT in this session

Explicitly deferred to Session 3. Do not touch:

- **Phase 3 — Organizer dashboard.** Stays on v0 code.
- **Phase 3.5 — Passport / profile.** Stays on v0 code.
- **Phase 7 — Extras drawer.** The lodging voting cards in the builder can use §5.21 strings but the full extras drawer UI is Session 3.
- **Phase 8 — Lodging voting.** Same — strings available but the full voting card UI is Session 3.
- **Legacy lint warning cleanup.** Every legacy component that warns stays warning. Session 3 batches the cleanup in one pass. Do not refactor legacy components unless you have to.
- **DB migration for `maybe` → `holding`.** The boundary mapper is in place; migration is Session 3.
- **Motion pass, a11y sweep, deploy.** All Session 3.

## Open blockers (inherited from Session 1)

- `TODO(prd): auth-backend-confirm` — Andrew still owes a provider decision. The `AuthProvider` interface from Session 1 handles the swap. Not a Session 2 blocker.
- **Rate-limit storage is in-memory.** Not a Session 2 blocker (single-dev dev loop). Must land in Session 3 or pre-deploy.

## Session roadmap (reminder)

| Session | Focus | Phase specs | Status |
|---|---|---|---|
| 1 | Foundation | 1, 1.5, 2, 11 | ✅ Shipped |
| **2 (this one)** | Surfaces | 4, 5, 6, 9, 10 | 🟡 In progress |
| 3 | Polish | 3, 3.5, 7, 8 + debt | 🔜 Next |

## Start here

1. Run preflights 1–5 in order. Report at each step.
2. After preflight 5 passes, start Phase 4 (builder).
3. Checkpoint after every phase. Do not chain.

**Begin with preflight 1 — read the 10 files and give me a 5-bullet summary of what changed since the Session 1 release you remember from `SESSION-1-RELEASE.md` vs. what's in the design docs now.**
