// §5.20 — Lodging voting (the card).
// Voting only exists for lodging in v0. Read-only on the trip page in
// session 1; write-side wired in Session 3.
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const lodgingVoting: Record<string, Templated> = {
  'card.title.open':       'where are we crashing?',
  'card.title.locked':     "where we're crashing 🗝️",
  'pill.open':             'voting open',
  'pill.locked':           'locked in',

  'option.placeholder':    "drop a link, we'll pull the rest",
  'smartLink.sourcePill':  ({ domain }: ThemeVars) => `${domain ?? '?'} ↗`,
  'smartLink.tapHint':     'see it →',

  'tally':                 ({ n }: ThemeVars) => `${n ?? 0} votes`,
  'tally.zero':            'no votes yet',
  'voters':                ({ name1, name2, n }: ThemeVars) =>
    `${name1 ?? '?'}, ${name2 ?? '?'} + ${n ?? 0} more`,

  'vote.cta':              'tap to vote',
  'vote.cta.voted':        'your pick ✓',
  'vote.changeCta':        'change my vote',

  'winnerStamp':           '🗝️',
  'loserLabel':            'not it',

  'organizer.lockCta':     'lock the winner',
  'organizer.lockDisabledTooltip': 'needs at least 2 votes',

  'addOption':             'add another option',
  'empty':                 "drop the first airbnb link. we'll pull the photos, price, everything.",

  'toast.afterVote':       ({ winner_so_far }: ThemeVars) => `vote in. ${winner_so_far ?? '?'} is leading.`,
  'toast.afterLock':       ({ winner }: ThemeVars) => `locked. ${winner ?? '?'} it is.`,
};
