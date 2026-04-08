// Theme: Euro Summer. Source: theme content system §10.
// Hint.name uses {place} per lexicon §5.22.

import type { Theme } from './types';

export const euroSummer: Theme = {
  id: 'euro-summer',
  name: 'Euro summer',
  type: 'setting',
  vibe: 'europe is calling 🍋',

  palette: {
    bg:        '#f5e9d3',
    ink:       '#2a1a0f',
    accent:    '#c4532a',
    accent2:   '#7a8a3a',
    stickerBg: '#f4c94a',
    stroke:    '#2a1a0f',
    surface:   '#1a140a',
    onSurface: '#f5e9d3',
  },

  strings: {
    vibe: 'europe is calling 🍋',

    sticker: {
      new:    'new euro szn 🍋',
      invite: 'come to europe 🍋',
      locked: 'locked in 🏛️',
    },

    marquee: [
      'too much olive oil',
      'spritz at noon',
      'boat day',
      'walk the coast',
      'dinner at 10pm',
    ],

    hint: {
      name:   ({ place }) => `'${place ?? 'somewhere'} summer'`,
      dates:  'when can we get away?',
      invite: 'pull the crew in early — flights',
    },

    empty: {
      noActivities: 'add the villa, add the boat day, add the long dinner',
      noExtras:     'packing list: 6 linen shirts, 1 dress code for dinner',
    },

    rsvp: {
      in:      { buttonLabel: 'ciao 🍋' },
      holding: { buttonLabel: 'checking flights ✈️' },
      out:     { buttonLabel: "can't swing it 🥲" },
    },

    nudge: {
      t14:    '2 weeks, book your flights',
      t7:     '7 days, the villa needs a head count',
      t3:     '72h — start packing the linen',
      cutoff: 'final roster tomorrow — ciao',
    },

    cta:     { send: 'send it 🍋' },
    caption: { invite: 'europe is calling' },
  },
};
