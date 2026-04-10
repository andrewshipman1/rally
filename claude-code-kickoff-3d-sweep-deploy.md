# Rally — Claude Code Kickoff, Session 3D (Sweep + motion + a11y + deploy)

**Paste this as your opening prompt in a fresh Claude Code session.** 3A, 3B, and 3C must all be closed and green before starting this. This is the final pass before v0 ships.

---

## Context

Three sub-sessions of Session 3 have landed:

- **3A:** DB bundle + Session 2 debt (migrations, boundary mapper deletion, crew subtext, Phase 5 fix, orphan keys, theme categories, rate limiter).
- **3B:** Buzz + Dashboard + Passport (three read-heavy surfaces).
- **3C:** Extras + Lodging voting + Lock flow (three write-side workflows).

Your job this session (**3D**) is the final polish pass: delete legacy code, zero out lint warnings, add motion, sweep a11y, final QA, and deploy.

**This is the session that ships v0.** Take it seriously. Every "I'll fix that later" item from Sessions 1–3C comes due here.

Master plan: `session-3-master-scope.md`.

## Before you write a single line of code

### Preflight 1 — Read

1. `session-3-master-scope.md` — specifically the **3D section**.
2. All three of: `SESSION-1-RELEASE.md`, `SESSION-2-RELEASE.md`, and whatever 3A/3B/3C left as release notes.
3. `rally-phase-1-directions.html` — the chassis kernel. You're about to a11y-audit every component that consumes it.
4. `_archive/claude-code-all-prompts.md` — **only Prompt 10 (the motion pass).** It has the full motion list. Do not read the rest of that file.

### Preflight 2 — Baseline everything

Report these numbers before touching anything:

- `tsc --noEmit` error count (should be 0).
- Lint warning count, broken down by file.
- `rg "className.*#[0-9a-f]{3,6}"` hits (hardcoded colors — should be 0).
- `rg "localStorage\." src/` hits (should be 0 — Session 1 ripped it out).
- Count of files matching the dead-code list below that still exist.
- Size of production build (`next build`).

### Preflight 3 — Green light check

- `auth-backend-confirm` — **LOCKED**: Supabase Auth with Resend as the SMTP provider. This session must: (a) configure Resend as the Supabase Auth SMTP provider, (b) write custom HTML email templates for magic-link / confirmation / recovery that match the Rally brand (Shrikhand wordmark, theme colors, lexicon copy), (c) set the Supabase `Site URL` to the prod domain and add staging as an additional redirect URL, (d) verify magic-link delivery end-to-end via Resend (not the Supabase default SMTP).
- Have all 3A E2E verifications passed? All 3B surfaces render? All 3C workflows work?
- If any of these are no, deploy is blocked. Tell Andrew.

## Hard rules

1. **Dead-code sweep is one commit.** Not one commit per file. Bundle.
2. **Motion pass must respect `prefers-reduced-motion`.** Every animation has a reduced-motion fallback.
3. **A11y is non-negotiable.** Every interactive element has a focus state and an accessible label. No exceptions for "it looks fine."
4. **Zero lint warnings at the end of this session.** Session 1 wired up `react/jsx-no-literals`; by end of 3D it should report zero.
5. **Deploy only after all above are green.**
6. **Checkpoint after every major section.**

## This session's scope (3D — Sweep + polish + deploy)

### Section 1 — Dead-code sweep

Delete in one batched commit:

- `src/components/GuestList.tsx`
- `src/components/AuthFlow.tsx`
- `src/components/Countdown.tsx`
- `src/components/StickyRsvpBar.tsx`
- `src/components/CoverHeader.tsx`
- `src/components/CollageAvatars.tsx`
- `src/components/LodgingCarousel.tsx`
- `src/components/ActivityFeed.tsx`
- `src/components/ExtrasSections.tsx` (if 3C replaced it)
- The legacy `/edit/[id]` admin path
- `EditorToolbar.tsx`'s inline `ThemePanel` (keep the toolbar shell if something still references it; delete the inline theme panel either way)
- Any file in the codebase that's not reachable from the current App Router tree (run a dead-code detector or grep for imports)

Before deleting each: grep for imports. If something still imports it, fix the consumer first. One commit, one CI run, confirm green.

**Checkpoint:** Report the file count deleted, the LOC delta, `tsc --noEmit` status.

### Section 2 — Legacy lint cleanup

`react/jsx-no-literals` should report zero warnings by end of this section.

- Run the linter. For each warning, either:
  - (a) Sweep the string into `copy.ts` and update the component, or
  - (b) Delete the component if it's dead (should already be gone from section 1).
- Some warnings are false positives (aria labels, test IDs). Suppress those with inline disable comments — but be judicious.

**Checkpoint:** Lint warning count = 0. If not zero, explain each remaining warning.

### Section 3 — Motion pass

Per `_archive/claude-code-all-prompts.md` Prompt 10, plus what's sane for this chassis:

- Scroll-triggered fade-ins on each trip page section (staggered, 50–100ms stagger).
- Hero text load animation (fade + slight up-translate on mount).
- Avatar pop-in on crew section (cascade, 40ms stagger).
- Countdown pulse on the final day (subtle scale, 2s loop).
- RSVP confetti on in-state transition (use `canvas-confetti` or equivalent; one-shot, dismissible).
- Date poll selection scale (100ms scale to 1.05 and back).
- Guest list slide-in on subsurface mount.

Every animation must:

- Respect `prefers-reduced-motion: reduce` — fall back to instant or opacity-only.
- Use CSS transforms, not layout properties.
- Not block interaction during the animation.

**Checkpoint:** Demo each animation. Then toggle `prefers-reduced-motion` in DevTools and demo the reduced-motion path for each.

### Section 4 — A11y sweep

- **Focus states:** every interactive element has a visible focus ring. Use the chassis `--stroke` variable. No `outline: none` without a replacement.
- **Icon-only buttons:** every one has an `aria-label`.
- **Keyboard navigation:**
  - Theme picker sheet: arrow keys navigate tiles, Enter selects, Escape closes.
  - RSVP bar: tab through chips, Enter activates.
  - Crew subsurface: tab order is top-down, logical.
- **Contrast audit:** run every one of the 17 themes through a contrast checker. Ratios must hit WCAG AA for body text (4.5:1) and large text (3:1). Report any theme that fails and propose palette tweaks.
- **Screen reader pass:** use VoiceOver (Mac) or NVDA (Windows). Walk through the trip page, the invitee pre-login state, the theme picker, the crew, and the buzz. The blurred locked-plan state on the invitee page should announce correctly — e.g., "Content locked. Sign in to view the plan."

**Checkpoint:** Report each category's status. Any theme that failed contrast needs a palette tweak before deploy.

### Section 5 — Final QA pass

Walk through every surface with a real authed session. For each surface, open the phase HTML spec in another tab and compare side-by-side:

- Trip page (phases 1, 1.5, 2)
- Dashboard (phase 3)
- Passport (phase 3.5)
- Builder (phase 4)
- Invitee pre-login (phase 5)
- Theme picker (phase 6)
- Extras (phase 7)
- Lodging voting (phase 8)
- Crew (phase 9)
- Buzz (phase 10)
- Auth (phase 11)

Fix any visual drift. This is not a place to relitigate design decisions — if you disagree with the spec, flag it and ship the spec as-is.

**Checkpoint:** Report any deviations found and fixed. Any deviations you chose not to fix need justification.

### Section 6 — Deploy

Gate checklist — all must be true:

- [ ] `tsc --noEmit` clean
- [ ] Lint warnings = 0
- [ ] Dead-code sweep landed
- [ ] Motion pass landed + reduced-motion verified
- [ ] A11y sweep landed + all 17 themes pass contrast
- [ ] Final QA pass landed
- [ ] Auth backend provider decided (D1) and swapped in
- [ ] Rate limiter is Supabase-backed (not in-memory) — inherited from 3A
- [ ] `next build` succeeds with no warnings
- [ ] Environment variables documented (`.env.example` up to date)
- [ ] Supabase migrations in source control, applied to prod DB

**Deploy target: production, direct.** D4 is locked — no staging environment exists yet, standing one up is v0.1 scope.

Pre-deploy safety checks (all must be true before pushing the button):

- [ ] Final QA pass (section 5) completed line-by-line against every phase spec
- [ ] Supabase point-in-time recovery enabled on the prod project (confirm in Supabase dashboard)
- [ ] Resend SMTP verified end-to-end with a real magic-link delivery on the prod domain
- [ ] `DEPLOY.md` runbook written (see below) — this is a hard requirement, not a nice-to-have
- [ ] Rollback plan documented: what to do if the first smoke test reveals a broken build

Immediate post-deploy smoke test (Andrew or you acting as first real user):

- [ ] Sign up with a real email, receive magic link via Resend, click through
- [ ] Create a trip end-to-end (builder → theme picker → lock cutoff date)
- [ ] Invite a second email, RSVP as that invitee
- [ ] Check the crew subsurface shows both rows correctly
- [ ] Check the buzz surface logs the events
- [ ] Verify no console errors in the first 5 minutes

If any smoke test step fails, roll back before doing anything else.

**Checkpoint after deploy:**

- URL of the deployed environment.
- Smoke test results on at least: sign-up flow, create trip, theme picker, invite flow, RSVP, lock flow.
- Any runtime errors in the first 10 minutes.

### Section 7 — Handoff docs

Write **two** docs in the rally folder.

**`V0-RELEASE.md`** — the what-shipped doc:

- What shipped (phases + surfaces).
- Known issues / v0.1 deferrals (staging environment setup is one of these — name it explicitly).
- How to run locally.
- How to add a new theme.
- How to add a new lexicon string.
- Where each source of truth lives.

This replaces all four Claude Code kickoff prompts once v0 is out the door.

**`DEPLOY.md`** — the runbook:

- Exact sequence of steps to deploy a new build to prod.
- Environment variables required (with a pointer to `.env.example`, never with actual values).
- Supabase migration application process (how to check what's applied, how to apply the next one, how to roll back).
- Resend configuration steps (API key location, template location, SMTP settings in Supabase Auth).
- Domain DNS configuration.
- Smoke test checklist (copy from section 6).
- Rollback procedure — the exact commands to revert a bad deploy.
- Known deploy gotchas discovered during this session.

This doc is the spec for what staging will need to replicate in v0.1. Every step listed here is a step the staging environment will also need. Write it that way — concrete, copy-pasteable, with no hand-waving.

## What's NOT in this session

- Any new feature work. Every item not listed in 3A/3B/3C/3D is v0.1 or later.
- OG image generation for link previews — *unless* section 5 finishes early and Andrew asks to bundle it in.

## Start here

1. Run preflights 1–3. Stop at preflight 3 if the auth backend isn't decided.
2. Section 1 → checkpoint → 2 → checkpoint → 3 → checkpoint → 4 → checkpoint → 5 → checkpoint → 6 (deploy) → 7 (handoff doc).
3. Do not chain sections.

**Begin with preflight 1.**
