// Theme: Lake Weekend. Source: theme content system §13.
// Hint.name uses {lake} per lexicon §5.22.

import type { Theme } from './types';

export const lakeWeekend: Theme = {
  id: 'lake-weekend',
  name: 'Lake weekend',
  type: 'setting',
  vibe: 'lake szn 🛶',

  palette: {
    bg:        '#dfeef0',
    ink:       '#0e2a3e',
    accent:    '#c4532a',
    accent2:   '#f4c94a',
    stickerBg: '#f4c94a',
    stroke:    '#0e2a3e',
    surface:   '#0a1a24',
    onSurface: '#dfeef0',
  },

  strings: {
    vibe: 'lake szn 🛶',

    sticker: {
      new:    'new lake day 🛶',
      invite: 'lake szn 🛶',
      locked: 'launching 🚤',
    },

    marquee: [
      'floaties ready',
      'pontoon fueled',
      'beer pong set up',
      'sunset on the water',
      'grill by 6',
    ],

    hint: {
      name:   ({ lake }) => `'${lake ?? 'tahoe'} ${new Date().getFullYear()}' or 'lake szn'`,
      dates:  "when's the water warm?",
      invite: 'pull the lake crew in',
    },

    empty: {
      noActivities: 'add the house, add the boat, add the grill',
      noExtras:     'packing list: floatie, sunscreen, backup floatie',
    },

    rsvp: {
      in:      { buttonLabel: 'lake szn 🛶' },
      holding: { buttonLabel: 'pontoon pending 🚤' },
      out:     { buttonLabel: "can't make it 🥲" },
    },

    nudge: {
      t14:    '2 weeks til launch',
      t7:     "7 days, who's hauling the cooler?",
      t3:     '72h — inflate the floaties',
      cutoff: "final count tomorrow, the boat's waiting",
    },

    cta:     { send: 'send it 🛶' },
    caption: { invite: 'lake szn is calling' },
  },
};
