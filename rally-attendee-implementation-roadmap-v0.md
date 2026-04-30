# Rally Attendee Implementation Roadmap v0

**Status:** Living document. Drafted Session 10 (2026-04-27).
**Companion to:** `rally-attendee-strategy-v0.md`. Strategy
defines the model + journey + consumer alignment; this doc
breaks it into a phased session sequence.
**Naming:** All sub-sessions of Session 10. Numbering 10A → 10E
(Session 10 itself was the strategy work).

---

## Purpose

Translate the strategy doc into a sequence of CC-shaped
sessions. Each sub-session has rough scope, dependencies,
size estimate, what assets it needs (wireframes, copy
passes, etc.), and any open scoping questions to resolve
before its brief is written.

**This is NOT a session brief.** Briefs get written per
sub-session, after a refinement pass (wireframe / clarity
work) per Andrew's workflow. This doc is the high-level
sequence.

## Where Rally is right now (snapshot · 2026-04-27)

Anchor for CC before any 10C/10D/10E coding. The app already
exists; we're extending, not building.

**Architecture (locked since Session 1):**

- **Three routes only.** `/auth` (magic link), `/` (dashboard
  with trip cards), `/trip/[slug]` (single scrollable trip
  page; everything inline).
- **Phase system.** Trips move sketch → sell → lock → go →
  done. UI behaviors + countdowns vary by phase. Sketch and
  sell are where most v0 work has happened.
- **Trip page module order (sell+):** marquee → header → countdown
  → headliner → spot/lodging → getting here → transport →
  everything else → cost summary → crew → buzz → aux → footer
  → sticky bar. Cost summary always sits below the last
  cost-contributing module.

**Tech stack:**

- **Next.js 16.2.2** (breaking changes from training data; consult
  `node_modules/next/dist/docs/` per AGENTS.md when in doubt).
- **Supabase** for auth (magic link via `signInWithOtp`) + DB
  (Postgres with RLS).
- **Resend** for transactional email; `sendInviteEmail` lives
  at `src/lib/email.ts`.
- **Vercel** hosting; production at `https://rallyapp.travel`.
  `RESEND_FROM_EMAIL=Rally <hi@rallyapp.travel>`.

**Patterns that have hardened across sessions:**

- **Chassis CSS namespace.** All themed component CSS lives
  under `.chassis .*` selectors in `src/app/globals.css`. New
  classes follow this pattern. Theme tokens (`--ink`, `--bg`,
  `--accent`, `--accent2`, `--surface`, `--on-surface`,
  `--sticker-bg`, `--border`, `--muted`) drive per-theme
  variation. No raw hex/rgba inside `[data-theme]`.
- **Lexicon-driven copy.** All user-facing strings live in
  `src/lib/copy/surfaces/*.ts` and cross-reference into
  `rally-microcopy-lexicon-v0.md`. No hardcoded JSX literals
  for text content.
- **Hand-applied migrations.** `supabase/migrations/` is the
  history-of-record but migrations are applied manually via
  the Supabase SQL editor (no Docker locally per Andrew's
  flow). Pattern set by 019, 021, 022, 023, 024, 025.
- **Single-module discipline.** Each session touches ONE
  module / surface / concern. Cross-cutting changes get
  escalated, not absorbed.
- **Reuse before rebuild.** Every new component proposal gets
  weighed against extending an existing one with a
  prop/mode/extension. See reuse inventory below.

**Recent shipped work (the foundation 10C/10D/10E builds on):**

- **9T** — Turbopack dev-cache kill switch (BB-5 hotfix). Local
  QA unblocked.
- **9U** — Tier 2 visible bug sweep (BB-3 cost formatting,
  headliner href, passport stamps).
- **9V** — Tier 3 hygiene sweep (orphan buzz route deletion,
  members-as-any cast, dead CSS, deprecated lexicon keys).
- **9W** — Organizer edit-on-sell + sticky-bar redesign.
  `?edit=1` query param renders sketch UI on a sell trip;
  `BuilderStickyBar` got a `mode` prop. Pattern reference
  for 10D's mode prop on `StickyRsvpBarChassis`.
- **9X** — `transport.subtype` NOT NULL hotfix (migration
  024 hand-applied).
- **9Y** — Dashboard trip management (delete sketch / archive
  sell+). Kebab menu pattern + `archived_at` column +
  organizer-side filter logic.
- **10A** — RSVP state rename `pending` → `awaiting` +
  optimistic divisor (`m.rsvp !== 'out'`). Migration 025
  hand-applied. Foundation for the attendee arc.
- **10B** — Production domain cutover (`rallyapp.travel` live;
  Resend custom sender verified; Supabase URL config updated).

**Where we are in the broader build:**

- **Organizer experience: complete** for the sketch + sell
  phases. Organizer-finish arc closed at 9Y.
- **Attendee experience: starting now.** 10C wires
  publish-time email fan-out + invite tokens. 10D builds the
  teaser landing + auth integration + unblur reveal. 10E
  polishes post-RSVP UX.
- **Lock / go / done phases: future work.** Lock-phase
  commit math, go-phase live data (gas / restaurants / rideshare),
  done-phase passport entries — all separate arcs, not
  in scope for the 10X series.

**What this means for CC:**

When implementing 10C/10D/10E, you are NOT designing from
scratch. You're extending a substantial existing build that
has settled patterns. Mistakes look like: introducing a new
CSS namespace, forking a component instead of adding a prop,
hardcoding strings instead of routing through lexicon,
applying a migration via `supabase migration up`, redesigning
a flow that already works elsewhere. Re-read the rally-session-
guard skill if any of those feel tempting.

---

## How sub-sessions get written

Per Andrew's workflow (locked 2026-04-27):

```
roadmap (this doc)
   ↓
pick next sub-session (10A first)
   ↓
build wireframe + iterate in Cowork
   ↓
refine into a session brief in rally-fix-plan-v1.md
   ↓
hand off to Claude Code
   ↓
QA + Actuals
   ↓
next sub-session
```

Not every sub-session needs a wireframe (code-only changes
don't). The "assets" entry per sub-session below flags what
each one needs.

---

## Sub-session 10A: State rename + divisor fix

**Scope.** Foundation work that unblocks everything downstream.
Rename the `pending` enum value to `awaiting` across DB +
code + lexicon. Update the cost-split divisor to the
optimistic philosophy (`m.rsvp !== 'out'`). Drop the
`group_size < 2` fallback — it's no longer needed once
awaiting members count. Single conceptually-unified change;
ship as one session.

**Dependencies.** None. Critical-path starter.

**Rough size.** Small. One migration (enum value rename),
~5-8 file edits in code consumers (each is `=== 'pending'`
→ `=== 'awaiting'` with one logic change in
`calculateTripCost`), lexicon touch-ups. Hotfix-shaped,
similar to 9X.

**Assets needed.** None. Code-only.

**Playbook reference.** **9X (transport.subtype hotfix)** —
nearly identical shape: small enum-adjacent migration,
hand-applied via Supabase SQL editor, comment-update
accuracy in the consumer code, no UI surface. Mimic 9X's
brief structure, AC list, and Actuals format.

**Open scoping questions.**

- Migration mechanics: rename via `alter type rsvp_state
  rename value 'pending' to 'awaiting'` is the cleanest path
  but requires verifying nothing in the DB depends on the
  string literal `'pending'` (RLS policies, triggers, etc.).
- Is `'awaiting'` definitely the right name? (Alt:
  `'unanswered'`, `'no_response'`, etc. — picked `awaiting`
  in strategy doc; fine to revisit if a better word
  surfaces.)

---

## Sub-session 10B: Production domain cutover + Resend setup

**Scope.** Vercel custom domain configuration (Andrew owns
a domain as of 2026-04-27). Resend custom sender domain
verification. Supabase Auth URL Configuration audit (allow
new prod domain in redirect list). `RESEND_FROM_EMAIL` +
`NEXT_PUBLIC_APP_URL` env updates in Vercel. DNS records
(SPF / DKIM / DMARC for Resend; A / CNAME for Vercel).

**Dependencies.** None for execution; gates production
rollout of 10C+.

**Rough size.** Medium-but-mostly-waiting. ~30-45 min of
active work spread over hours/days while DNS propagates.
Mostly Andrew's dashboard work, not CC code work — could be
a checklist Andrew runs through, OR a tiny CC session that
updates env-dependent code references and verifies the
cutover.

**Assets needed.** None. No UI surface.

**Playbook reference.** No close prior-session playbook —
this is the first infrastructure-only chunk in the project.
Treat as Andrew-driven checklist with Cowork verification,
NOT a typical CC code session. Closest analog is just the
hand-applied-SQL convention from 9R/9X, but for env vars +
DNS instead of migrations.

**Open scoping questions.**

- Treat as a CC session, or as an Andrew-driven checklist
  with Cowork tracking the verification?
- Do we cut over to the new domain in one move, or stage
  it (DNS verify first, then env swap, then full traffic
  flip)?
- What's the actual domain Andrew bought? (Determines
  exact subdomain + DNS record values.)

---

## Sub-session 10C: Publish-time email fan-out + invite tokens

**Scope.** Wire `transitionToSell` (`src/app/actions/transition-to-sell.ts`)
to enumerate `trip_members` after the phase flip and call
`sendInviteEmail` for each — currently the email helper is
fully built but never bulk-fired on publish. Add
`invite_token uuid` column to `trip_members` (migration +
default `gen_random_uuid()`). Build the resolver route at
`src/app/i/[token]/route.ts` (or `page.tsx`) that maps
token → trip context. Update the `shareUrl` passed to
`sendInviteEmail` to use the new `/i/<token>` shape instead
of the existing slug-based share URL.

**Dependencies.**

- 10A (state rename) — should land first because the email
  fan-out logic will likely reference `awaiting` members.
- 10B (domain cutover) — gates production rollout but not
  development. CC can build + test locally against the
  Resend sandbox sender, then prod env swap once 10B
  completes.

**Rough size.** Medium. Migration + 2-3 file edits + new
route handler + careful re-testing of the existing
`/api/invite` single-invite-add path to make sure 10C
doesn't break it.

**Assets needed.** None — the email design already exists
in `sendInviteEmail`. Could benefit from a copy pass
against `rally-brand-brief-v0.md` voice rules
(subject / preview / body strings) — flag for future.

**Playbook reference.** **9S (orphan-merge)** for the
auth-adjacent migration + server-side flow integration
shape (security-definer function, careful auth check,
revalidatePath, end-to-end probe testing). **9X (subtype
hotfix)** for the migration apply pattern (committed file
+ hand-apply via Supabase SQL editor). Combine: structure
the brief like 9S; ship the migration like 9X.

**Direction (refined 2026-04-27 post-10A/10B).** With the
production sender domain shipped (10B), email-fan-out has
a real `hi@rallyapp.travel` sender to use. Migration for
`invite_token uuid` IS backwards-compatible (additive
column with `gen_random_uuid()` default — old code
ignores it, new code reads it), so migration-first
ordering is safe per 10A's lesson. The hard pieces of
this session are:

1. **The `transitionToSell` fan-out hook.** Currently
   the action just flips phase; needs to enumerate
   `trip_members` (where `rsvp = 'awaiting'`) and call
   `sendInviteEmail` for each. Already-existing
   single-invite path at `/api/invite:135` works for
   one-off invites; this is the bulk variant on publish.
2. **Re-publish guard.** 9W's edit-on-sell flow can
   trigger re-publish on save. Per strategy doc, do NOT
   re-fire emails to existing invitees. Implementation
   needs roster-diff or an `invited_at` timestamp so
   only newly-added members get the fan-out.
3. **Failure semantics.** If `sendInviteEmail` fails
   for one invitee mid-fan-out, what happens to the
   others? Suggested approach: wrap in `Promise.allSettled`,
   log failures, don't roll back the phase transition
   (the trip IS published; partial email failure
   shouldn't undo that). Surface failures to organizer
   later (out of v0 scope).
4. **Token resolver route at `/i/[token]`.** Reads
   `trip_members` row by token, redirects to
   `/trip/<slug>` with auth context (or to teaser if
   not signed in — handoff to 10D).

**Open scoping questions to resolve before brief.**

- Token storage: brief should specify whether the
  column has a UNIQUE index (yes, used as lookup key)
  and whether tokens are generated at publish time or
  at row creation. Lean: at row creation, since the
  invite-row-create path already exists.
- Re-publish-fan-out detection: `invited_at` timestamp
  approach OR `email_sent_at` timestamp OR pure roster
  diff against a snapshot. Lean: `invited_at` set when
  email is dispatched.
- Token-format: opaque UUID is fine; no signed payload
  needed since auth happens on the next hop (magic
  link). Confirm.
- Resolver route handler shape: server component? route
  handler returning a redirect? Either works; the
  decision affects how easily 10D plugs in the teaser
  rendering.

**Open scoping questions.**

- Token storage shape: column on `trip_members` (locked
  in strategy doc). Confirm before brief: does the column
  need a unique index? (Yes — used as lookup key.)
- Re-publish behavior: per strategy doc, do NOT auto-fire
  to existing invitees on re-publish. Implementation needs
  a roster diff to fire only on new additions. Where does
  that diff live — in the action, or as a precomputed flag
  on `trip_members.invited_at` timestamp?
- Failure handling: if `sendInviteEmail` fails for one
  invitee mid-fan-out, what's the recovery? Retry queue?
  Error log? Defer for v0?

---

## Sub-session 10D: Teaser landing flow + InviteeShell completion

**Scope.** The visual + interaction layer the invitee
encounters when they click their invite email. `/i/<token>`
resolves → renders the existing `InviteeShell` component
(partially built, needs completion per the original
roadmap's Session 10 vision: blur veil, lock overlay,
called-up sticker, passwordless signup CTA, unblur reveal
into the full sell view). Auth flow: invitee enters email
on the teaser → Supabase magic link sends → click magic
link → return to Rally signed in → unblur transition →
land on the sell trip page → can now RSVP via the existing
sticky bar.

**Dependencies.**

- 10C — invite tokens + resolver route must exist before
  the teaser can land on a real trip context.

**Rough size.** Largest of the sub-sessions. The teaser
shell, blur veil, unblur reveal animation, signup CTA
copy, magic link round-trip, ProfileSetup integration
(orphan-merge already shipped in 9S — verify it works
end-to-end with the new flow), state transitions. Could
plausibly split into 10D-1 (teaser visual + auth flow) and
10D-2 (unblur reveal + post-signup polish) if it grows.

**Assets needed.** **Wireframe required.** The original
roadmap's "blur veil + lock overlay + called-up sticker"
direction is loose — exact visual treatment, copy, and
unblur animation timing should be locked in a Cowork
mockup pass before the brief. Per Andrew's workflow:
build wireframe first, refine, then brief.

**Playbook reference.** **9W (organizer edit-on-sell +
sticky-bar redesign)** — for the wireframe-first refine
process, the new-component-with-mode-prop pattern, and
the visual mode-shift treatment (light → dark accent on
state change). The teaser-vs-full-render switch in 10D is
structurally similar to 9W's sketch-vs-sell view toggle.
**9M (crew bordered shell)** as a secondary reference for
the visual chassis primitives if the teaser shell uses
the `.module-section` primitive.

**Direction (refined 2026-04-27 post-10A/10B).** The
heaviest sub-session of the arc by far. Two distinct
pieces that may need to split into 10D-1 + 10D-2:

1. **Teaser visual layer.** What the invitee sees at
   `/i/<token>` BEFORE signing in. Existing
   `InviteeShell.tsx` is partially built; the design
   direction (blur veil, lock overlay, called-up
   sticker, signup CTA) is loose and needs locking via a
   wireframe pass per Andrew's workflow. Cutline
   decision (what's visible unblurred vs. blurred) is
   the main FOMO-hook lever.
2. **Auth round-trip + unblur reveal.** The journey
   step where invitee enters email → Supabase magic
   link sends → invitee clicks magic link → returns to
   Rally signed in → unblur animation reveals full
   trip → can RSVP. Magic-link auth is now validated
   (10B smoke test) on the production domain.
   ProfileSetup + 9S orphan-merge handles the account
   creation reconciliation. The new code is the unblur
   transition + post-signup landing logic.

**Workflow per Andrew's pattern (locked):**

```
Cowork wireframe pass (lock the teaser visual)
   ↓
Cowork iteration on copy + cutline
   ↓
Refine into a session brief
   ↓
Hand off to CC
```

Don't try to scope the brief without the wireframe step.

**Open scoping questions to resolve before wireframe.**

- Teaser content cutline: name + hero unblurred,
  modules + costs + RSVP blurred? Or blur the entire
  scroll area below the hero? Or use a "called-up
  sticker" overlay across the whole thing? FOMO design
  call.
- Unblur transition style: instant flip, fade, animated
  unblur sweep, scroll-triggered? Affects implementation
  cost and the moment of delight.
- Signup CTA copy: "claim your spot" / "sign up to
  RSVP" / "see the rest" / brand-voice variant? Brand
  brief work.
- Post-signup destination: same trip page with full
  sell render (auto-scroll to sticky bar)? Or land on
  a celebration screen that transitions to the trip?
- Magic link redirect URL: `/trip/<slug>` (where the
  invitee actually wants to be) or back to
  `/i/<token>` (where the resolver re-runs and routes
  them properly)? Cleaner UX = first option, but
  requires the magic-link redirect URL to be set
  per-invitee at send time.
- Should the teaser support a "preview without
  signing up" path for the organizer (so they can see
  what invitees see)? Probably not v0; flag for later.
- Split decision: keep as one session or split into
  10D-1 (visual) + 10D-2 (auth flow)? Lean: one
  session if the visual cutline is locked tight in
  the wireframe; split if iterations on the visual
  drag scope.

**Open scoping questions.**

- Teaser content: how much of the trip is visible
  unblurred (name? hero? tagline?), and how much is
  blurred (modules, costs, RSVP)? Cutline decision affects
  the FOMO hook strength.
- Unblur transition style: instant flip, fade, animated
  unblur sweep? Affects implementation cost.
- Post-signup destination: land on the trip page with
  full sell render and a "you've signed up — RSVP below"
  hint? Or auto-scroll to the sticky bar? Or modal?
- Magic link redirect URL: the URL the invitee returns to
  after the magic link click — is it `/trip/<slug>` or
  back to `/i/<token>`? Probably `/trip/<slug>` since at
  that point they're authenticated and the token is
  consumed.

---

## Sub-session 10E: Post-RSVP polish

**Scope.** The sticky bar attendee-side render shows three
RSVP buttons regardless of state today; post-RSVP it should
reflect their selection ("you're in" / "you're holding" /
"you're out") with options to change. Email subject +
preview text copy pass against `rally-brand-brief-v0.md`
voice rules (the existing `sendInviteEmail` strings are
serviceable but probably not lexicon-aligned). Any
micro-interactions / haptic / motion polish on the RSVP
moment beyond what 9W shipped.

**Dependencies.**

- 10C + 10D — needs the full attendee flow live to QA
  the post-RSVP UI.

**Rough size.** Small-to-medium. Mostly copy + cosmetic UI
work on a single component (`StickyRsvpBarChassis`
non-organizer branch).

**Assets needed.** **Wireframe optional** for the
post-RSVP sticky bar (a quick mockup of "in / holding /
out" reflected states would help, but the change is small
enough to ship without). **Copy pass** for email subject
+ preview is brand work that should happen in/before this
session.

**Playbook reference.** **9W (sticky-bar redesign)** —
literally the same component being touched
(`StickyRsvpBarChassis`); 10E modifies the non-organizer
branch the way 9W modified the organizer branch. Mirror
the discipline — `mode` prop pattern, lexicon discipline,
no native `confirm()` for destructive actions. **9V
(hygiene sweep)** as a secondary reference for any small
copy/cosmetic items that bundle in.

**Direction (refined 2026-04-27 post-10A/10B).** The
final polish layer of the attendee arc. Three distinct
pieces, all small:

1. **Sticky bar reflects RSVP'd state.** Today the
   sticky bar shows the same 3 RSVP buttons regardless
   of whether the invitee has already RSVP'd. Post-RSVP,
   should reflect the chosen state ("you're in" / "you're
   holding" / "you're out") with an option to change.
   Mirror 9W's pattern for the organizer branch:
   `mode` prop, lexicon-driven copy, conditional
   render. **10A's lexicon-templated function pattern**
   (`waiting on N`) is also available if any post-RSVP
   states want count interpolation.
2. **Email subject + preview text copy pass.** Brand
   work against `rally-brand-brief-v0.md` voice rules.
   Today's `sendInviteEmail` strings (e.g.,
   `${organizerName} invited you to ${tripName}`) are
   serviceable but probably not lexicon-aligned. Should
   happen as a small Cowork pass BEFORE this session's
   brief, not in the brief itself.
3. **Micro-interactions on RSVP.** Confetti on `in` is
   already wired. Could add subtle motion for `holding`
   transition or post-RSVP state changes. Optional
   polish; could defer to Session 14 (Motion pass) per
   the original roadmap.

**Open scoping questions to resolve before brief.**

- Post-RSVP UI shape: full pill-bar replacement
  ("you're in — change?" with a tap-to-edit
  affordance), or a smaller indicator + the original
  pills minimized? Wireframe optional but useful;
  could mock 2-3 variants in 10 min if needed.
- Re-RSVP confirmation: if invitee changes from `in`
  → `out`, do we confirm ("are you sure?"), or accept
  the tap immediately? Lean: confirm only on transitions
  TO `out` (the destructive direction); no confirm on
  upgrades.
- `out` state UI: hide the trip page entirely (mute
  it)? Show a quiet "hope you can make the next one"
  message? Or full sell view minus the sticky bar?
  Product call.
- Email copy: when to do the brand pass — as a
  prerequisite "10E-pre" Cowork session, or fold into
  10E's brief? Lean: prerequisite, since copy
  iteration is its own kind of work.

**Open scoping questions.**

- Does post-RSVP'd UI allow re-selecting a different state
  (change my "holding" to "in")? Or lock the RSVP after
  first tap? Almost certainly allow re-selection — but
  needs a confirmation pattern if changing TO `out` from
  `in`.
- Confetti is wired for the `in` state; should `holding`
  or post-RSVP changes also trigger something celebratory
  / acknowledging?
- What does the sticky bar show when the invitee is `out`?
  Hide entirely? Show a quiet "you said you can't make
  it — change your mind?" hook?

---

## Sequencing view

```
10A (rename + divisor)  ┐
                        ├─→ 10C (fan-out + tokens) ─→ 10D (teaser) ─→ 10E (polish)
10B (domain cutover)    ┘
```

10A and 10B can run in parallel — they have no shared
files. 10C requires 10A to land first (consumer rename
ripples). 10C requires 10B for production rollout but not
for local dev. 10D requires 10C. 10E requires 10D.

Total work envelope: 5 sub-sessions, 4 of which are CC
code work (10A, 10C, 10D, 10E) plus 10B which is mostly
Andrew + DNS.

---

## Future arcs (post-attendee)

These are strategic chunks that need their own strategy +
roadmap work in the same shape we did for the attendee arc.
Logged here so they're not forgotten; deliberately deferred
until the attendee arc (10A → 10E) ships.

**Organizer onboarding / cold-start experience** (logged
2026-04-27).

Today, the architecture is open — anyone who lands on
`rallyapp.travel` and enters an email can sign up and start
using Rally. But there's no marketing layer, no first-time
welcome, no guided "create your first trip" flow. Cold-start
organizers fall off a cliff between auth and the empty
dashboard. The current invitee → organizer path works
naturally (invitees experience Rally first, then create their
own trips), but Rally has no story for users who arrive
without an invite.

This deserves its own strategy doc + roadmap + wireframes,
mirroring the attendee arc. Three dimensions to work through:

1. **Cold-start mental model.** Who shows up without an
   invite? What's Rally's positioning / pitch? What do
   first-impression visitors expect?
2. **The first-trip journey.** Landing → signup → profile →
   onboarding → trip creation → publish. Each step has
   design decisions.
3. **Consumers.** Marketing landing page, dashboard empty
   state, "create your first trip" guided flow, post-publish
   "share with your crew" hint, etc.

Plus: does the marketing landing live as part of the existing
Next.js app or as a separate site? Probably the same app
(`rallyapp.travel` handles both signed-in and not-signed-in
landings) but that's its own product call.

Pickup timing: after 10E ships. Reuses (will benefit from)
the auth-state-listener pattern and ProfileSetup integration
that the attendee arc battle-tests first.

---

## Out of scope for the 10 arc (deferred to v1 / later)

Per the strategy doc's locked decisions:

- **Reachability tracking** — bounce handling, phone-only
  delivery rail, "couldn't reach them" organizer signals.
- **Drip campaigns** — reminder emails, last-call nudges.
  Single email only in v0.
- **Engagement sub-states** — opened email vs. clicked vs.
  signed-up-but-not-RSVP'd. All collapse into `awaiting`.
- **Stale-awaiting nudges** — `needsMove` doesn't pulse on
  awaiting in v0.
- **Lock-phase divisor refinement** — auto-snap awaiting
  to out at sell→lock transition. Lock-phase work, future
  sessions.
- **Email forwarding security** — invite token tied to
  trip not to identity in v0; if invitee A forwards their
  link, B can sign up as A.

---

## Where this doc gets used

- Each sub-session brief in `rally-fix-plan-v1.md`
  references THIS doc + `rally-attendee-strategy-v0.md`
  as required pre-flight reading.
- When a sub-session ships, mark it complete here (
  e.g., "✅ shipped 2026-XX-XX, see fix plan §10A
  Actuals").
- If scope shifts mid-arc (a sub-session grows or splits),
  update the roadmap entry to reflect new shape; the
  strategy doc only changes if a locked decision needs to
  be revisited.

---

## Context dependencies per sub-session

Every sub-session inherits a baseline of project context.
Each sub-session brief MUST list this baseline + its
sub-session-specific dependencies in its "Files to read"
section. This is to prevent drift — we've shipped a lot,
and CC needs the full picture every time.

### Baseline (every sub-session)

- `.claude/skills/rally-session-guard/SKILL.md` — full
  project rules, session loop, escalation triggers,
  hard rules (3-screen architecture, mobile-first,
  no hardcoded strings, single-module discipline,
  reuse-before-rebuild, etc.)
- `CLAUDE.md` + `AGENTS.md` — entry-point docs;
  AGENTS.md notes Next 16 has breaking changes from
  CC's training data and to consult
  `node_modules/next/dist/docs/` when in doubt
- `rally-fix-plan-v1.md` — single source of truth.
  Read the §Session 10X brief + relevant prior sessions
  (especially 9S, 9W, 9X, 9Y as called out below)
- `rally-attendee-strategy-v0.md` — locked attendee
  decisions, every sub-session implements against this
- `rally-attendee-implementation-roadmap-v0.md` (this
  doc) — for cross-sub-session context
- `rally-microcopy-lexicon-v0.md` — every user-facing
  string must come from / cross-ref this doc
- `rally-brand-brief-v0.md` — voice + tone rules

### Sub-session-specific dependencies

**10A (rename + divisor fix):**

- `src/types/index.ts` (the `calculateTripCost` function)
- All consumer files listed in strategy doc §Dimension 3
  ("The mechanical part") — file/line references for the
  rename ripple
- Migration precedent: 9X's `024_transport_subtype_nullable.sql`
  for the hand-applied-via-Supabase-SQL-editor pattern
- Lexicon md §5.X for any rename-affected keys

**10B (domain cutover):**

- Vercel project settings (Andrew's dashboard)
- Resend dashboard (custom domain setup)
- Supabase Auth → URL Configuration (Andrew's dashboard)
- Existing env vars: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
  `NEXT_PUBLIC_APP_URL`
- `src/lib/email.ts` line 3 (the `FROM` fallback)

**10C (fan-out + invite tokens):**

- `src/lib/email.ts` (existing `sendInviteEmail`
  implementation — reuse, don't rewrite)
- `src/app/api/invite/route.ts` (existing single-invite
  email-fire path — don't break it)
- `src/app/actions/transition-to-sell.ts` (the
  publish action that needs the fan-out hook)
- `src/lib/auth/supabase-provider.ts` (for the magic
  link auth mechanics it'll integrate with)
- 9S Actuals (orphan-merge — invitee account creation
  reconciliation already lives here)
- 9X migration precedent (hand-applied SQL pattern)

**10D (teaser landing flow):**

- `src/components/trip/InviteeShell.tsx` (existing
  partial implementation; complete don't replace)
- `src/app/auth/page.tsx` (existing auth landing for
  reference)
- `src/components/auth/AuthSurface.tsx` (signup flow)
- 9S Actuals (ProfileSetup + orphan-merge integration)
- The wireframe locked in this sub-session's Cowork
  refinement pass (TBD — built before brief)
- `rally-brand-brief-v0.md` for teaser copy voice

**10E (post-RSVP polish):**

- `src/components/trip/StickyRsvpBarChassis.tsx` (the
  attendee-side branch — non-organizer rendering)
- 9W Actuals (sticky-bar redesign precedent for the
  organizer side; mirror the discipline)
- `rally-brand-brief-v0.md` + lexicon md (email subject
  + preview copy pass)
- Existing Confetti component + RSVP wiring

### Reuse inventory for 10C / 10D / 10E (mandatory references)

**Locked direction 2026-04-27:** the attendee experience is
built on top of the EXISTING sell page chassis. No new
component families, no parallel design systems, no forking
the chassis CSS namespace. Drift here means rebuilding
something that already works.

**For 10D specifically (where the visual surface gets built),
CC must complete or extend these existing pieces — NOT
replace them:**

| Existing component / surface | Reuse role in 10D |
|---|---|
| `src/components/trip/InviteeShell.tsx` | Partial implementation today. **Complete this, don't replace it.** Add the blur veil + locked overlay + single-CTA sticky bar via additions, not a new component. |
| `src/components/trip/StickyRsvpBarChassis.tsx` (non-organizer branch) | Already renders for invitees in sell phase. Add a `mode` prop (matching 9W's organizer-side pattern) — `'teaser' \| 'rsvp' \| 'rsvp-d'` — that swaps the bar's content. Don't fork into a separate component. |
| `src/components/trip/PostcardHero.tsx` | The trip header in the teaser uses this exact hero, just inside the InviteeShell wrapper. PostcardHero already supports invitee-state overrides per Session 9W's null-tolerance work. |
| `src/components/trip/CountdownScoreboard.tsx` | The countdown in the teaser is the same countdown rendered on the sell page. Reuse. |
| Marquee strip | Same marquee rendered on sell. Reuse. |
| `src/components/auth/AuthSurface.tsx` | Magic-link request lives here. Teaser routes to it; doesn't rebuild auth UI. |
| `/auth`, `/auth/expired`, `/auth/invalid` pages | Phase 11 states already shipped. Reuse for the auth round-trip; don't redesign. |
| `/trip/[slug]/page.tsx` | The full sell view that renders post-unblur. Reuse as the destination; the in-place unblur transitions INTO this existing render path, doesn't fork it. |
| Chassis CSS (`globals.css` `.chassis .*` namespace) | Blur veil + locked overlay get new classes IN this namespace, using existing theme tokens (`--ink`, `--bg`, `--accent`, etc.). No new color tokens. |
| Phase 5's locked-section + locked-overlay CSS pattern | The blur + lock affordance design from `rally-phase-5-invitee.html` ports into the chassis namespace. Don't redesign the blur mechanic. |

**For 10C specifically** (backend wiring, less visual surface):

| Existing | Reuse role in 10C |
|---|---|
| `src/lib/email.ts` `sendInviteEmail` | Already complete (HTML + plain text + escape helpers). Don't modify; just call from the new fan-out site. |
| `src/app/actions/transition-to-sell.ts` | Existing action that flips phase. Add a fan-out call after the phase flip; don't replace the action. |
| `src/app/api/invite/route.ts:135` (existing single-add fan-out) | Already calls `sendInviteEmail` for individual sell-phase adds. The pattern is proven; mirror it for the bulk publish path. |
| Migration apply pattern (9X / 10A) | Migration 026 follows the same hand-applied-via-Supabase-SQL-editor convention. Don't apply via CC. |

**Anti-patterns to flag in the briefs as explicit constraints:**

- DO NOT create `InviteeShellV2.tsx` or any parallel teaser component. Complete the existing `InviteeShell` in place.
- DO NOT fork `StickyRsvpBarChassis` into `TeaserStickyBar.tsx`. Use the existing component with a `mode` prop.
- DO NOT introduce a new theme token system or color palette for the teaser. The blur layer + lock overlay use existing chassis tokens.
- DO NOT fork the trip page render path. The unblur reveal is a transition INTO the existing `/trip/[slug]` render, not a new route.
- DO NOT redesign the auth flow. The existing `/auth` + `AuthSurface.tsx` is the magic-link UI; teaser links there.
- DO NOT create new font stacks, brand variants, or design primitives for the email or teaser. Existing brand brief + lexicon + chassis are authoritative.

### Prior session learnings worth surfacing

These are decisions / patterns from shipped sessions that
sub-session briefs should NOT re-derive:

- **9S — orphan-merge.** When an invitee signs up via the
  email/phone we invited them by, their fresh `users` row
  reconciles into the pre-existing orphan row. ProfileSetup
  flow handles this. Migration 023 + `mergeOrphan` lib.
- **9W — edit-on-sell.** Organizer can edit a published
  trip via `?edit=1` view toggle. Phase stays `sell`.
  No re-fire of invite emails on save. 10C must NOT
  re-fire emails on edit-mode saves.
- **9X — hand-applied migrations.** No-Docker flow means
  migrations are applied via Supabase SQL editor manually.
  Migration files committed for history; Andrew runs the
  SQL. Pattern: 019, 021, 022, 023, 024.
- **9Y — dashboard kebab pattern.** Single-item-per-menu
  popover with `stopPropagation` on the kebab. If 10E
  adds any dashboard affordance, mirror this pattern.
- **8M / 9X — transport.subtype deprecation.** Legacy
  column kept nullable; new code doesn't write it.
  Same pattern applies if 10A / 10C touch other legacy
  columns.
