// Theme: Ski Chalet. Source: theme content system §09.
// Hint.name uses {mountain} per lexicon §5.22.

import type { Theme } from './types';

export const skiChalet: Theme = {
  id: 'ski-chalet',
  name: 'Ski chalet',
  type: 'setting',
  vibe: 'send it 🎿',

  palette: {
    bg:        '#f1ebd9',
    ink:       '#1a1f1a',
    accent:    '#c44d3a',
    accent2:   '#d9a344',
    stickerBg: '#f4e4a0',
    stroke:    '#1a1f1a',
    surface:   '#1a2018',
    onSurface: '#f1ebd9',
    hot:       '#e63946',
  },

  strings: {
    vibe: 'send it 🎿',

    sticker: {
      new:    'new ski trip 🎿',
      invite: 'send it ❄️',
      locked: 'the mountain is open 🏔️',
    },

    marquee: [
      'first chair 7am',
      'après at 3',
      'hot tub at 9',
      'the mountain is open',
      'send it',
    ],

    hint: {
      name:   ({ mountain }) => `'${mountain ?? 'the mountain'} ${new Date().getFullYear()}' or something sillier`,
      dates:  'when is the snow good?',
      invite: 'pull the crew in',
    },

    empty: {
      noActivities: 'add the cabin, add the mountain, add après',
      noExtras:     'packing list: long johns, hand warmers, the flask',
    },

    in:      { button: 'send it 🎿' },
    holding: { button: 'checking the pass 🎫' },
    out:     { button: "can't swing it ❄️" },

    nudge: {
      t14:    '2 weeks til first chair',
      t7:     '7 days, tune your edges',
      t3:     '72h — check the forecast',
      cutoff: "final count tomorrow, mountain's calling",
    },

    cta:     { send: 'send it 🎿' },
    caption: { invite: 'the mountain is calling' },

    countdownSignature: 'days until first chair',
  },
};
