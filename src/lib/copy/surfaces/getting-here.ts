// §5.28 — Getting Here (per-viewer arrival estimator — Session 9B-1).
// Personal module: each invitee picks their arrival mode, drops a
// rough cost, and sees a Google Flights / Maps deep-link for
// ballparking. No roster on sell — current viewer only.

import type { Templated } from '@/lib/themes/types';

export const gettingHere: Record<string, Templated> = {
  sectionTitle:            'getting here',
  sectionCaption:          'your way in',
  emptyPrompt:             'how are you getting there?',

  'modeLabel.flight':      'flight',
  'modeLabel.drive':       'drive',
  'modeLabel.train':       'train',
  'modeLabel.other':       'other',

  'modeIcon.flight':       '✈️',
  'modeIcon.drive':        '🚗',
  'modeIcon.train':        '🚆',
  'modeIcon.other':        '·',

  'inputHelper.flight':    'drop in a rough estimate · rolls into your total · not a booking',
  'inputHelper.drive':     'gas + tolls · rolls into your total · not a booking',
  'inputHelper.train':     'ticket estimate · rolls into your total · not a booking',
  'inputHelper.other':     'already local · rideshare · anything else · drop a rough number',

  'refLinkLabel.flight':   'ballpark it on google flights ↗',
  'refLinkLabel.drive':    'ballpark it on google maps ↗',
  'refLinkLabel.train':    'ballpark it on google maps ↗',

  // Inline link marker: <passport> is replaced in JSX with an anchor
  // to /passport so the copy stays lexicon-governed end-to-end.
  'passportNudge.before':  'add your "based in" city to your ',
  'passportNudge.link':    'passport',
  'passportNudge.after':   ' to search flights ↗',

  'rollLine.prefix':       'your way in',
  'rollLine.pending':      '(pending)',
};
