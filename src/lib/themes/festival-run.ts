// Theme: Festival Run. Source: theme content system §07.
// DARK theme. Hint.name uses {festival} per lexicon §5.22.

import type { Theme } from './types';

export const festivalRun: Theme = {
  id: 'festival-run',
  name: 'Festival run',
  type: 'occasion',
  vibe: "it's happening 🔊",

  palette: {
    bg:        '#1a0a2e',
    ink:       '#f4e6ff',
    accent:    '#ff3a8c',
    accent2:   '#5aff9e',
    stickerBg: '#ffe14a',
    stroke:    '#f4e6ff',
    surface:   '#2a1540',
    onSurface: '#f4e6ff',
  },

  strings: {
    vibe: "it's happening 🔊",

    sticker: {
      new:    'new run 🎟️',
      invite: "you're on the list 🎟️",
      locked: "it's happening 🔊",
    },

    marquee: [
      'wristbands on',
      'set times locked',
      'find me at the main stage',
      "who's got the tickets",
      'front row or bust',
    ],

    hint: {
      name:   ({ festival }) => `'${festival ?? 'the festival'} ${new Date().getFullYear()}' does the trick`,
      dates:  'festival dates',
      invite: 'pull the crew in fast — wristbands sell out',
    },

    empty: {
      noActivities: 'add the headliner, add the pregame, add the hotel',
      noExtras:     'packing list for the sun + the rain + the night',
    },

    in:      { button: 'i got my ticket 🎟️' },
    holding: { button: 'working on tickets 🎫' },
    out:     { button: "can't swing it 😩" },

    nudge: {
      t14:    '2 weeks, do you have your wristband?',
      t7:     '7 days, where are we meeting day 1?',
      t3:     '72h, charge your portable battery',
      cutoff: 'final roster tomorrow, see you at the gates',
    },

    cta:     { send: 'send the invite 🎟️' },
    caption: { invite: 'the festival run is on' },

    countdownSignature: 'days until wristbands on',
  },
};
