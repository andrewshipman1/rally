// Theme: Reunion Weekend. Source: theme content system §06.
// Several strings rely on {n} (year number) and {group} per lexicon §5.22.

import type { Theme } from './types';

export const reunionWeekend: Theme = {
  id: 'reunion-weekend',
  name: 'Reunion weekend',
  type: 'occasion',
  vibe: "we're still doing this 📓",

  palette: {
    bg:        '#f4ede0',
    ink:       '#2a1f18',
    accent:    '#b84a2f',
    accent2:   '#2d6b8f',
    stickerBg: '#f4c94a',
    stroke:    '#2a1f18',
    surface:   '#1a1410',
    onSurface: '#f4ede0',
  },

  strings: {
    vibe: "we're still doing this 📓",

    sticker: {
      new:    'the annual 📓',
      invite: 'still doing it 🫶',
      locked: ({ n }) => `year ${n ?? '?'} 📓`,
    },

    marquee: [
      "we're still doing this",
      ({ n }) => `year ${n ?? '?'}`,
      'the usual suspects',
      'throwback weekend',
      'no excuses',
    ],

    hint: {
      name:   ({ group }) => `'${group ?? 'our'} annual' or whatever we've always called it`,
      dates:  'same weekend as last year?',
      invite: 'pull the original crew in',
    },

    empty: {
      noActivities: 'the usual bar, the usual diner, the usual bad decisions',
      noExtras:     'packing list with one rule: the jersey',
    },

    rsvp: {
      in:      { buttonLabel: "i'm there 🙌" },
      holding: { buttonLabel: 'trying to swing it 🤞' },
      out:     { buttonLabel: "can't this year 😔" },
    },

    nudge: {
      t14:    "2 weeks til the annual — don't break the streak",
      t7:     "7 days, this is the year someone skips — don't be them",
      t3:     '72h, flights are boarding',
      cutoff: ({ n }) => `final yes tomorrow — year ${n ?? '?'} can't wait`,
    },

    cta:     { send: 'send the invite 📓' },
    caption: { invite: 'the annual is back' },
  },
};
