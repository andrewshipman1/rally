// §5.14 — System emails (Resend transports).
// Subject lines do most of the work — they have to survive an inbox skim.
// Bodies are short, max 3 lines.
//
// NOTE: "RSVP" appears in the trip-invitation subject line. This is the
// asterisked exception from §3 — the only place in the entire product
// where the word RSVP is allowed in user-facing copy, because that's the
// keyword inboxes scan for.
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const emails: Record<string, Templated> = {
  // Magic link
  'magicLink.subject':     'your rally door is open',
  'magicLink.body':        'tap to let yourself in. expires in 15.',

  // Trip invitation
  'invite.subject':        ({ organizer, trip }: ThemeVars) =>
    `RSVP: ${organizer ?? 'someone'} is calling you to ${trip ?? 'a rally'}`,
  'invite.body':           ({ organizer, trip, n }: ThemeVars) =>
    `${organizer ?? 'someone'} just dropped a rally for ${trip ?? 'something'}. ${n ?? '?'} days out. tap the link, see the pitch, decide if you're in.`,

  // New yes (organizer-bound)
  'newYes.subject':        ({ name, trip }: ThemeVars) => `${name ?? 'someone'} is in for ${trip ?? 'the trip'}`,
  'newYes.body':           ({ n_in, n }: ThemeVars) =>
    `${n_in ?? 0} yes's now. ${n ?? '?'} days to lock. you're cooking.`,

  // Lock deadline T-3 (organizer)
  'lockDeadlineT3.subject':({ trip }: ThemeVars) => `3 days to lock ${trip ?? 'the trip'}`,
  'lockDeadlineT3.body':   ({ n_in, n_hold }: ThemeVars) =>
    `${n_in ?? 0} yes's. ${n_hold ?? 0} maybes. nudge the maybes.`,

  // Lock deadline T-0 (organizer)
  'lockDeadlineT0.subject':({ trip }: ThemeVars) => `last call: ${trip ?? 'the trip'}`,
  'lockDeadlineT0.body':   "today's the day. lock it or push it.",

  // Trip locked (crew)
  'tripLocked.subject':    ({ trip }: ThemeVars) => `we're going. ${trip ?? 'it'} is locked.`,
  'tripLocked.body':       ({ n_in, n }: ThemeVars) =>
    `${n_in ?? 0} ride or dies. ${n ?? '?'} days. start packing.`,

  // T-7 hype
  'hypeT7.subject':        ({ trip }: ThemeVars) => `one week until ${trip ?? 'the trip'}`,
  'hypeT7.body':           'the vibe is approaching. start the playlist.',

  // T-1 hype
  'hypeT1.subject':        ({ trip }: ThemeVars) => `tomorrow. ${trip ?? 'the trip'}.`,
  'hypeT1.body':           "tomorrow. that's it. that's the email.",

  // Post-trip
  'postTrip.subject':      ({ trip }: ThemeVars) => `how was ${trip ?? 'it'}?`,
  'postTrip.body':         'drop your photos in the wall. one day everyone will be glad you did.',
};
