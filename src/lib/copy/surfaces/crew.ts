// §5.25 — Crew (the guest list subsurface, read-only in v0).
//
// Note: Section headers and captions (in/holding/out) live in rsvp.ts
// as `crew.section.*` and `crew.caption.*` — they are the global RSVP
// state vocabulary and are shared across the crew page, buzz events,
// and the sticky bar. Do NOT duplicate them here.
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const crew: Record<string, Templated> = {
  // ─── Page chrome ────────────────────────────────────────────────
  'pageTitle':            'the crew',
  'pageSubtitle':         ({ n, trip_name }: ThemeVars) => `${n ?? '?'} rallied · ${trip_name ?? 'this trip'}`,
  'backLink':             'back to trip',
  'viewLink':             'the crew →',

  // ─── Summary blocks (top of page tally) ─────────────────────────
  'summaryIn':            'in',
  'summaryHolding':       'holding',
  'summaryOut':           'out',

  // ─── Row details ────────────────────────────────────────────────
  'hostMarker':           '👑',
  'youTag':               'you',
  'plusOneSubtext':       ({ name }: ThemeVars) => `+1 · bringing ${name ?? 'guest'}`,
  'plusOneSubtextAnon':   '+1 · plus guest',
  'rowSubRsvpd':          ({ when }: ThemeVars) => `rsvp'd ${when ?? 'recently'}`,
  'rowSubOpened':         "opened · hasn't rsvp'd",
  'rowSubUnopened':       "hasn't opened the invite",
  'rowSubOutReason':      ({ reason }: ThemeVars) => `"${reason ?? ''}"`,

  // ─── Empty states ───────────────────────────────────────────────
  'emptyStateIn':         "nobody's rallied yet",
  'emptyStateHolding':    "everyone's decided",
  'emptyStateOut':        "nobody's out — knock on wood 🤞",
  'emptyStatePending':    "nobody's sitting on it",

  // ProfileModal
  'profile.photoIcon':   '\ud83d\udcf8',
  'profile.messageCta':  'Message organizer \ud83d\udcac',
  'profile.closeCta':    'Close',
};
