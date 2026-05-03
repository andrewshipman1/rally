# Rally Lock Phase Strategy v0

**Status:** in progress (Cowork, 2026-05-03 — drafting alongside Andrew)

**Predecessor:** `rally-attendee-strategy-v0.md` (Session 10) handled
the sketch → sell arc + the attendee state model. This doc picks
up at the **sell → lock → go** transition that Session 10
deliberately deferred.

---

## Purpose

Lock phase is the most undefined phase in Rally's lifecycle today
(the project rule names it but no UI / state mechanics exist).
This doc defines what Lock means as a product surface, what
triggers entry, what changes when entered, what the organizer
and attendee experiences look like, and how the phase exits to
Go.

**Core reframe (locked 2026-05-03):** Lock phase is NOT a
state-machine event. It is the **economic transition from soft
commitments to real money moving.** The organizer stops asking
"are you in?" and starts saying "I just paid the deposit, Venmo
me $X." Individual attendees stop browsing and start booking
their own travel.

---

## How to read this doc

Same conventions as `rally-attendee-strategy-v0.md`:

- **"Locked"** = decision made, treat as input to implementation
- **"Drafted"** = direction set, mechanics still in flight
- **"Open"** = needs Andrew's call before scoping

Implementation sub-sessions cascade FROM this doc the same way
Session 10A–10I cascaded from the attendee strategy doc.

---

## Data model additions (locked 2026-05-03)

- **`users.payment_handles`** (or 3 separate columns:
  `users.venmo`, `users.zelle`, `users.cashapp`) — stored at
  user level (passport-scoped), surfaced/edited in `/passport`,
  prompted just-in-time during lock confirmation if unset for
  an organizer. Not required for every user; only relevant
  when a user becomes an organizer who's fronting cash.
- **Per-shared-item: `actual_cost` finalized at lock time.**
  May reuse existing `total_cost` field with a new
  `cost_finalized_at` timestamp, or add a separate
  `actual_cost` column to keep the estimate-vs-actual delta
  visible. Implementation detail; either works.
- **Per-attendee per-shared-item: commitment record.** Tracks
  the "i'm in" tap with timestamp. Could be a `commitments`
  table keyed by (attendee_user_id, trip_id) for the aggregate
  commitment model — single row per attendee per trip recording
  the commitment moment.

## Decisions Locked (2026-05-03)

1. **Lock trigger = manual.** Organizer decides when Lock fires.
   The `commit_deadline` is a soft prompt, not a hard cutoff.
   Real-world deadline negotiation happens in WhatsApp/iMessage,
   not in Rally — the organizer should be able to extend
   informally for stragglers and only hit the Lock CTA when
   they've consolidated the final roster.

2. **Lock phase purpose = booking & money.** Two parallel
   workflows run simultaneously:
   - **Shared bookings** (organizer fronts cash): house, possibly
     transport for the group, potentially shared activities. Cost
     reconciliation flows back to attendees via Venmo / cash.
   - **Individual bookings** (each attendee handles): flights,
     trains, however they're getting to the destination.

3. **Lock-time roster mechanics:**
   - Members in `in` state → confirmed for the trip.
   - Members in `holding` state → automatically bumped to `out`
     when Lock fires. Holding indefinitely = effectively a
     non-decision; Lock is the "last resort" forcing function.
   - Members in `out` state → already excluded.
   - **Cost divisor flips from `in + holding` to `in only`.**
     This is the v0 → v1 transition note already flagged in
     `rally-attendee-strategy-v0.md` Dimension 3.

4. **Lock phase has its own urgency layer.** Unlike sell phase
   (which counts down to commit_deadline), lock phase counts
   down to a **booking deadline** with active drip campaign.
   Mechanic: "if people don't book in time, costs go up and
   attendees go down" — flight prices rise, costs increase per
   person, late bookers may effectively drop out by failing to
   complete their booking. v0 likely models this as
   copy/messaging only (not actual price-tracking); future
   versions could add real flight-price drift signals.

5. **Lock UI shape adapts per-trip based on organizer's booking
   responsibilities.** Not a single static surface. The
   organizer flags what they're taking on (e.g., "I'm booking
   the house," "I'm booking everyone's hotel rooms,"
   "I'm booking the group activity"); each responsibility
   surfaces an inline detail-capture flow asking the relevant
   attendees for the data the booking actually needs (full
   name, DOB, passport, dietary, etc.). For trips where every
   attendee books their own everything, the organizer's UI is
   minimal.

6. **Lock output = Go input.** The data captured during Lock
   (per-person flight times, room assignments, house rules,
   detail fields) becomes the "logistics packet" rendered by
   Go phase. Lock and Go bleed into each other; the boundary
   is soft, not a hard state-machine cliff.

---

## Allocation step = wizard (locked 2026-05-03)

The lock-trigger allocation flow renders as a **guided wizard**:
one decision per screen, forward/back nav, progress indicator,
final review/confirm step. Each "I'm booking" item adds a
sub-step inside its screen for cost-confirmation (the actual
final cost). Each "you book" item is a single-tap forward.
Final step is a review of all allocations + a "fire lock" CTA.

Wizard scope per session = the lodging + intra-transport
inventory. Typical 1–3 items.

## Lock-phase deadline (locked 2026-05-03)

**Configurable, organizer-set, resettable.**

- New column `trips.lock_deadline` (or similar). Distinct from
  `commit_deadline` which is the sell-phase RSVP-by date.
- Organizer sets it during the lock-trigger wizard (default
  could be `date_start - 14 days` as a prefill, but they can
  override).
- Organizer can edit / push out the deadline post-lock if
  reality demands (some attendee asked for more time, etc.).
  No auto-bumping based on deadline alone.
- The deadline drives the urgency layer (drip campaign uses
  this as the anchor for cadence) but is NOT a hard cliff —
  Lock → Go is a separate manual organizer CTA.

## Immutability post-lock (locked 2026-05-03 — softer than expected)

Lock is NOT a roster freeze. The organizer can always navigate
back to sell-state behavior to add invitees post-lock. New
post-lock invitees:
- Get added to the trip (`trip_members` row created normally)
- Skip the lodging-voting step (vote is already finalized)
- Land directly into Module A (need to commit to shared costs)
  and Module B (need to do their checklist) at lock-state-equivalent
- Sub-questions deferred to implementation: do they get a
  catch-up email, what's their default RSVP state, etc.

So the only thing that's actually *frozen* at lock fire is
**the lodging vote winner** (what becomes the "selected" lodging
per existing data shape).

## Lock-readiness indicators (locked 2026-05-03 — needed)

The organizer needs two views during lock phase:

1. **Aggregate progress: "how close are we to everyone
   agreeing?"** A surface (likely Module A's header area, or
   a small organizer-only banner) showing something like:
   *"4 of 6 attendees have agreed to shared costs"*. When this
   hits 100%, the "go book" affordance unlocks for the
   organizer (per Module A's gating mechanic).

2. **Per-attendee progress: "who's booked their shit and who
   hasn't?"** Crew-section evolution post-lock: each crew row
   shows checklist completion state. Likely a fraction or
   subtle progress indicator: *"Andrea: 2 of 3 booked"* or
   similar. Lets the organizer see at a glance who needs a
   nudge in the WhatsApp side-channel.

Both surfaces are organizer-facing. Attendees see their own
checklist state but not (necessarily) others'.

## Post-lock trip page composition (locked 2026-05-03)

**Top of page:** condensed trip summary — dates, location,
key trip metadata. (Andrew's framing: "everything we have in
the footer" surfaced upward, since it's the most consequential
info post-lock.)

**Below the summary:** the new two-module surface (Module A
top + Module B bottom).

**Existing modules** (the sketch/sell module stack — headliner,
lodging cards, transport, crew, buzz, etc.) — implementation
question: which stay visible, which get de-emphasized,
which get absorbed into the new modules. Deferred to the
Lock implementation sub-sessions; strategic position is "the
two-module surface is the primary page in lock phase, other
stuff is reference."

## Open Questions (deferred to implementation sub-sessions)

UI specifics — these are downstream of locked strategy, not
strategy questions in their own right:

- Wizard step count / screens / progress UI
- Readiness indicator visual treatment + placement
- Post-lock trip page module rationalization (what stays,
  what gets de-emphasized)
- Mobile vs desktop layout differences
- Empty state when no shared-cost items exist (organizer
  pushed everything to attendees → Module A is empty/skipped)

Will be addressed inside the Lock-A through Lock-F sub-sessions
(see "Implementation sub-sessions" below).

## Original Open Questions (now resolved)

These are the next-most-consequential strategic questions
needed to scope implementation. Working through them in order:

### Layering principle (locked 2026-05-03)

This doc defines the **tasking + actions workflow** of lock
phase. Comms / nudging / drip mechanics SIT ON TOP of that
workflow — not part of it. The drip campaign extracted to its
own arc (see "Comms drip campaign across trip lifecycle" in
the fix-plan backlog). The deadline + consequence question
also sits on top of the workflow — it's a *property* of the
workflow, not a foundation.

Walk order:
- **First:** define the actual tasks (organizer-side +
  attendee-side) inside lock.
- **Then:** the deadline + consequence layer (a property of
  the tasks — "by when must each task be done").
- **Then:** the drip-campaign / nudging layer that pushes
  toward those deadlines.

### Workflow shape (locked 2026-05-03)

Lock phase is a **two-step page**:

**Step 1 — Organizer allocation (= the lock trigger).** The
moment the organizer hits the Lock CTA IS the allocation
moment. Rally walks them through every logged item (lodging
+ each intra-transport row) and forces a binary per item:
*"Are you booking this on behalf of the group, or are the
attendees booking it independently?"* The set of "I'm
booking" choices the organizer makes IS the input to Module
A; the set of "you book" choices IS the input to Module B.
This is one half of Rally's value-add at lock time: forcing
the explicit "who owns what" decision that's typically left
ambiguous in WhatsApp. The organizer can't fire lock without
making these calls.

**Cost fidelity required at lock time (locked 2026-05-03).**
For every "I'm booking on behalf" item, the organizer must
enter the **actual final cost** — not an estimate, not a
ballpark. These numbers are what friends will pay back, so
they need to be exact. Rally surfaces the existing estimate
as a prefilled value but treats it as "needs confirmation":
the organizer either confirms the estimate as the actual or
overwrites it with the real number. No allocation can be
"I'm booking" without a confirmed actual cost.

**Payment-handle prompt (locked 2026-05-03).** If the
organizer fires lock without a payment handle (Venmo / Zelle /
Cashapp) set on their user, Rally prompts them to add one
inline as part of the lock confirmation flow. Just-in-time
capture, not gated as a hard prerequisite — they can skip
and use the "no payment link set" fallback in Module A, but
the nudge fires every time they organize until they set one.

**Step 2 — Lock phase proper.** A single page with two stacked
modules. The order matters:

#### Module A (top): Shared cost commitment

The other half of Rally's value-add. For every item the
organizer flagged "I'm booking on behalf," there's a real-money
share to be paid back. Before the organizer actually books,
each attendee must **affirmatively agree to their aggregate
share** (locked v0 simplification — single agree, no per-item
opt-out):

- Organizer finalizes the actual cost per shared item (no more
  estimates — the price they're about to charge their card).
- Each affected attendee sees a single aggregate commitment
  surface: *"You'll owe Andrew $X total for the trip's shared
  costs (lodging + intra-trip transport breakdown shown).
  Agree?"*
- **The agreement is an explicit checkbox tap** — UI affordance
  reads "i'm in" or "i'm down" (lowercase per voice). The tap
  is the documented commitment.
- **No per-item opt-out in v0.** Aggregate only. If you don't
  agree to the bundle, you're not in. (Per-item granularity =
  v1+.)
- **No "disagree" button.** Refusal isn't a UI affordance.
  Silence (never tapping) is the only refusal path.
- The trigger for the organizer to actually go book =
  **everyone has tapped "i'm in" on their aggregate share.**
  Until then, booking is pending; the organizer doesn't have
  social cover to charge their card on others' behalf.
- **Module A also surfaces the organizer's payment handle**
  (Venmo / Zelle / Cashapp username or deep link). Once the
  attendee has tapped "i'm in," the affordance reads roughly
  *"Send Andrew $X via [Venmo @andrewshipman | Zelle | etc]"*
  with a tap-to-open link. This is the actionable settlement
  layer — Rally doesn't process payments but it removes
  every excuse for not paying.

This is the Rally moat: organizers stop unilaterally committing
funds on behalf of friends who later ghost. The commitment is
explicit, documented (tap timestamp recorded), and a precondition
for the booking action. Settlement happens out-of-band but
Rally surfaces the path.

#### Module B (bottom): Personal checklist

Per-attendee action items derived from the allocations.
Each item = checkbox + required detail fields (gated form
per the locked checklist semantics).

**v0 field captures per item type (locked 2026-05-03):**

| Item | When it appears | Required fields | Optional / future |
|---|---|---|---|
| Book your flight | Always | Flight number OR (departure airport + arrival airport + arrival time) | Auto-derive airline / departure time / etc from flight number via Google or similar API. Deferred to a future API-integration session. |
| Book your hotel | When lodging allocation = individual | Hotel name + roommate text (free-text per locked decision) | Confirmation code, check-in / check-out (auto-derive from trip dates) |
| Book your intra-trip transport item | When that specific intra-transport item is allocated to individuals (case-by-case per item) | Free-text confirmation toggle. Booking link surfaced from `transport.link` if organizer set it (attendee taps through to the booking site). | Future: deeper integration with specific providers (Trenitalia, Turo, etc). |

**Note on intra-trip transport allocation:** unlike lodging
where the binary tends to be type-driven (house = organizer,
hotels = individuals), intra-transport allocation is item-by-
item. Charter van and rental car typically end up
organizer-booked; train tickets and intra-flights typically end
up individual. Rally doesn't preset; the organizer decides per
item during the allocation step. When pushed to individuals,
Rally surfaces the `transport.link` (if the organizer entered
one in sketch) as a "go book this" deep link in the attendee's
checklist item.

**Settlement / payment status is OUT of v0 scope.** People
settle up via Venmo / cash on their own time. Lock phase is
about *alignment* (everyone explicitly agreeing to costs),
not about *tracking who's paid*. Payment-status tracking is
its own future arc if/when it earns priority.

#### Module ordering rationale

Module A is on top because it's the gating event for the
organizer. Until shared costs are committed, the organizer
can't responsibly book; until the organizer books, the
attendees don't know what's actually happening. So Module A
unblocks Module B for the items that depend on organizer
action; Module B can run in parallel for the items that don't
(your own flight isn't gated by the lodging commitment).

### v0 scope narrowing: skeleton only (locked 2026-05-03)

Lock phase v0 solves only for the **trip skeleton** — the three
questions every group has to answer to actually go on a trip:

1. **Where are we staying?** (lodging)
2. **How are we getting there?** (flights / individual transport
   to destination)
3. **How are we getting around once we're there?** (intra-trip
   transport)

Everything else — activities, headliner, provisions, any other
estimated costs — stays as **ballpark approximations in the
cost summary**, NOT in the allocation flow, NOT in the
commitment ceremony, NOT in the personal checklist. Those
categories get refined later (likely in a v1 expansion of
lock OR absorbed into Go phase).

This is the v0 cut. Andrew's reasoning: get the skeleton right
first; everything else is downstream.

### Intent: commitment filter (locked 2026-05-03)

Lock phase isn't just a workflow — it's a **filter**. The
people who tap "i'm in," complete their checklist, and follow
through on bookings are the people actually coming on the
trip. The people who don't tap or don't complete are the
people the organizer can confidently move past. The phase is
designed to surface that signal as quickly as possible —
hence the urgency layer, the explicit commitment ceremony,
and the "put their money where their mouth is" framing.

The high-confidence roster that emerges from lock is what
Go phase operates on.

### v0 inventory of allocatable items (locked 2026-05-03)

Each allocatable item type supports a binary allocation: *book
on behalf* (organizer fronts cash, attendees owe back) OR
*push to individuals* (each attendee books their own).

| Item type | v0? | Allocatable? | Notes |
|---|---|---|---|
| Lodging | ✅ | binary | House booked-on-behalf vs everyone books own hotel |
| Intra-trip transport | ✅ | binary | Rental car / airport pickup / group transport |
| Transport TO destination | ✅ | individual-only | Flights, trains — always individual checklist item |
| Group activities | ❌ v1+ | n/a | Stays as ballpark cost-summary line; no allocation flow |
| Headliner | ❌ v1+ | n/a | Stays as ballpark cost-summary line; no allocation flow |
| Provisions | ❌ | n/a | Stays as ballpark cost-summary line; no commitment, no checklist |

So Module A (commitment ceremony) only handles lodging +
intra-trip transport when allocated as "I'm booking on behalf."
Module B (personal checklist) handles flights (always) +
lodging (when individual) + intra-trip transport (when individual).

### Roommate pairing (locked 2026-05-03)

**v0 = text-only.** When an attendee checks off "book your
hotel" with a roommate, they type a free-text "rooming with
Sarah" note. No data structure for pairs. No mutual confirmation
flow. Real `room_pairs` data model deferred to v1+.

### Checklist item semantics (locked 2026-05-03)

**Hybrid: gated form with required detail fields.** When an
attendee checks "I booked my flight," a form appears requiring
the booking details (flight number, arrival time, departure
time). Completion = both the toggle AND the fields. Self-
attestation is the trigger; required details are the price of
admission. Rationale (Andrew): "it helps bring context to the
group" — Go-phase logistics packet falls out of these fields
naturally, no double-entry.

### Q2: Cost-split mechanics for individually-booked vs shared

The current cost model has "shared" + "yours" buckets. Lock
phase introduces a third dimension: **who paid what**:
- Shared cost the organizer paid → Venmo request to attendees
- Individual cost the attendee paid themselves → no Venmo,
  just recorded so the cost summary reflects reality
- Detail-capture items that gate booking → "you need to send
  Andrew your passport number for the activity"

Open: how do these surface in the cost summary post-lock? Is
there a "you owe Andrew" affordance? Does Rally generate Venmo
deep links? Just shows a number to type into Venmo manually?

### Q3: Lock → Go boundary

Locked: lock and go bleed into each other. Open:

- What event triggers the transition?
  - Manual ("organizer hits 'go time'")
  - Automatic on N-days-before-trip-start
  - Automatic when last booking is recorded
  - Some combination
- What changes visually when Go fires? More than just the
  countdown target?
- Can the trip "go back" from Go to Lock? (Probably not, but
  worth confirming.)

---

## Dimension drafts (deferred until Q1–Q3 resolve)

- **Dimension 1: Trigger + State Transition**
- **Dimension 2: The Booking Workflow** (organizer-shared vs
  individual; detail-capture mechanics)
- **Dimension 3: Surfaces** (organizer Lock CTA + Lock UI;
  attendee post-lock view; notifications)
- **Dimension 4: Urgency + Drip Campaign**

---

## Implementation sub-sessions (anticipated, not yet scoped)

- **Lock-A:** Lock CTA + organizer-side Lock confirmation flow
  (the moment the trigger fires)
- **Lock-B:** Cost divisor switch + footer reconciliation post-lock
- **Lock-C:** Booking-responsibility flagging system + per-flag
  detail-capture surfaces
- **Lock-D:** Lock-phase countdown + drip campaign emails
- **Lock-E:** Cost reconciliation / Venmo affordance on cost summary
- **Lock-F:** Holding → out auto-bump on lock; UI feedback
- (others surface as the dimensions get drafted)
