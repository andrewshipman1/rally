// Theme: Tropical. Source: theme content system §16.
// Hint.name uses {island} per lexicon §5.22.
// Distinct from Beach — passport-required.

import type { Theme } from './types';

export const tropical: Theme = {
  id: 'tropical',
  name: 'Tropical',
  type: 'setting',
  vibe: 'island time 🌴',

  palette: {
    bg:        '#e4f4e8',
    ink:       '#0a2a1f',
    accent:    '#ff5a3a',
    accent2:   '#3ab8d4',
    stickerBg: '#ffd84d',
    stroke:    '#0a2a1f',
    surface:   '#0a2418',
    onSurface: '#e4f4e8',
  },

  strings: {
    vibe: 'island time 🌴',

    sticker: {
      new:    'new escape 🌴',
      invite: 'island time 🌴',
      locked: 'passports ready 🛂',
    },

    marquee: [
      'island time',
      'barefoot bar',
      'reef by day',
      'hibiscus at sunset',
      'no signal except sun',
    ],

    hint: {
      name:   ({ island }) => `'${island ?? 'tulum'} ${new Date().getFullYear()}'`,
      dates:  'when can we all get passports aligned?',
      invite: 'pull the crew in early — flights',
    },

    empty: {
      noActivities: 'add the resort, add the snorkel day, add the beach dinner',
      noExtras:     'packing list: reef-safe sunscreen, 2 swimsuits, the good shirt',
    },

    rsvp: {
      in:      { buttonLabel: 'island time 🌴' },
      holding: { buttonLabel: 'checking flights ✈️' },
      out:     { buttonLabel: "can't this year 🥲" },
    },

    nudge: {
      t14:    '2 weeks, is your passport ready?',
      t7:     '7 days, confirm your flights',
      t3:     '72h — pack the sunscreen',
      cutoff: 'final roster tomorrow — we\'re leaving',
    },

    cta:     { send: 'send it 🌴' },
    caption: { invite: 'we\'re leaving the country' },
  },
};
