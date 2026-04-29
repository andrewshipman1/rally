# Rally Attendee Experience Strategy v0

**Status:** Living document. Drafted Session 10 (2026-04-27).
**Owner:** Andrew + Cowork.
**Update cadence:** As we work each dimension, decisions get
appended to the "Decisions Locked" section at the bottom.
**Implementations reference this doc** rather than re-deriving.

---

## Purpose

Define the strategic shape of the attendee experience — anchored
in the attendee's perspective, aligned with the existing
organizer-side build — so that subsequent implementation sessions
ship against a coherent model instead of patching consumers
in isolation.

**This is not a session brief.** No code ships from this doc.
This doc DEFINES what subsequent code sessions implement.

## How to read this doc

**Lens.** Primary perspective is the attendee — what they see,
what they do, what state they're in at any given moment.
Secondary perspective is the organizer — what they see ABOUT
the attendee — but only insofar as the two perspectives need to
align. We are NOT re-thinking the organizer side; that's been
the lens for the entire build to date.

**Three dimensions, in order of dependency:**

1. **State model** — the discrete states an invitee can be in,
   what each one signals, and how transitions happen.
2. **Journey** — the actual flow that produces those states
   (email send, click, signup, RSVP, etc.). Includes failure
   modes.
3. **Consumers** — the dashboard modules, cost calculations,
   marquee copy, and UI signals that read the state model.
   Once the model is clean, these alignments become mechanical.

**Why the dependency order matters.** Dimension 2 produces
states defined in Dimension 1. Dimension 3 consumes states
defined in Dimension 1 and changed by Dimension 2. Defining
states first means every downstream design has a stable
foundation.

---

## Dimension 1: State Model

### Current state (as of Session 9Y close, 2026-04-27)

The `trip_members.rsvp` column holds 4 values:

| State      | Meaning today (in code)                           |
|------------|---------------------------------------------------|
| `pending`  | Default. Set on row creation. **Overloaded.**     |
| `in`       | Explicit yes (RSVP'd via `/api/rsvp`)             |
| `holding`  | Explicit maybe (RSVP'd via `/api/rsvp`)           |
| `out`      | Explicit no (RSVP'd via `/api/rsvp`)              |

**Producers (where states originate):**

- `POST /api/invite` (line 119) — creates `trip_members` row
  with `rsvp: 'pending'`. This happens at three different
  moments:
  - Organizer types a name into the sketch invite roster
  - Organizer adds an invitee post-publish
  - Organizer pre-publishes a roster (queued invites)
- `POST /api/rsvp` — overwrites `rsvp` to `'in' | 'holding' |
  'out'` based on the invitee's RSVP action via the sticky bar.

**Consumers (where states get read):**

| Surface | Logic | File |
|---------|-------|------|
| Cost-split divisor | Counts `'in' + 'holding'`; falls back to `group_size` if <2 | `types/index.ts:485` |
| Crew tally pills | Counts each state separately (in / holding / out / pending) | `lib/dashboard.ts:90-91`, trip page |
| Trip page `goingMembers` | Filters `'in'` | `app/trip/[slug]/page.tsx:158` |
| Passport "trips you went on" | Filters `'in'` (post-trip) | `lib/passport.ts:96+` |
| `needsMove` indicator (organizer) | `'sell' && holdingCount > 0 && isOrganizer && !isArchived` | `lib/dashboard.ts:116` |
| 9O "firming up" eyebrow | Pending-state heuristic across multiple signals | `cost-summary` rendering |

### The `pending` overload problem

`pending` carries five distinct attendee-side meanings, but
the code can't tell them apart:

| Real-world situation | Current state | What we *should* know |
|---------------------|---------------|----------------------|
| Organizer just added them; no email out yet (sketch) | `pending` | Pre-flight; not in scope for cost yet |
| Email queued but not sent (sell-phase post-publish hasn't fired) | `pending` | Delivery hasn't happened |
| Email sent + delivered, invitee hasn't opened | `pending` | Reachable, not yet engaged |
| Email opened + clicked, signup incomplete | `pending` | Engaged but blocked |
| Signed up, has account, never RSVP'd | `pending` | Engaged, deliberately or distractedly silent |
| Phone-only invitee (no email rail) | `pending` | Unreachable on current channels |

**Consequences of the overload:**

- **Cost-split divisor:** Treats all five as equivalent
  (current code excludes them entirely from divisor →
  divisor=1 on most trips → raw lodging totals show
  per-person, per the screenshot bug Andrew flagged).
- **"Firming up" eyebrow:** Can't differentiate "still
  going out" from "they got it and bailed." Both render
  the same eyebrow.
- **Organizer's mental model:** The roster shows "X pending"
  with no context. Organizer can't tell if they should
  resend, nudge, or accept that the trip is firming up.
- **Phone-only invitees:** Indistinguishable from delayed
  email responders. No path to reconcile.
- **needsMove pulses:** Currently doesn't fire on pending
  (only holders), but the "right" pulse depends on which
  pending sub-state — "open + signed up + silent" might
  warrant a nudge; "email never sent" doesn't.

### Locked state model (v0, 2026-04-27)

**Four states. One enum value rename. That's the whole change.**

| State | Definition (attendee POV) | Set by |
|-------|--------------------------|--------|
| `awaiting` | Hasn't responded yet. **Renamed from `pending`** to better signal "no response received" rather than "system default." | Default on `trip_members` row creation |
| `in` | Explicit yes | `POST /api/rsvp` |
| `holding` | Explicit maybe | `POST /api/rsvp` |
| `out` | Explicit no | `POST /api/rsvp` |

**Why this is enough:**

- The distinction between "haven't sent yet" and "sent, no
  response" is already encoded in `trip.phase`. Sketch-phase
  invitees are implicitly pre-send; sell+ invitees have been
  (or should have been) emailed. We do NOT need a separate
  state value for this.
- `dispatched` (sent, no delivery confirmation yet) is a
  transient internal state — lives for seconds, organizer
  can't act on it differently from "delivered." Belongs in
  the email-send pipeline (Resend), NOT in the attendee
  state model.
- Bounces / unreachable / phone-only are real situations,
  but explicitly **deferred to v1**. Current state model
  ships clean; if real-world bounce data tells us we need
  reachability signaling later, we add it as metadata
  (timestamp + flag) without changing the state enum.

**What we're explicitly punting on for v0:**

- **Reachability tracking** (bounces, phone-only, send
  failures). v0 assumes "email goes through." If a v0 user
  hits a bounce, the organizer just sees "X awaiting" with
  no further signal. Acceptable for early-stage v0; revisit
  when bounce data argues otherwise.
- **Engagement sub-states** within `awaiting` (delivered
  vs. clicked vs. signed-up-but-not-RSVP'd). All collapse
  into `awaiting`. Could split later if conversion data
  warrants nudge differentiation; not v0 scope.

### Migration

**Locked: option (c)** — keep the `rsvp` column, rename the
enum value `pending` → `awaiting`. No new columns. No
schema split.

```sql
-- Migration 025 (illustrative; final form set in implementation
-- session)
alter type rsvp_state rename value 'pending' to 'awaiting';
```

Existing rows with `rsvp = 'pending'` automatically map to
`awaiting`. Code consumers (cost split, dashboard tally,
trip page render) need a rename pass — every `=== 'pending'`
becomes `=== 'awaiting'`.

### Closed open questions for Dimension 1

1. ~~**Do we collapse `awaiting`?**~~ Yes, collapsed.
   Sub-states deferred to v1.
2. ~~**Phone-only as `unreachable` for v0?**~~ Punt — no
   reachability state in v0. Phone-only is implicitly an
   organizer/data issue, not a state.
3. ~~**Organizer affordance for `unreachable`?**~~ N/A in
   v0.
4. **Does `out` have a sub-distinction?** Still open. Likely
   "no" — flag for lock-phase planning if it becomes
   relevant.
5. **Group_size fallback** — still open. Belongs in
   Dimension 3 (consumers); the cost-split divisor logic
   resolves it.
6. **Implicit organizer state.** The organizer row's `rsvp`
   value at trip-create time is `'in'` per
   `TripForm.tsx:76`. No change needed.

---

## Dimension 2: The Journey (drafted 2026-04-27)

The end-to-end flow from organizer-publish to attendee-RSVP.
Locked happy path; failure-mode recovery deferred to v1.

### The 7-step happy path (Andrew's locked framing)

```
ORGANIZER SIDE                    →    ATTENDEE SIDE
─────────────────                       ──────────────
1. Create trip (sketch)
2. Add attendees + sketch link to crew
3. Tap PUBLISH ──────────────────→  4. Email lands in inbox
                                    5. Tap link in email
                                    6. Land on TEASER page
                                       (blurred preview, signup CTA)
                                    7. Sign up → unblur reveal
                                       → see full sell page
                                       → tap RSVP
                                       → state: awaiting → in/holding/out
```

### Step-by-step mechanics

**Step 1–2: Sketch composition.** Already shipped. Organizer
adds invitees via `SketchInviteList` → `POST /api/invite`
creates `trip_members` row with `rsvp = 'awaiting'` (post-
rename). No email fires; row is queued.

**Step 3: Publish triggers fan-out.** Currently broken.
`transitionToSell` at `src/app/actions/transition-to-sell.ts`
flips `phase` from `sketch` → `sell` but does NOT trigger
email send. Implementation gap: after the phase flip,
enumerate `trip_members` for this trip, build a personalized
invite payload per row, hand off to Resend. This is the
primary missing piece in the journey.

**Step 4: Email content.** A single email per invitee.
v0 = one email, no drip / reminders / nudges. Email contains:

- Subject line — themed per trip (e.g., "you're invited
  to coachella '26")
- Trip name + organizer name + brief context
- A single primary CTA — link to the teaser page
- Rally branding (visual + voice consistent with the app)

Concrete copy + design decisions get made in the
implementation session, not here. Strategy locks **single
email, themed, branded, one primary CTA**.

**Step 5: Link click → token resolution.** Each invitee's
email link contains an invite token. v0 token shape is the
simplest thing that works: a server-generated UUID stored
on the `trip_members` row, passed in URL like
`/i/<token>` or `/trip/<slug>?invite=<token>`. Resolution:

- Server reads token → finds `trip_members` row → gets
  `trip_id` + `user_id` (or null if invitee hasn't signed
  up yet)
- If invitee is signed in AND their `auth.users.id` matches
  `trip_members.user_id`: skip teaser, go straight to full
  trip page
- Otherwise: render teaser

Token format + URL shape is an implementation choice;
strategy locks "every invite link contains an invitee-
identifying token."

**Step 6: Teaser page (Path B, locked).** Renders
`InviteeShell` component (already exists per the prior
roadmap, partial implementation). Visual treatment per
existing wireframe:

- Trip page rendered with a blur veil over the modules
- A "lock" or "called-up" sticker as visual anchor
- A passwordless signup CTA as the primary call to action
- Some unobscured chrome (trip name, organizer, tagline?)
  to give context — the FOMO hook

Signup mechanics: passwordless via email link
(Supabase magic links — already in use elsewhere in the
app). No password creation. After signup completes,
`ProfileSetup.tsx` runs and the orphan-merge from Session
9S reconciles the invitee's `users` row with their
`trip_members` row by email match.

**Step 7: Unblur → RSVP.** After signup completes,
the page transitions from teaser to full sell view (unblur
animation per existing wireframe). The sticky bar at the
bottom shows the three RSVP chips (in / holding / out) per
the current `StickyRsvpBarChassis` non-organizer branch.
Tap → `POST /api/rsvp` → state transitions
`awaiting` → `in`/`holding`/`out`. Confetti on the "in"
state is already wired.

### State transitions across the journey

| Step | Trip phase | Invitee `rsvp` | What changed |
|------|------------|----------------|--------------|
| 1–2 | `sketch` | `awaiting` | Row created |
| 3 (pre-flip) | `sketch` → `sell` | `awaiting` | Phase flips |
| 3 (fan-out) | `sell` | `awaiting` | Email dispatched |
| 4–6 | `sell` | `awaiting` | (no state change; still awaiting RSVP) |
| 7 (RSVP) | `sell` | `in` / `holding` / `out` | Explicit response |

Note: invitee can be on the trip page in steps 5–7 without
a state change. The state changes only at step 7 (RSVP
action) or implicitly when the org-side adds/removes them.

### Tech surfaces involved

| Surface | Status | Implementation work |
|---------|--------|---------------------|
| Resend (email send) | Already in deps | Wire to publish flow + design email template |
| `transitionToSell` action | Shipped (just flips phase) | Add fan-out step |
| Invite token | Doesn't exist | New: column on `trip_members` + token generator + resolver route |
| Magic link auth (Supabase) | Already used elsewhere | Reuse for invitee signup |
| `InviteeShell` component | Partially built | Complete teaser per wireframe |
| `ProfileSetup` + orphan-merge | Shipped 9S | Confirm it works end-to-end with the new invite flow |
| `StickyRsvpBarChassis` (attendee) | Shipped | No change |

### Failure modes (deferred to v1)

Documented for awareness; not addressed in v0:

- **Bounces.** Resend will report; no UI surfaces it; organizer
  has no signal beyond persistent `awaiting`. Acceptable for
  v0; revisit when conversion data exists.
- **Phone-only invitees.** No SMS rail. Currently the
  organizer can add them, but there's no delivery path. v0
  options: (a) prevent phone-only adds in the UI until SMS
  ships, or (b) allow them, surface a "no rail" warning to
  the organizer. **Decision: punt.** Implementation session
  picks one when it becomes blocking.
- **Email forwarding.** If invitee A forwards their link to
  invitee B, B clicks → token resolves to A's row → B can
  sign up as A. This is a security gap. v0 acceptable
  because group is small and trusted; v1 needs token-binding
  to a single auth identity.
- **Re-publish after edit.** 9W edit-on-sell mode lets
  organizer modify post-publish. Does re-publishing fan
  out emails again? Strategy says: NO automatic re-fire.
  Implementation must diff the roster and only fire to
  newly-added invitees.

### Closed questions for Dimension 2 (all locked 2026-04-27)

1. ~~**Token format + URL shape.**~~ Locked: `/i/<token>`.
   Dedicated short route, single-purpose handler. Cleaner
   than overloading `/trip/<slug>?invite=<token>`.
2. ~~**Token storage.**~~ Locked: add `invite_token uuid`
   column to `trip_members`. One token per row, generated
   at row-create time.
3. ~~**Email template authoring.**~~ Locked: hand-written
   HTML for v0; defer templating library evaluation
   (react-email / MJML) to implementation session if copy
   density justifies it.
4. ~~**Magic link expiry.**~~ Locked: keep Supabase default
   (15 min). Initial framing conflated two link types — the
   long-lived link is the **invite token** stored in
   `trip_members.invite_token`; the magic link is only the
   second hop (fires when invitee enters their email on the
   teaser, expected to be clicked immediately). The invite
   token doesn't expire.

### Still-open question (out of strategy scope)

- **Email subject + preview text.** Brand/lexicon work, not
  strategy. Needs a deliberate copy pass against
  `rally-brand-brief-v0.md` voice rules and the lexicon.
  Either scope as a tiny copy session before the email-send
  implementation, or fold into that session's brief.

### Email infrastructure: ALREADY WIRED (verified 2026-04-27)

Both providers are configured + working today:

| Email type | Provider | Status |
|-----------|----------|--------|
| Trip invite | **Resend** | `sendInviteEmail()` in `src/lib/email.ts` is fully implemented (HTML + plain text + escape helpers). Already fires when an invitee is added to a sell-phase trip via `/api/invite:135`. `RESEND_API_KEY` is set in local env. |
| Magic link / auth | **Supabase Auth** | `signInWithOtp` via `src/lib/auth/supabase-provider.ts`. Auth landing pages exist (`/auth`, `/auth/expired`, `/auth/invalid`). Rate-limited (30s cooldown). |

**The single missing piece** is the **publish-time fan-out**.
Adding a one-off invitee to a sell-phase trip already
triggers the email. What doesn't fire is bulk send when
`transitionToSell` flips a sketch trip to sell — the
sketch-queued invitees never get emailed.

Implementation work boils down to:
1. Wire `transitionToSell` to enumerate `trip_members` after
   the phase flip and call `sendInviteEmail` for each.
2. Add `invite_token uuid` column to `trip_members` + a
   token-resolving route handler at `/i/[token]` + the
   teaser shell + the unblur transition.

### Pre-implementation infrastructure work

These items are NOT strategy decisions — they're
configuration / setup work that gates the email-fan-out
implementation session. Each will be folded into the
appropriate implementation session brief, OR scoped as its
own infra session if the load is heavy enough.

**Confirmed state as of 2026-04-27:**

- Resend API keys exist and work (`rally-production` is
  the active key; last invite email fired 22 days ago
  via `/api/invite:135`).
- `RESEND_API_KEY` is set in local env.
- `NEXT_PUBLIC_APP_URL` is set in local env.
- Supabase magic-link auth is wired and used for sign-in
  today.

**Outstanding items:**

- **Production domain cutover.** Andrew has purchased a
  custom domain for the app (2026-04-27). Triggers two
  cascading setups:
  - **Vercel:** add custom domain, DNS configuration,
    update `NEXT_PUBLIC_APP_URL` env var to the new
    domain. Magic-link redirect URLs in Supabase Auth
    config need the new domain allowlisted.
  - **Resend:** add a sender (sub)domain, configure DNS
    (SPF / DKIM / DMARC), verify, set
    `RESEND_FROM_EMAIL` in Vercel.
  - DNS propagation gates both. ~30-45 min total work,
    mostly waiting.
  - Without this: production sends from
    `Rally <onboarding@resend.dev>` (Resend's sandbox)
    which has deliverability + recipient restrictions
    that will break the invitee flow at scale.
- **Supabase Auth URL Configuration audit.** Check
  Site URL + Redirect URLs allowlist in Supabase
  dashboard. Add the new production domain (and
  `localhost:3000` for dev) once the cutover happens.
  Without this: magic-link click in prod fails to
  redirect properly.
- **Vercel env audit.** Cross-check that the right
  Resend API key is in Vercel env (the dashboard shows
  three keys; only `rally-production` is in active use,
  the others may be orphaned).

**Suggested handling:** scope these into the email-fan-out
implementation session's brief as pre-flight steps, OR
spin out a tiny dedicated "production domain cutover"
session if the work feels like it deserves its own
attention. Decide when scoping that session.

---

## Dimension 3: Consumers (drafted 2026-04-27)

How existing UI surfaces and calculations consume the locked
state model. One genuinely strategic decision (the cost-split
divisor philosophy); the rest is mechanical renames.

### The strategic decision: cost-split divisor

**Locked: optimistic philosophy.** Divisor counts
`in + holding + awaiting`. Excludes `out` only.

Implementation:

```typescript
// types/index.ts:485 (proposed)
const effectiveCrew = trip.members.filter(
  m => m.rsvp !== 'out'
).length;
const divisor_used = Math.max(1, effectiveCrew);
```

**The `group_size` fallback can be REMOVED.** Pre-9Y it
existed because the conservative filter (`in + holding`)
returned 0 or 1 on a fresh trip with mostly-`pending`
invitees. With the optimistic filter, that hole is closed:
a fresh sell-phase trip with 7 awaiting invitees + 1 organizer
gets `divisor_used = 8` automatically. No fallback needed.

**Considered + rejected alternatives:**

| Philosophy | Why rejected |
|-----------|--------------|
| **Conservative** (`in + holding`, current behavior) | Returns divisor=1 on fresh trips → raw lodging totals → the bug that started this conversation. |
| **Phase-aware** (different rule per phase) | Adds branch logic; risks organizer confusion when same trip shows different numbers across phases. Smartness the organizer didn't ask for. |
| **`group_size` always** | Disconnects cost from RSVP reality; doesn't auto-correct as members drop off. |

**Tradeoff accepted:** the optimistic model has volatility
when a fresh trip's `awaiting` members RSVP `out` — divisor
shrinks, per-person cost rises. This is preferable to the
conservative model's volatility (divisor=1 → divisor=N as
people RSVP `in`) and to phase-aware complexity.

**At lock phase, the math naturally tightens.** By the time
a trip moves sketch → sell → lock, `awaiting` should be
near-zero (members had their chance to respond). So the
optimistic divisor at lock ≈ the conservative divisor.
Optimistic doesn't need special-casing for lock phase, but
see the v1 note below.

### The mechanical part: all other consumers

All of these change ONLY because of the `pending` →
`awaiting` rename. Logic is unchanged.

| Consumer | File / location | Current | After rename |
|----------|----------------|---------|--------------|
| "Firming up" eyebrow | `lib/copy/surfaces/trip-page-shared.ts` | Any pending = `firming up`; else `looking solid` | Any awaiting = `firming up`; else `looking solid` |
| Crew tally pills (trip page + dashboard) | `lib/dashboard.ts:88-89` + `app/trip/[slug]/page.tsx:157-158` + `CrewSection` | 4 buckets (in/holding/out/pending) | 4 buckets (in/holding/out/awaiting) |
| Marquee copy | `lib/copy/surfaces/builder-state.ts` + theme content | References "pending" | References "awaiting" (lexicon rename + cross-ref to lexicon md) |
| `needsMove` indicator | `lib/dashboard.ts:116` | `holdingCount > 0` (sell + organizer + !archived) | No change. Don't add `awaiting` trigger — it'd always fire in early sell, just noise. |
| Trip page `goingMembers` filter | `app/trip/[slug]/page.tsx:158` | Filters `'in'` | No change. Already correct. |
| Passport "trips you went on" | `lib/passport.ts:96+` | Filters `'in'` | No change. Already correct. |
| Sticky bar (attendee) | `StickyRsvpBarChassis` (non-organizer branch) | Always 3 RSVP buttons | Post-RSVP, reflect chosen state (cosmetic UI work, design TBD in implementation) |

### Lock-phase note (v0 → v1 transition signal)

The optimistic divisor is correct for sketch/sell. At lock
phase, the trip is committed — anyone still `awaiting` is
effectively dropped. The cost should reflect REAL
committed crew at that point, not optimistic projections.

**v0 behavior:** divisor stays `effectiveCrew` (in + holding +
awaiting) at all phases. Acceptable because at lock phase,
`awaiting` should naturally be zero or near-zero.

**v1 consideration:** when sell → lock transitions, snap any
remaining `awaiting` members to `out` (or a new `dropped`
state if we add one) so the divisor truly reflects committed
crew. This is a lock-phase-work concern; flag it for
whenever lock-phase scoping happens.

### Open questions for Dimension 3

1. **What happens to `awaiting` on lock?** v0 punts (let
   them stay awaiting; they just don't reduce the divisor
   noticeably because by lock most have responded). v1
   may want to auto-snap to `out`.
2. **Stale-awaiting nudge.** Should `needsMove` (or
   another indicator) trigger when an invitee has been
   `awaiting` > N days? Requires tracking dispatch
   timestamps. Deferred to v1.
3. **Sticky bar post-RSVP UI.** What does the invitee see
   on the sticky bar after they've RSVP'd? Today: still
   shows the 3 buttons (their selection persists, but UI
   doesn't reflect "you've responded"). Deferred to the
   implementation session that touches the sticky bar
   (per old roadmap = "sticky bar depth").

---

## Decisions Locked

*(Append-only log. Each decision references the dimension
it lives in and the date of the conversation that locked
it. When implementation sessions reference this doc, they
reference these decisions.)*

- **2026-04-27** [Scope] — Strategy doc rooted in attendee
  perspective; aligns with organizer side; does NOT
  rethink organizer mental model. (Andrew, Session 10
  scoping.)
- **2026-04-27** [Dimension 1] — State model is FOUR
  states: `awaiting` / `in` / `holding` / `out`. Just
  rename `pending` → `awaiting`. No reachability flag,
  no `dispatched`/`invited`/`unreachable` distinctions.
  Reachability + engagement sub-states are deferred to v1.
- **2026-04-27** [Dimension 1] — Migration is option (c):
  rename the enum value `pending` → `awaiting` in place.
  No new columns. No schema split. Code consumers do a
  rename pass.
- **2026-04-27** [Dimension 2] — Single email per invitee
  for v0. NO drip campaign, NO reminders, NO nudges.
  Reminder/sequence design is a v1 problem if conversion
  data warrants it.
- **2026-04-27** [Dimension 2] — Landing flow is **Path B
  (teaser)**: invitee taps link → blurred preview with
  signup CTA → signup → unblur reveal → full sell view →
  RSVP. Reuses the existing `InviteeShell` component.
  Path A (direct signup, no teaser) was considered and
  rejected — teaser builds the FOMO hook and contextualizes
  the invite, hypothesized to lift conversion.
- **2026-04-27** [Dimension 2] — Re-publish after
  edit-on-sell does NOT auto-fire emails to existing
  invitees. Implementation must diff the roster and fire
  only to newly-added entries.
- **2026-04-27** [Dimension 2 — explicit punts] —
  Reachability tracking (bounces), phone-only delivery
  rail, and email forwarding security all deferred to v1.
- **2026-04-27** [Dimension 2 — implementation details
  locked] — Token URL shape: `/i/<token>`. Token storage:
  new `invite_token uuid` column on `trip_members`. Email
  templating: hand-written HTML for v0. Magic link expiry:
  7 days (Supabase max).
- **2026-04-27** [Dimension 2 — infrastructure
  clarification] — Trip invite emails go via Resend
  (already in deps). Magic link / auth emails go via
  Supabase Auth (already wired). Two mechanisms, two
  providers, both present. Discovery item: verify Resend
  API key + sender domain are configured.
- **2026-04-27** [Dimension 3] — Cost-split divisor uses
  the **optimistic** philosophy: count
  `in + holding + awaiting`, exclude `out` only. The
  `group_size < 2` fallback is REMOVED — counting awaiting
  members closes that hole. Single rule, phase-agnostic.
- **2026-04-27** [Dimension 3] — All other consumers
  (firming-up eyebrow, crew tally pills, marquee copy,
  needsMove, trip page filters, passport filters) require
  ONLY the `pending` → `awaiting` rename. No logic changes.
- **2026-04-27** [Dimension 3 — explicit punt] — Lock-phase
  divisor refinement (snap awaiting → out at sell→lock
  transition) deferred to v1 / lock-phase work. v0 keeps
  the optimistic rule across all phases.

---

## Open Questions Across Dimensions

*(Cross-cutting questions surfaced during drafting.
Resolved questions move to "Decisions Locked.")*

- **Attendee identity model.** Should the data layer
  treat email and phone as orthogonal contact rails for
  the same `users` row, or are they separate identifiers
  with separate state? (Affects `unreachable` semantics +
  phone-only invitee path.)
- **Re-publish behavior.** Once email delivery ships,
  what happens if the organizer re-publishes a trip after
  edit-on-sell changes? Re-fire to existing `awaiting`?
  Skip? Diff the roster and only fire on additions?
  (9W edit-on-sell deferred this; Dimension 2 must
  resolve.)
- **Invite tokens.** Is the invite link a single magic
  link tied to the invitee's account, or a trip-scoped
  token that anyone with the link can use? (Affects
  forwarding behavior, security model.)
- **Cancellation / un-invite.** Can the organizer remove
  an invitee post-publish? What happens to that invitee's
  state? (Existing `DELETE /api/invite` removes the row;
  semantics around mid-`awaiting` removal are unclear.)
