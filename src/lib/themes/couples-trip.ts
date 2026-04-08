// Theme: Couples Trip. Source: theme content system §04.
// "Group of couples" reframing — NOT romantic-getaway-for-two. The
// 'holding' state uses {partner} per lexicon §5.22.

import type { Theme } from './types';

export const couplesTrip: Theme = {
  id: 'couples-trip',
  name: 'Couples trip',
  type: 'occasion',
  vibe: 'the couples are gathering 💕',

  palette: {
    bg:        '#fde6d4',
    ink:       '#3a1f24',
    accent:    '#c44d3a',
    accent2:   '#5a8f9f',
    stickerBg: '#f4c37a',
    stroke:    '#3a1f24',
    surface:   '#2a1418',
    onSurface: '#fde6d4',
  },

  strings: {
    vibe: 'the couples are gathering 💕',

    sticker: {
      new:    'new rally 🏡',
      invite: "you two are invited 💕",
      locked: 'locked in 🔑',
    },

    marquee: [
      'couples only',
      'bring your person',
      'cabin cooking',
      'wine by the fire',
      'we love the group',
    ],

    hint: {
      name:   'the annual? the cabin weekend?',
      dates:  'when can everyone + plus ones?',
      invite: 'add the couples, not individuals',
    },

    empty: {
      noActivities: 'dinner in, wine out, hike Saturday',
      noExtras:     'playlist? house rules for 4 couples sharing a kitchen?',
    },

    rsvp: {
      in:      { buttonLabel: "we're in 💕" },
      holding: { buttonLabel: ({ partner }) => `checking with ${partner ?? 'my person'}` },
      out:     { buttonLabel: "can't make it 😔" },
    },

    nudge: {
      t14:    '2 weeks — lock it in with your partner',
      t7:     '7 days, groceries are being planned',
      t3:     '72h, final head count tomorrow',
      cutoff: 'the rally closes tomorrow — are you two in?',
    },

    cta:     { send: 'send the invite 💕' },
    caption: { invite: 'the couples are gathering' },
  },
};
