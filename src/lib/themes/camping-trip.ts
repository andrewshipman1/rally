// Theme: Camping Trip. Source: theme content system §15.
// Hint.name uses {place} (the park) per lexicon §5.22.

import type { Theme } from './types';

export const campingTrip: Theme = {
  id: 'camping-trip',
  name: 'Camping trip',
  type: 'setting',
  vibe: 'the fire is calling 🏕️',

  palette: {
    bg:        '#e8e4d4',
    ink:       '#1a2418',
    accent:    '#8a4a1a',
    accent2:   '#4a7a3a',
    stickerBg: '#f4c94a',
    stroke:    '#1a2418',
    surface:   '#1a1a10',
    onSurface: '#e8e4d4',
    hot:       '#d94a2e',
  },

  strings: {
    vibe: 'the fire is calling 🏕️',

    sticker: {
      new:    'new camp 🏕️',
      invite: 'meet at camp 🏕️',
      locked: 'see you at the fire 🔥',
    },

    marquee: [
      'tents up',
      'fire at dusk',
      'no signal, on purpose',
      'stars at 10',
      'coffee on the stove',
    ],

    hint: {
      name:   ({ place }) => `'${place ?? 'yosemite'} ${new Date().getFullYear()}' — make it clear which trip`,
      dates:  "when's the weather good?",
      invite: 'pull the crew in — sites fill up',
    },

    empty: {
      noActivities: 'add the site, add the hike, add the campfire',
      noExtras:     'packing list: headlamp, rain layer, the bourbon',
    },

    in:      { button: 'see you at camp 🏕️' },
    // keep: themed, future-leaning — fits the 🙏 chip.
    holding: { button: 'checking my gear 🎒' },
    out:     { button: 'next fire 🔥' },

    nudge: {
      t14:    '2 weeks, book your site + your flights',
      t7:     '7 days, pack the tent',
      t3:     '72h — check the weather',
      cutoff: 'final count tomorrow, the fire is waiting',
    },

    cta:     { send: 'send it 🏕️' },
    caption: { invite: 'the fire is calling' },

    countdownSignature: 'days until tents up',
  },
};
