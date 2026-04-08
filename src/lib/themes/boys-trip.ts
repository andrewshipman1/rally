// Theme: Boys Trip. Source: theme content system §02.
// NOTE: lexicon §6 doesn't enumerate this theme yet — fomoFlag/ctaEmoji/
// countdownSignature left undefined. Tracked for CoWork backfill.

import type { Theme } from './types';

export const boysTrip: Theme = {
  id: 'boys-trip',
  name: 'Boys trip',
  type: 'occasion',
  vibe: 'the boys are back 🍺',

  palette: {
    bg:        '#0f0e10',
    ink:       '#f0e8d8',
    accent:    '#e84a1a',
    accent2:   '#4aa3d9',
    stickerBg: '#ffd84d',
    stroke:    '#f0e8d8',
    surface:   '#1a1a1e',
    onSurface: '#f0e8d8',
  },

  strings: {
    vibe: 'the boys are back 🍺',

    sticker: {
      new:    'new rally 🍺',
      invite: 'the boys are calling 🎲',
      locked: "it's on 🔥",
    },

    marquee: [
      'the boys are back',
      'what happens stays',
      'tee time 7am',
      'over/unders open',
      'last one in pays',
    ],

    hint: {
      name:   'the group chat already knows the name',
      dates:  'how long we getting out of dodge?',
      invite: 'pull the boys in',
    },

    empty: {
      noActivities: 'sportsbook, steak, tee time, repeat',
      noExtras:     'packing list so nobody forgets the putter',
    },

    rsvp: {
      in:      { buttonLabel: "i'm in 🤝" },
      holding: { buttonLabel: 'tentative 🤔' },
      out:     { buttonLabel: "can't do it 🫡" },
    },

    nudge: {
      t14:    "2 weeks out, who's locked?",
      t7:     '7 days — send the cash to the group',
      t3:     '72h, last chance to bail without heat',
      cutoff: 'roster closes tomorrow, send it',
    },

    cta:     { send: 'send it 🚀' },
    caption: { invite: 'the boys are going' },
  },
};
