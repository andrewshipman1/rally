// Theme: Wine Country. Source: theme content system §12.
// Hint.name uses {region} per lexicon §5.22.

import type { Theme } from './types';

export const wineCountry: Theme = {
  id: 'wine-country',
  name: 'Wine country',
  type: 'setting',
  vibe: 'pour me in 🍷',

  palette: {
    bg:        '#f4ede0',
    ink:       '#3e1f3a',
    accent:    '#8a2e3e',
    accent2:   '#a8945a',
    stickerBg: '#e8d4a0',
    stroke:    '#3e1f3a',
    surface:   '#2a1420',
    onSurface: '#f4ede0',
  },

  strings: {
    vibe: 'pour me in 🍷',

    sticker: {
      new:    'new tasting 🍷',
      invite: 'pour yourself in 🍷',
      locked: 'decanted 🍷',
    },

    marquee: [
      'tasting at 11',
      'tannins discussed',
      'cheese plate obligatory',
      'designated driver decided',
      'long lunch',
    ],

    hint: {
      name:   ({ region }) => `'${region ?? 'sonoma'} weekend'`,
      dates:  "when's harvest / when's the quiet season?",
      invite: 'pull the wine people in',
    },

    empty: {
      noActivities: 'add the vineyard, add the long lunch, add the nap',
      noExtras:     'packing list: the notebook, the good jacket',
    },

    rsvp: {
      in:      { buttonLabel: 'pour me in 🍷' },
      holding: { buttonLabel: 'swirling on it 🍇' },
      out:     { buttonLabel: "can't make it 😔" },
    },

    nudge: {
      t14:    '2 weeks til the tasting',
      t7:     '7 days, reservations at the flagship drop',
      t3:     '72h — book the driver',
      cutoff: 'final count tomorrow, the vineyard needs numbers',
    },

    cta:     { send: 'send it 🍷' },
    caption: { invite: 'the wine weekend is on' },
  },
};
