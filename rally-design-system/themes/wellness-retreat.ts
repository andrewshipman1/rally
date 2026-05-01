// Theme: Wellness Retreat. Source: theme content system §05.

import type { Theme } from './types';

export const wellnessRetreat: Theme = {
  id: 'wellness-retreat',
  name: 'Wellness retreat',
  type: 'occasion',
  vibe: 'reset mode 🌿',

  palette: {
    bg:        '#eaeee4',
    ink:       '#1a3329',
    accent:    '#b87628',
    accent2:   '#7aa86a',
    stickerBg: '#f4e4a0',
    stroke:    '#1a3329',
    surface:   '#1a2a22',
    onSurface: '#eaeee4',
    hot:       '#d94a2e',
  },

  strings: {
    vibe: 'reset mode 🌿',

    sticker: {
      new:    'new reset 🌿',
      invite: "you're invited 🧘",
      locked: "we're doing it 🍵",
    },

    marquee: [
      'reset mode',
      'sunrise yoga',
      'green juice mandatory',
      'natural wine only',
      'what happens at the retreat',
    ],

    hint: {
      name:   'the annual reset',
      dates:  'when do we all need this?',
      invite: 'bring the ones who need it',
    },

    empty: {
      noActivities: 'add the yoga, add the hike, add the group dinner',
      noExtras:     'playlist? packing list? group journaling exercise?',
    },

    in:      { button: 'i need this 🧘' },
    holding: { button: 'manifesting 🌙' },
    out:     { button: "can't rn 🙏" },

    nudge: {
      t14:    '2 weeks to reset mode',
      t7:     '7 days, start tapering the caffeine',
      t3:     '72h, pack your mat',
      cutoff: 'final yes needed — class sizes matter',
    },

    cta:     { send: 'send the invite 🌿' },
    caption: { invite: 'everyone needs a reset' },

    countdownSignature: 'days until reset mode',
  },
};
