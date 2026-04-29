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
