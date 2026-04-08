// Theme: Beach Trip. Source: theme content system §08.
// Distinct from Tropical — domestic US coast.

import type { Theme } from './types';

export const beachTrip: Theme = {
  id: 'beach-trip',
  name: 'Beach trip',
  type: 'setting',
  vibe: 'sand szn 🏖️',

  palette: {
    bg:        '#e6f6f4',
    ink:       '#0a2a3a',
    accent:    '#ff6a3d',
    accent2:   '#ffd84d',
    stickerBg: '#ffd84d',
    stroke:    '#0a2a3a',
    surface:   '#0a3a4a',
    onSurface: '#e6f6f4',
  },

  strings: {
    vibe: 'sand szn 🏖️',

    sticker: {
      new:    'new beach 🏖️',
      invite: 'sand szn 🏖️',
      locked: "we're going 🌊",
    },

    marquee: [
      'toes in',
      'sunscreen check',
      'beers on the beach',
      'sunset walk',
      'rosé all day',
    ],

    hint: {
      name:   'which beach, which year?',
      dates:  "when's the water warm?",
      invite: 'pull the crew in',
    },

    empty: {
      noActivities: 'add the house, add the restaurant, add the boat day',
      noExtras:     'packing list: swimsuit, backup swimsuit',
    },

    rsvp: {
      in:      { buttonLabel: 'sand szn 🏖️' },
      holding: { buttonLabel: 'checking the calendar 📅' },
      out:     { buttonLabel: "can't make it 🥲" },
    },

    nudge: {
      t14:    '2 weeks til toes in',
      t7:     '7 days, grocery run being planned',
      t3:     '72h — start the packing',
      cutoff: 'final count tomorrow, house is splitting cost',
    },

    cta:     { send: 'send the invite 🏖️' },
    caption: { invite: 'sand szn is on' },
  },
};
