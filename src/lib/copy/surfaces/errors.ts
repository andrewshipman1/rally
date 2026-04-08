// §5.12 — Errors. Sound like a friend who screwed up, not enterprise SaaS.
import type { Templated } from '@/lib/themes/types';

export const errors: Record<string, Templated> = {
  'generic500':     'oh no. something broke on our end. give it a sec and try again.',
  'networkDown':    'the internet is being weird. check your signal.',
  'tripNotFound':   "we couldn't find that trip. either the link's wrong or it got deleted.",
  'notInvited':     "this one's not for you. ask the organizer for a link.",
  'authRequired':   "log in to keep going. promise it's quick.",
  'missingField':   'we need this one.',
  'badEmail':       "that doesn't look like an email.",
  'paymentFailed':  'the card got declined. try another one?',
  'saveFailed':     "didn't save. don't lose your place — try again.",
};
