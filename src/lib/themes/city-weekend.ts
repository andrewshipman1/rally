// Theme: City Weekend. Source: theme content system §11.
// DARK theme. Hint.name uses {city} per lexicon §5.22.

import type { Theme } from './types';

export const cityWeekend: Theme = {
  id: 'city-weekend',
  name: 'City weekend',
  type: 'setting',
  vibe: 'the city is calling 🌃',

  palette: {
    bg:        '#141416',
    ink:       '#f4ede0',
    accent:    '#ff2e7e',
    accent2:   '#2dd4d4',
    stickerBg: '#ffd84d',
    stroke:    '#f4ede0',
    surface:   '#2a2a2e',
    onSurface: '#f4ede0',
  },

  strings: {
    vibe: 'the city is calling 🌃',

    sticker: {
      new:    'new city rally 🌃',
      invite: 'the city is calling 🌃',
      locked: 'locked in 🌃',
    },

    marquee: [
      'the city is ours',
      'dinner at 9',
      'late drinks',
      'walk home at 3',
      "everything's open",
    ],

    hint: {
      name:   ({ city }) => `'${city ?? 'NYC'} ${new Date().toLocaleString('en', { month: 'short' }).toLowerCase()}' works`,
      dates:  'which weekend?',
      invite: 'pull the crew in',
    },

    empty: {
      noActivities: 'add the restaurant, add the bar, add the show',
      noExtras:     'playlist? walking shoes?',
    },

    rsvp: {
      in:      { buttonLabel: "i'm in 🌃" },
      holding: { buttonLabel: 'checking the calendar 📅' },
      out:     { buttonLabel: "can't make it 😔" },
    },

    nudge: {
      t14:    '2 weeks, reservations are dropping',
      t7:     '7 days, lock the dinner spot',
      t3:     '72h — pack the black stuff',
      cutoff: 'final count tomorrow, the city is waiting',
    },

    cta:     { send: 'send it 🌃' },
    caption: { invite: 'the city weekend is on' },
  },
};
