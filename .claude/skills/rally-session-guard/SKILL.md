---
name: rally
description: >
  The complete Rally development workflow — covers architecture guardrails, the
  session loop (brief → execute → release notes → QA → update plan), escalation
  triggers, bug triage, and project rules. Use this skill at the START of every
  session on the Rally project, whether in Claude Code or Cowork. In Claude Code:
  triggers before writing any code, creating files, or making architectural decisions.
  In Cowork: triggers when Andrew says "let's QA", "what did Claude Code do", "plan
  the next session", "review the fix plan", "write a brief", "update the plan",
  "what's left", or any reference to the Rally workflow. Also trigger when receiving
  release notes, transitioning between phases, or when unsure whether this skill
  applies — it does.
---

# Rally

Rally is a group trip planning app. This skill governs how every session works —
both Claude Code (building) and Cowork (planning, QA, handoff). It exists because
Sessions 1–4 drifted: features got built as separate pages, copy was hardcoded,
and architectural decisions compounded into 45 QA issues.

**Read this entire file before doing anything.**

---

## Part 1: Project Rules (Always Active)

These rules apply in every session, every context, every step of the loop.

### The 3-Screen Rule (non-negotiable)

Rally has exactly three screens:

```
/auth          → magic link login
/              → dashboard (trip list + scoreboard)
/trip/[slug]   → the trip page (single scrollable surface, ALL features inline)
```

Every feature — crew list, buzz feed, lodging voting, extras, theme picker, lock
flow — lives as a section or bottom sheet on the trip page. No sub-routes, no tabs,
no separate pages for sub-features. If a feature "needs" its own page, that feeling
is wrong. Stop and escalate to Andrew.

### Trip Page Module Order

When complete, the trip page scrolls through these sections top to bottom:

```
marquee strip → trip header / hero → countdown
MODULE: the headliner (optional, singular trip-level premise — 8J)
MODULE: lodging ("the spot")
MODULE: getting here (sell+ only — per-crew arrival estimator; branches by
  mode: flight / drive / train / other; flight uses Google Flights
  deep-link, passport-aware — Session 9B)
MODULE: transportation (flight-as-type, multi-leg, per-line cost unit — 8I)
MODULE: everything else (activities + provisions + other — single per-person estimates each — 8P)
cost summary (aggregates all line-item modules above → per-person estimate)
MODULE: crew (who's in / holding / out — shows RSVP status per person)
MODULE: buzz (activity feed)
MODULE: aux / extras (playlist now; packing list, rules, album later)
footer + [sticky RSVP bar]
```

**Ordering rule: cost summary always sits directly below the last line-item
module.** Any module that contributes a cost estimate (headliner, spot,
getting here, transportation, everything else) renders above cost summary;
anything that doesn't contribute a cost (crew, buzz, aux) renders below.
Locked 2026-04-21.

**Canonical sketch-page design reference:** `rally-sketch-modules-v2-mockup.html`.
Pre-8I wireframes (`rally-sketch-form-wireframe.html`,
`rally-phase-4-builder.html`, sketch sections of
`rally-trip-page-wireframe.html`) are deprecated and must NOT be used for
module order or shape.

### Phase System

Trips move through: sketch → sell → lock → go → done. Each phase has different
UI states, countdown targets, and available actions. In sell phase, the hero
countdown targets `commit_deadline` ("days to lock it in"). In lock/go, it
targets `date_start`.

### Hard Rules

- **Mobile-first.** Build for 375px. If it doesn't work at 375px, it doesn't work.
- **No new routes.** Three screens. That's it.
- **No hardcoded strings in JSX.** All user-facing text from `lib/copy.ts`.
- **No hardcoded colors inside `[data-theme]`.** Use CSS variables (`--bg`, `--ink`,
  `--accent`, `--accent2`, `--sticker-bg`, `--surface`, `--on-surface`).
- **No dead-end interactions.** Every tap target must produce a visible result.
  If it can't yet, hide it.
- **The trip page is one scroll.** Sections stack vertically. No tabs, no sub-nav.
- **Copy style:** lowercase default, sentence fragments, verbs over nouns, one
  emoji max per string. Rally never refers to itself on trip pages.
- **Test in the browser before declaring done.**
- **CSS changes to `globals.css` require clearing `.next` before QA** (`rm -rf .next && npm run dev`). Stale Turbopack chunks bit us in 8M — always flush.
- **Pre-booked costs only in sketch/sell.** Modules capture expenses that get
  booked ahead of the trip (rental car, train ticket, lodging deposit, prepaid
  tour). Costs incurred during the trip (gas at the pump, day-of rideshare,
  restaurant tabs, impulse cocktails) belong to the go phase and will be
  tracked by a separate mechanism — do not build them into sketch/sell modules.
- **All costs are estimates, labeled as such.** Every cost input and summary
  must be framed as "estimated." Never present a number as a commitment or
  binding total. Use "estimated cost," "rough total," "per-person estimate"
  style copy — never "cost" or "total" alone.
- **Design ROI principle (project-wide, ruling).** Optimize for the highest
  return on visual impact and customer experience per unit of development
  cost and complexity. When a choice is between two paths that reach the
  same user outcome, pick the one with lower implementation cost. When a
  feature adds complexity without materially improving perceived quality
  or conversion, cut it. This rule overrides "completeness" — shipping a
  polished, narrow surface beats shipping a wide, mediocre one. Applies
  to every session, every module, every decision. If a brief adds
  complexity not justified by visual/experiential return, push back
  before building.
- **Single-module discipline.** Each session touches ONE module (plus its
  data layer + cost-summary wiring, if relevant). NEVER modify trip-level
  fields (trip name, start/end dates, destination, meetup location,
  RSVP-by, phase, theme, commit_deadline), the header/hero, the marquee
  strip, the countdown, the "getting here" slot, the sticky publish bar,
  or ANY other module unless it is explicitly named in the session's
  scope. If a fix "feels obvious" while working in an unrelated file —
  STOP, log it, move on. This rule is what keeps sessions shippable and
  QA-able.
- **Reuse before rebuild.** Before creating a new component, copy
  surface, CSS primitive, or server action, check whether an existing
  one can serve the need with an added prop, mode, or small extension.
  Two things doing the same job is debt: they drift, they double the
  test surface, and they force every change to be made twice. This
  applies project-wide — not just sketch → sell. Concrete patterns to
  favor: adding a `readOnly` / `mode` / `phase` prop to an existing
  component instead of forking a parallel one (as 9H did with
  `Headliner.tsx`, as 9I does with `LodgingCard.tsx`); extending a
  lexicon surface rather than adding a new one; using existing CSS
  primitives (`.module-section`, `.module-card`, etc.) over new
  classes. Build-new is fine when genuinely new — but "slight
  variation of a thing that already exists" usually isn't. Rule of
  thumb: if you're about to create `Sell<X>` or `V2<X>` or
  `<X>Alt`, stop and ask whether a prop on the existing `<X>`
  would do. This is how we ship faster and keep quality high: one
  component tested once, one source of truth.

### Local Environment

Andrew's Rally repo lives at `~/Desktop/claude/rally` on his MacBook Air.
When walking him through any local command, prefix with `cd ~/Desktop/claude/rally`.
Standard startup sequence:

```bash
cd ~/Desktop/claude/rally
supabase migration up   # only when a new migration has landed
npm run dev             # http://localhost:3000
```

### Single Source of Truth

`rally-fix-plan-v1.md` is the only **plan** document. Don't create HANDOFF.md,
TODO.md, SESSION-NOTES.md, or any other planning docs. Everything lives in the
fix plan.

**Strategy docs are the exception** (see Document Taxonomy below). They're
reference material, not session planning, and live as their own `.md` files
at the repo root.

### Document Taxonomy

Rally tracks four kinds of artifacts. Knowing which kind you're working with
prevents drift between strategic context, tactical scoping, and execution.

**1. Strategy doc** — `rally-<arc>-strategy-v0.md` (e.g.,
`rally-attendee-strategy-v0.md`, `rally-lock-phase-strategy-v0.md`).
- Long-horizon reference defining the WHY/HOW for a major arc of work.
- Lives at the repo root as its own `.md` file. NOT inside the fix plan.
- Multiple sessions cascade FROM it.
- Standard structure: Purpose, Decisions Locked, Open Questions, Dimensions,
  Implementation sub-sessions.
- Stays open across many sessions; closes when the arc is fully shipped or
  all open questions resolved/folded into other arcs.
- Exempt from the SSOT rule above — strategy docs are reference material.

**2. Session brief** — lives inside `rally-fix-plan-v1.md` under the session's
`### Session N:` heading.
- Defines WHAT a session will build.
- Standard structure per Part 2 Step 1: Scope, Hard Constraints, ACs, Files
  to Read, How to QA Solo.
- Cascades INTO release notes + Actuals as the session progresses.

**3. Backlog brief** — lives in the `### Backlog (TBD sessions, snapshot
YYYY-MM-DD)` section near the bottom of `rally-fix-plan-v1.md`, organized by
arc category (🐛 bugs / 🧭 in-flight / 🏗️ strategic / 🎨 design / ✨ polish /
⏸ open / 🔮 future).
- Same shape as a session brief, but no session number yet.
- Promoted INTO a numbered session when execution begins.
- Standalone bugs / polish items / future strategic arcs all live here until
  promoted.

**4. Status Overview** — lives at the TOP of `rally-fix-plan-v1.md`, right
after the metadata header.
- At-a-glance table of all arcs + initiatives + their status + canonical
  home (with §-references into the doc or pointers to strategy docs).
- Designed so "what's the state of Rally?" is answerable in 5 seconds without
  scrolling 24K lines.

### When does work get a session number?

- **Full session number** (e.g., `Session 11`): a strategic arc that ships as
  one or many coordinated sub-sessions. Assigned at promotion time.
- **Sub-letter** (e.g., `10G'`, `10A`, `10B`): work that's a tight follow-up
  to a parent session. Same brief format, sub-numbered to associate.
- **`bug-N` suffix** (e.g., `10G bug-1`): a regression or follow-up bug
  discovered during QA of a specific session. Lives under the parent's
  heading.
- **Backlog brief** (no number): scoped but not yet in execution queue. Gets
  a number when promoted out of backlog.
- **Strategy doc** (no number): defines an arc that will spawn many numbered
  sessions over time.

Numbers get assigned at **promotion time**, not at scoping time. A backlog
brief moves out of the backlog and into a numbered session when execution
starts.

### Status Overview rule (always update)

After every session ship (Actuals written) AND whenever a new arc emerges,
update the Status Overview at the top of `rally-fix-plan-v1.md`:
- Bump shipped items to ✅ with the ship date.
- Add new arcs / initiatives discovered during the work.
- Re-classify items whose status materially changed (e.g., paused → resumed,
  or strategy-doc-blocked → unblocked).
- Bump the snapshot date.

This is what makes the doc scannable. Skipping it produces a doc that grows
in length without growing in clarity.

### What NOT to Build (v0)

If you start building any of these, the session has drifted:

Push notifications, payment/Venmo integration, custom questions, threaded replies,
@mentions, media uploads in buzz, map view, native expense logging, receipt capture,
Apple Wallet, multi-currency, sticker marketplace, custom sticker upload, parallax
scroll, social login (Google/Apple), co-host/admin roles.

### Reference Files

| File | What it tells you |
|------|-------------------|
| `rally-fix-plan-v1.md` | Session plans, constraints, what NOT to build, all session briefs + Actuals |
| `rally-qa-punch-list-v2.md` | All 45 known issues with severity |
| `rally-microcopy-lexicon-v0.md` | Every approved user-facing string |
| `rally-brand-brief-v0.md` | Voice rules, tone, banned words |
| `rally-theme-content-system.md` | Per-theme copy, emoji, countdown labels |
| `rally-qa-checklist-v0.md` | Full QA walkthrough procedure |
| `rally-attendee-strategy-v0.md` | Closed (2026-05-03). Locked decisions for the sketch → sell arc + attendee state model + journey + consumers. Reference for any sketch/sell phase work. |
| `rally-attendee-implementation-roadmap-v0.md` | Sub-session breakdown of the attendee arc (Session 10 series): scope, deps, size, asset needs. |
| `rally-lock-phase-strategy-v0.md` | Lock phase architecture (sell → lock → go). Drafted v0 2026-05-03. Reference for any Lock-A through Lock-H implementation work. |
| `rally-phase-*.html`, `rally-9*-mockup.html`, `rally-9w-organizer-sticky-mockup.html`, `rally-9y-dashboard-trip-menu-mockup.html` | Visual + interaction specs for shipped features and active design work |

---

## Part 2: The Session Loop (Cowork)

This is the workflow that Cowork follows. Each step has a specific format and
rules. Don't skip steps. Don't combine steps.

```
┌─────────────────────────────────────────────────────┐
│  1. BRIEF  (Cowork + Andrew)                        │
│     Write session scope + ACs into rally-fix-plan   │
│                      ↓                              │
│  2. EXECUTE  (Claude Code)                          │
│     Builds to the brief                             │
│                      ↓                              │
│  3. RELEASE NOTES  (Claude Code → Cowork)           │
│     What was done, what changed, what to test       │
│                      ↓                              │
│  4. QA  (Cowork + Andrew)                           │
│     Verify ACs, find bugs, fix-or-escalate          │
│                      ↓                              │
│  5. UPDATE PLAN  (Cowork + Andrew)                  │
│     Mark ACs pass/fail, write next session brief    │
│                      ↓                              │
│  → Back to step 2                                   │
└─────────────────────────────────────────────────────┘
```

### Step 1: Write the Brief

The brief lives inside `rally-fix-plan-v1.md` under the relevant session heading.
Don't create separate brief documents. A brief must contain:

**Scope** — numbered list of specific things to build or fix. Each item references
a file or component. Vague items like "polish the UI" are not scope.

**Hard Constraints** — what Claude Code must NOT do. Always include "DO NOT create
new routes" plus any session-specific boundaries.

**Acceptance Criteria** — testable statements, verifiable by clicking through the
app. Format: `- [ ] [What to verify] — [where to verify it]`

**Files to Read** — always include the session guard skill, the fix plan, relevant
design specs, and the lexicon if the session touches copy.

**How to QA Solo** — steps Claude Code can follow to verify its own work.

### Step 2: Execute (Claude Code)

Happens outside Cowork. When Cowork resumes, ask Andrew what Claude Code produced.

### Step 3: Intake Release Notes

When Andrew shares what Claude Code did, capture it as an "Actuals" section added
directly to `rally-fix-plan-v1.md` below the session's brief:

```markdown
#### Session N — Actuals

**What was built:**
1. [Item] — [file(s) changed]

**What changed from the brief:**
- [Deviations, additions, or items skipped]

**Known issues from Claude Code:**
- [Anything flagged but not fixed]
```

### Step 4: QA

Three parts: verify ACs, regression check, bug triage.

**4a. Verify Acceptance Criteria** — go through each AC from the brief. Navigate
to the relevant screen, verify behavior. Mark each: ✅ pass, ❌ fail, ⚠️ untestable
(with reason). Record in the Actuals section.

**4b. Regression Check** — run the between-session QA checklist:

```
□ Create trip from dashboard
□ Edit trip name, verify save
□ Share link works
□ Trip page scrolls all sections
□ No dead-end buttons
□ No clipped/overflowing elements at 375px
□ Spot-check 5 strings against lexicon
□ Dashboard reflects state changes
```

**4c. Bug Triage — Fix or Escalate**

**Fix in Cowork** (ALL THREE must be true):
1. Single file change
2. CSS property, copy string, or class name only
3. No logic, no imports, no props, no conditional behavior

Examples: margin/padding in globals.css, copy string in lib/copy/surfaces/*.ts,
CSS class name fix, comment typo.

**Escalate to Claude Code** (ANY ONE of these):
- Touches more than one file
- Adds or changes an import
- Modifies component props, types, or interfaces
- Changes conditional logic or data flow
- Requires understanding how two files interact
- You're not 100% sure it won't break something

Escalated bugs go in the fix plan:
```markdown
**Bugs for Session N+1:**
1. [Bug] — [file(s)] — [root cause if known]
```

Cowork fixes get logged:
```markdown
**Cowork fixes (CSS/copy only):**
1. [What was fixed] — [file:line]
```

### Step 5: Update the Plan

1. Mark the current session complete with a status line.
2. **Update the Status Overview at the top of `rally-fix-plan-v1.md`** —
   bump the shipped row to ✅, fold in any new arcs that emerged, refresh
   the snapshot date. (See "Status Overview rule" in Part 1.)
3. Review next session scope — does the existing brief still make sense?
   Should escalated bugs be folded in? Is the scope right-sized?
4. Write or revise the next brief following Step 1 format.

### Starting a New Cowork Session

1. Read `rally-fix-plan-v1.md` to understand where we are
2. Ask Andrew: "Where are we in the loop?"
   - "Claude Code just finished" → Step 3
   - "Let's QA" → Step 4
   - "Let's plan the next session" → Step 5
   - "Let's write a brief" → Step 1
3. Stay in the current step until complete before moving on

---

## Part 3: Claude Code Execution Rules

These apply when Claude Code is building to a brief.

### Pre-Flight Checklist

Before touching any source files:

1. **Read the session brief** from `rally-fix-plan-v1.md`. If there's no brief,
   stop and ask for one. Don't improvise scope.
2. **Read the referenced design files.** The brief lists specific HTML phase files.
   Don't skip this.
3. **Confirm constraints aloud.** State back the hard constraints before your first
   code change.
4. **Run the between-session QA check** (see Step 4b above). If anything fails,
   fix it before starting new work.

### Escalation Triggers

Stop coding and ask Andrew before proceeding when you encounter:

1. **Architecture changes** — new route, page, layout, or top-level component
2. **Ambiguous requirements** — design vs. lexicon conflict, or brief doesn't
   cover an interaction
3. **Scope creep** — fixing bug A reveals bugs B, C, D. Fix A (in scope). Log
   B, C, D. Don't fix them unless they're in the brief.
4. **Copy decisions** — any string not in `lib/copy.ts` or the lexicon
5. **Data model changes** — new columns, type changes, schema modifications, RLS
6. **"Works but looks wrong" tradeoffs** — quick implementation doesn't match
   design and closing the gap requires significant effort
7. **Deleting or replacing existing code** — confirm before removing components,
   routes, or utilities
8. **Failing acceptance criteria** — if ACs can't be met with current approach,
   that's a conversation, not a unilateral decision

### How to Escalate

1. State what you're doing
2. State what you encountered
3. State the options (a, b, c)
4. State your recommendation — but don't act on it

Then wait. Don't fill the silence with code.

### Release Notes Format

When Claude Code finishes a session, it produces release notes in this format
and adds them to `rally-fix-plan-v1.md` under the session heading:

```markdown
#### Session N — Release Notes

**What was built:**
1. [Item] — [file(s) changed]

**What changed from the brief:**
- [Deviations, additions, or items skipped]

**What to test:**
- [ ] [Testable item 1]
- [ ] [Testable item 2]

**Known issues:**
- [Anything flagged but not fixed]
```
