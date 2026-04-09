// §5.9 — Lock flow (organizer decision moment).
import type { Templated } from '@/lib/themes/types';

export const lockFlow: Record<string, Templated> = {
  // Phase labels (migrated from EditorToolbar inline strings)
  'phase.sketch.label':     'Sketch',
  'phase.sell.label':       'Sell',
  'phase.lock.label':       'Lock',
  'phase.go.label':         'Go',
  'phase.sketch.subtitle':  'Building the plan',
  'phase.sell.subtitle':    'Collecting RSVPs',
  'phase.lock.subtitle':    'Trip confirmed',
  'phase.go.subtitle':      'On the trip',

  // Lock ceremony CTAs
  'lockCta':                'lock it in',
  'lockCta.disabled':       'not ready to lock',

  // Confirmation dialog
  'lockConfirm.title':      'lock this trip?',
  'lockConfirm.body':       "once locked, RSVPs close and the countdown starts for real. there's no going back.",
  'lockConfirm.confirm':    'lock it',
  'lockConfirm.cancel':     'not yet',

  // Guard messages (displayed client-side on server error)
  'guard.noDeadline':       'set a commit deadline first.',
  'guard.noMembers':        "need at least one RSVP'd member to lock.",
  'guard.wrongPhase':       "trip isn't in the sell phase.",

  // Post-lock banners
  'postLock.banner':        "locked in. it's happening.",
  'postLock.subtitle':      'the plan is set. see you there.',
};
