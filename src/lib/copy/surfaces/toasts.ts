// §5.13 — Toasts / confirmations.
import type { Templated } from '@/lib/themes/types';

export const toasts: Record<string, Templated> = {
  'tripCreated':    'done. share the link.',
  'rsvp.in':        "you're on the list.",
  'rsvp.maybe':     'noted.',
  'rsvp.holding':   'noted.',
  'rsvp.out':       'next one.',
  'tripLocked':     "locked. let's go.",
  'costPaid':       "paid. you're set.",
  'photoUploaded':  'added to the wall.',
  'pollVoteCast':   'counted.',
  'linkCopied':     'link copied. drop it in the chat.',
  'settingsSaved':  'saved.',
};
