// Theme: Desert Trip. Source: theme content system §14.
// Hint.name uses {place} per lexicon §5.22.

import type { Theme } from './types';

export const desertTrip: Theme = {
  id: 'desert-trip',
  name: 'Desert trip',
  type: 'setting',
  vibe: 'the desert is calling 🌵',

  palette: {
    bg:        '#f4e4cf',
    ink:       '#3a1f10',
    accent:    '#d94a1a',
    accent2:   '#7a5a8f',
    stickerBg: '#f4c94a',
    stroke:    '#3a1f10',
    surface:   '#2a1508',
    onSurface: '#f4e4cf',
    hot:       '#e63946',
  },

  strings: {
    vibe: 'the desert is calling 🌵',

    sticker: {
      new:    'new desert run 🌵',
      invite: 'the desert is calling 🌵',
      locked: 'see you under the stars ✨',
    },

    marquee: [
      'big sky',
      'slow morning',
      'loud night',
      'stargaze at 10',
      'pool at noon',
    ],

    hint: {
      name:   ({ place }) => `'${place ?? 'joshua tree'} weekend' or something dumber`,
      dates:  "when's the weather livable?",
      invite: 'pull the crew in',
    },

    empty: {
      noActivities: 'add the pool day, add the hike, add the roadside diner',
      noExtras:     'packing list: sunscreen, warm layer for nights, playlist for the drive',
    },

    in:      { button: 'see you there 🌵' },
    holding: { button: 'maybe 🌄' },
    out:     { button: "can't make it 😔" },

    nudge: {
      t14:    '2 weeks til the desert',
      t7:     '7 days, where are we staying?',
      t3:     '72h — gas up the car',
      cutoff: "final count tomorrow, the desert doesn't wait",
    },

    cta:     { send: 'send it 🌵' },
    caption: { invite: 'the desert is calling' },

    countdownSignature: 'days until big sky',
  },
};
