// Theme: Birthday Trip. Source: theme content system §03.
// Marquee + caption rely on {age} and {name} vars per lexicon §5.22.

import type { Theme } from './types';

export const birthdayTrip: Theme = {
  id: 'birthday-trip',
  name: 'Birthday trip',
  type: 'occasion',
  vibe: 'their big one 🎂',

  palette: {
    bg:        '#fff5e1',
    ink:       '#2a1a0f',
    accent:    '#ff4757',
    accent2:   '#4d9fff',
    stickerBg: '#ffd84d',
    stroke:    '#2a1a0f',
    surface:   '#3a1f24',
    onSurface: '#fff5e1',
    hot:       '#ff2e7e',
  },

  strings: {
    vibe: 'their big one 🎂',

    sticker: {
      new:    'new birthday 🎈',
      invite: "you're invited 🎂",
      locked: "it's on 🎉",
    },

    marquee: [
      ({ age }) => `turning ${age ?? 'it'}`,
      'cake mandatory',
      'dress to party',
      'the big one',
      'we love you',
    ],

    hint: {
      name:   ({ name }) => `something like '${name ?? 'their'}s 30th'`,
      dates:  "when's the birthday weekend?",
      invite: 'pull the friends in',
    },

    empty: {
      noActivities: 'add the dinner, add the bar, add the recovery brunch',
      noExtras:     'playlist for the birthday kid?',
    },

    in:      { button: "i'll be there 🎉" },
    holding: { button: 'trying 🙏' },
    out:     { button: "can't make it 💔" },

    nudge: {
      t14:    "2 weeks til the birthday — who's in?",
      t7:     '7 days out, reservations dropping',
      t3:     '72h, the birthday kid is asking about you',
      cutoff: "final count tomorrow, don't leave them hanging",
    },

    cta:     { send: 'send the invite 🎉' },
    caption: { invite: ({ name, age }) => `${name ?? 'someone'} is turning ${age ?? '!'}` },

    countdownSignature: 'days until the big one',
  },
};
