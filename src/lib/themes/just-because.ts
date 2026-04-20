// Theme: Just Because — the neutral default. The picker fallback when no
// other theme fits, and the reference shape every other theme is copied
// from. Source: rally-theme-content-system.md §17, lexicon §6 row "Just
// Because".
//
// The palette here matches the :root block in src/app/globals.css. Keep
// them in sync — if you change one, change the other.

import type { Theme } from './types';

export const justBecause: Theme = {
  id: 'just-because',
  name: 'Just because',
  type: 'default',
  vibe: 'because we felt like it ✨',

  palette: {
    bg:        '#fafafa',
    ink:       '#1a1a1a',
    accent:    '#fa581e',
    accent2:   '#1fa8ff',
    stickerBg: '#ffd84d',
    stroke:    '#1a1a1a',
    surface:   '#1a1a1a',
    onSurface: '#fafafa',
    hot:       '#fa581e',
  },

  // Optional dark variant: the only theme shipping one in step 1.
  paletteDark: {
    bg:        '#0e0e10',
    ink:       '#fafafa',
    surface:   '#fafafa',
    onSurface: '#0e0e10',
    stroke:    '#fafafa',
  },

  strings: {
    vibe: 'because we felt like it ✨',

    sticker: {
      new:    'new rally ✨',
      invite: "you're invited 💌",
      locked: "it's on 🚀",
    },

    marquee: [
      'why not',
      "we don't need a reason",
      'just go',
      'pack a bag',
      'send it',
    ],

    hint: {
      name:   'give it a name only your group would get',
      dates:  'when are we doing this?',
      invite: "who's in?",
    },

    empty: {
      noActivities: 'add the first thing that makes it feel real',
      noExtras:     'packing list? playlist? whatever helps',
    },

    in:      { button: "i'm in 🙌" },
    holding: { button: 'hold my seat 🧗' },
    out:     { button: "can't make it —" },

    nudge: {
      t14:    '2 weeks out, who\'s locked in?',
      t7:     '7 days, who else?',
      t3:     '72h til go time',
      cutoff: 'final count tomorrow — last call',
    },

    cta:     { send: 'send it 🚀' },
    caption: { invite: "something's happening" },

    // ─── Lexicon §6 themed microcopy ───
    fomoFlag:           'lfg',
    ctaEmoji:           '🔥',
    countdownSignature: 'days until liftoff',
    buzzPlaceholder:    "what's the word?",
    crewSectionCaptions: {
      in:      'locked and loaded',
      holding: 'thinking about it',
      out:     'catch the next one',
    },
    signatureReaction: '🔥',
  },
};
