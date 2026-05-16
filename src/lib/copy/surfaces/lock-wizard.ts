// §5.29 — Lock-B wizard (organizer's sell → lock decision flow).
//
// All user-facing copy for the 7-screen wizard plus its edit-first
// confirmation, dismiss confirmation, and fireLock error states.
// Brief: rally-fix-plan-v1.md §Session 12B, scope item #1.
// Visual contract: rally-lock-b-mockup.html (16 frames).
//
// Interpolation: render() uses `{token}` substitution (not `$1/$2`).
// The brief's example values used `$1`/`$2` shorthand; tokens are
// translated to named placeholders here to match interpolate.ts.

import type { Templated } from '@/lib/themes/types';

export const lockWizard: Record<string, Templated> = {
  // ─── Screen 1 — verification ────────────────────────────────────
  'verify.heading':            'does this look right?',
  'verify.sub':                "you'll confirm trip details, lock in actual costs for items you're booking, and decide who fronts what. ~5 min — have your booking confirmations handy.",
  'verify.cta.continue':       'looks good — continue →',
  'verify.cta.editFirst':      'edit first',
  // {from} = pre-lock divisor (in + holding); {to} = post-lock divisor (in only after holding-bump)
  'verify.bumpNote':           'holding members will be bumped to out when lock fires. cost divisor flips from {from} → {to}.',
  'verify.summary.trip':       'trip',
  'verify.summary.when':       'when',
  'verify.summary.where':      'where',
  'verify.summary.crew':       'crew',
  'verify.summary.lodgingVote': 'lodging vote',
  'verify.summary.items':      'items to allocate',
  // {inCount} / {holdingCount} / {outCount}
  'verify.summary.crewValue':  '{inCount} in · {holdingCount} holding · {outCount} out',
  // {name} = winning spot name; {votes} = vote count; {total} = total voters
  'verify.summary.voteValue':  '{name} · {votes} of {total}',
  'verify.summary.voteNoVotes': 'no votes yet',
  'verify.summary.voteTied':   'tied',
  'verify.summary.voteSingle': '{name}',
  'verify.summary.voteNone':   'no lodging yet',

  // ─── Verify — blocked (empty trip) ──────────────────────────────
  'verify.blocked.heading':    'add something to lock first',
  'verify.blocked.sub':        "your trip has nothing to allocate yet — add at least one lodging, transport item, or headliner before locking.",
  'verify.blocked.bannerTitle': 'trip is empty',
  'verify.blocked.lodging':    'lodging: none',
  'verify.blocked.headliner':  'headliner: none',
  // {count} = number of intra-transport items
  'verify.blocked.transport':  'intra-transport: {count} items',

  // ─── Verify — edit-first confirmation ───────────────────────────
  'verify.editFirst.heading':  'editing will reset your lock progress.',
  'verify.editFirst.sub':      "we'll close the wizard so you can edit your trip. when you're ready, tap resume lock and we'll start from the top.",
  'verify.editFirst.cta.stay': 'stay in wizard',
  'verify.editFirst.cta.confirm': 'edit first →',

  // ─── Screen 2 — lodging override ────────────────────────────────
  'lodgingOverride.heading':         'which spot?',
  'lodgingOverride.sub.default':     'vote winner is selected by default. tap to override.',
  'lodgingOverride.sub.noVotes':     "no one's voted yet — pick the spot.",
  'lodgingOverride.sub.tied':        'two spots are tied — pick the winner.',
  'lodgingOverride.sub.singleSpot':  'your trip has one lodging — straight to allocation.',
  // {votes} of {total}
  'lodgingOverride.meta.voteCount':  '{votes} of {total}',
  'lodgingOverride.meta.zero':       '0',
  'lodgingOverride.cta':             'continue →',

  // ─── Screens 3, 4, 5 — allocation ───────────────────────────────
  // Headings — {name} = item name
  'allocation.heading.lodging':       "who's booking {name}?",
  'allocation.heading.headliner':     "who's buying {name}?",
  'allocation.heading.transport':     "who's booking the {name}?",
  'allocation.sub.lodging':           "this decides whether it's a shared cost or an individual task.",
  // {label} = headliner description; {cost} = per-person cost label (e.g., "$499")
  'allocation.sub.headliner':         '{label} · {cost}/person.',
  // {route} = transport description / route
  'allocation.sub.transport':         '{route} · group transport.',
  'allocation.organizerBooks.label':  "i'm booking",
  'allocation.organizerBooks.sub.lodging':   'i front the cash, attendees commit to their share + venmo me back',
  'allocation.organizerBooks.sub.headliner': 'i bulk-buy passes, attendees venmo me back',
  'allocation.organizerBooks.sub.transport': 'i reserve it, attendees split the cost',
  'allocation.individualBooks.label': 'each attendee books',
  'allocation.individualBooks.sub.lodging':   'everyone books their own hotel — goes on their personal checklist',
  'allocation.individualBooks.sub.headliner': "everyone gets their own pass — on their checklist",
  'allocation.individualBooks.sub.transport': 'everyone arranges their own — on their checklist',
  'allocation.noCostNote':            'no cost to confirm — each attendee handles their own.',
  'allocation.cta':                   'continue →',

  // ─── Inline cost input (allocation screens) ─────────────────────
  'cost.label':       'actual final cost',
  // {estimate} = e.g., "$18,000"
  'cost.hint':        "estimate was {estimate} · this is what you'll charge your card. confirm or overwrite.",
  'cost.hintNoEstimate': "this is what you'll charge your card.",
  'cost.error.empty': "enter the actual cost — this is what attendees will pay back.",
  'cost.error.invalid': "enter a valid dollar amount.",
  'cost.error.tooHigh': "that seems unusually high — sure?",
  'cost.placeholder': '0',

  // ─── Screen 6 — payment handle ──────────────────────────────────
  'paymentHandle.heading':       'where do they venmo you?',
  'paymentHandle.sub':           "attendees use this to pay you back. set once, applies to every trip you organize. you can skip and add later.",
  'paymentHandle.venmo.label':         'venmo',
  'paymentHandle.venmo.placeholder':   '@your-venmo-handle',
  'paymentHandle.zelle.label':         'zelle (optional)',
  'paymentHandle.zelle.placeholder':   'phone or email',
  'paymentHandle.cashapp.label':       'cashapp (optional)',
  'paymentHandle.cashapp.placeholder': '$cashtag',
  'paymentHandle.cta.save':            'save & continue →',
  'paymentHandle.cta.skip':            "skip — i'll add later",

  // ─── Screen 7 — final review ────────────────────────────────────
  'review.heading':        'ready to lock?',
  'review.sub':            'last chance to fix anything. tap a row to edit.',
  'review.subAllIndividual': "all items go on attendees' personal checklists — nothing's shared.",
  'review.label.spot':            'spot',
  'review.label.headliner':       'headliner',
  // {name} = transport description
  'review.label.transport':       '{name}',
  'review.label.yourShare':       'your share total',
  'review.label.bookingDeadline': 'booking deadline',
  // {name} = item name
  'review.value.individual':      '{name} · each books',
  'review.value.individualUnnamed': 'each books',
  // {name} = item name; {cost} = formatted dollar amount
  'review.value.organizerBooks':  "{name} · {cost} · i'm booking",
  // {cost} = formatted dollar amount when no name surfaces (transport row already labels)
  'review.value.organizerBooksUnnamed': "{cost} · i'm booking",
  'review.value.yourShareEmpty':  '$0 (nothing shared)',
  // {amount} = per-person dollar amount; {attendees} = count
  'review.value.yourShare':       '${amount} each ({attendees} attendees)',
  // {date} = formatted date; {days} = days before trip start
  'review.value.deadline':        '{date} · {days} days before trip',
  'review.value.deadlineNoDate':  'not set',
  'review.cta.editRow':           'change',
  'review.cta.fire':              'lock it in 🔒',
  'review.cta.firing':            'locking…',
  'review.cta.goBack':            'go back',

  // ─── Dismiss confirmation (drawer swipe-down past screen 1) ─────
  'dismiss.heading':       'discard your lock progress?',
  // {count} = current step number
  'dismiss.sub':           "you're {count} screens in. closing now resets everything — next time you tap lock it in, you'll start over.",
  'dismiss.cta.keep':      'keep going',
  'dismiss.cta.discard':   'discard',

  // ─── RPC error states (final-review submit) ─────────────────────
  'error.concurrent.heading':   'trip was already locked',
  'error.concurrent.body':      'someone else (probably another browser tab) locked this trip while you were filling this out. refresh to see the current state.',
  'error.already.heading':      'trip is already locked',
  'error.already.body':         "this trip is in lock state already. refresh to see what's happening.",
  'error.notOrganizer.heading': 'only the organizer can lock',
  'error.notOrganizer.body':    "you don't have permission to lock this trip.",
  'error.unauth.heading':       'session expired',
  'error.unauth.body':          'sign in again to continue.',
  'error.notFound.heading':     'trip not found',
  'error.notFound.body':        "the trip you're trying to lock doesn't exist anymore.",
  'error.validation.heading':   "we couldn't lock that",
  'error.validation.body':      'something in the allocations looked off. go back and double-check before retrying.',
  'error.network.heading':      'something went wrong',
  'error.network.body':         'hit a hiccup. try again or refresh the page.',
  'error.cta.refresh':          'refresh trip page →',
  'error.cta.retry':            'try again',

  // ─── Sticky bar variant — edit-on-sell-from-wizard ──────────────
  'stickyBar.editOnSellFromWizard.resume': 'resume lock →',

  // ─── Sell-phase sticky bar — organizer lock CTA ─────────────────
  'stickyBar.lockCta': 'lock it in →',

  // ─── Step tag (top of drawer body) ──────────────────────────────
  // {step}/{total} · {label}
  'stepTag.format':       'step {step} of {total} · {label}',
  'stepTag.cancel':       'cancel',
  'stepTag.back':         '← back',
  'stepTag.label.verify':       'verify',
  'stepTag.label.lodgingPick':  'lodging',
  'stepTag.label.lodgingAlloc': 'lodging',
  'stepTag.label.headliner':    'headliner',
  'stepTag.label.transport':    'transport',
  'stepTag.label.payment':      'payment',
  'stepTag.label.review':       'review',
};
