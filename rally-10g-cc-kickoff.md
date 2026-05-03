Starting Session 10G: Themed fan-out invite email — visual brand pass.

Read in this order:

1. `.claude/skills/rally-session-guard/SKILL.md`
   — session loop, hard rules, escalation triggers, release-notes
   format. Read it fully before touching any file.

2. `rally-fix-plan-v1.md`
   — focus on:
   - "Session 10G: Themed fan-out invite email — visual brand pass"
     (your brief — scope, locked decisions, hard constraints, ACs,
     files-to-read list, QA-solo steps, known issues)
   - "Session 10I — Actuals" (most recent shipped session, captures
     where the auth identity arc closed and what carries forward)
   - "Session 10F — Actuals" (the lexicon-wire-up + voice work that
     10G builds the visual treatment on top of)

3. `rally-10g-mockup.html`
   — the parameterized template visual spec. Three themes
   (birthday-trip, beach-trip, ski-chalet) rendered side-by-side
   through one template. Your deliverable is the `email.ts`
   equivalent of this pattern, generalized to all 17 themes.

Where we are in the loop: Step 2 (execute). Brief is locked,
mockup is referenced. Build to the brief.

Scope is single-file: `src/lib/email.ts` only. Five items:

1. Resolve theme palette + strings via `getTheme(themeId)`. Inject
   inline (no `<style>` block — Gmail strips it).
2. Marquee strip at top (static HTML; mirror `.chassis .marquee`
   from `globals.css:432-458`).
3. Replace gradient/cover hero with themed accent block + sticker
   pill + organizer line + trip name + meta. `coverImageUrl` param
   stays in signature (API compat) but is unused in render.
4. Themed CTA (`see the trip →`, lowercase), paste-link block,
   footer (`rally · group trip planner` with middle dot in
   sticker-bg color).
5. Plain-text alternative unchanged.

Hard reminders (full list in the brief — these are the highest-risk):

- **Sticker text color is hardcoded `#1a1a1a`** — NOT a theme
  token. Reason: chassis `--stroke` flips light in dark themes
  (festival-run / boys-trip / city-weekend), which collapses
  contrast on the yellow `--sticker-bg` to 1.09–1.19:1. Hardcoded
  dark text is universally safe because `stickerBg` is yellow-
  leaning across all 17 themes. Document the deviation with a
  comment in `email.ts` referencing the contrast audit.
- **Festival-run hero contrast is marginal** (2.82:1 vs 3.0:1
  threshold). Accept and document in your release notes — do NOT
  fix by editing the festival-run theme file. Single-module
  discipline. The fix is logged for a future "all-theme contrast
  pass" session.
- **Zero new lexicon keys, zero new files, zero new components,
  zero theme-file edits.** Everything in `src/lib/email.ts`.
- **Inline styles only.** Every style attribute on every element.
- **Marquee is static.** Include the `@keyframes` + `animation`
  declaration anyway (Apple Mail honors it; everyone else ignores
  it — no fragility either way), but the email MUST be visually
  complete with the static first frame.
- **Plain-text fallback footer stays `— rally — group trip
  planner`** (em dashes). Only the HTML footer changes to the dot-
  accent variant.

When done, write Session 10G — Release Notes into
`rally-fix-plan-v1.md` directly below the 10G brief, following the
release-notes format in the session guard skill (Part 2, Step 3).
Include:

- What was built (per scope item, file:line where useful)
- What changed from the brief (deviations, additions, items skipped)
- What to test (testable items for Andrew's QA — include the live
  3-theme verification AND the 3 dark-theme sticker spot-check from
  the brief's ACs, AND the 10F email lexicon verification rolled in)
- Static verification (tsc, build, git diff --stat)
- Known issues (anything flagged but not fixed; include the
  festival-run contrast value you measured)
- Architecture sanity (the no-touch list from the brief, each
  confirmed)

If you hit any escalation trigger (architecture decision, scope
ambiguity, scope creep, copy decision not in lexicon, deletion of
existing code, AC unmeetable with current approach) — STOP and ask
Andrew. Don't improvise.

Standard pre-flight: `cd ~/Desktop/claude/rally && npm run dev`,
verify the between-session QA check from the skill (create trip,
edit name, share link, scroll trip page, etc.) passes before
starting new work.
