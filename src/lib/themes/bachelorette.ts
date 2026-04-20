// Theme: Bachelorette. Source: theme content system §01 + lexicon §6.

import type { Theme } from './types';

export const bachelorette: Theme = {
  id: 'bachelorette',
  name: 'Bachelorette',
  type: 'occasion',
  vibe: 'her last weekend ✨',

  palette: {
    bg:        '#fde9ed',
    ink:       '#1a0a12',
    accent:    '#ff2e7e',
    accent2:   '#c4ff7a',
    stickerBg: '#ffe45a',
    stroke:    '#1a0a12',
    surface:   '#2a1018',
    onSurface: '#fde9ed',
    hot:       '#ec4899',
  },

  strings: {
    vibe: 'her last weekend ✨',

    sticker: {
      new:    'new bach ✨',
      invite: "you're invited 💍",
      locked: 'last hurrah 🥂',
    },

    marquee: [
      'bride to be',
      'matching tees',
      'drinks on her',
      'dance floor destroyer',
      'say yes to the dress code',
    ],

    hint: {
      name:   'something only the bride will get',
      dates:  "when's her last weekend?",
      invite: 'pull the bridal party in',
    },

    empty: {
      noActivities: 'add the brunch, add the club, add the aftermath',
      noExtras:     'playlist? packing list? mandatory matching pjs?',
    },

    in:      { button: "i'm in 💅" },
    holding: { button: 'hold my seat 💭' },
    out:     { button: "can't make it 😭" },

    nudge: {
      t14:    "the bride wants to know who's in",
      t7:     'maid of honor is counting you',
      t3:     '72h til the bach rally — get in or forever hold',
      cutoff: 'pencils down, bride sees the final list tomorrow',
    },

    cta:     { send: 'send the invite 💌' },
    caption: { invite: 'her last free weekend' },

    fomoFlag:           'i do, i do',
    ctaEmoji:           '💍',
    countdownSignature: 'days until "i do"',
  },
};
