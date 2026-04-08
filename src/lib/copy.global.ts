// Surface-agnostic globals per lexicon §5.4.
//
// These two strings are NOT keyed by surface — they're used in the same
// form across builder, invitee, organizer share sheet, every footer.
// Live here so a single grep finds every consumer.
//
// `footer.madeWith` — every page EXCEPT the live trip page.
//   The live trip page renders the poetic footer from
//   tripPageShared.footer.poetic instead. See §5.4 for why.
//
// `shareLink.copy` — any CTA that copies the trip invite URL to clipboard.

export const globalCopy = {
  footer: {
    madeWith: 'made with rally',
  },
  shareLink: {
    copy: 'copy the invite link ↗',
  },
} as const;

export type GlobalCopy = typeof globalCopy;
